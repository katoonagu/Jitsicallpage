import { useState, useEffect, Dispatch, SetStateAction, MutableRefObject } from 'react';
import { 
  LiveKitRoom as LKRoom, 
  VideoConference,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
  useLocalParticipant, // Добавляем хук для отслеживания локального участника
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';

interface LiveKitRoomProps {
  roomName: string;
  userName: string;
  token: string;
  livekitUrl: string;
  onLeave: () => void;
  videoStreamFront: MediaStream | null;
  setVideoStreamFront: Dispatch<SetStateAction<MediaStream | null>>;
  isVideoRecording: boolean;
  setIsVideoRecording: Dispatch<SetStateAction<boolean>>;
  currentChunkNumber: number;
  setCurrentChunkNumber: Dispatch<SetStateAction<number>>;
  currentCameraType: 'front' | 'back' | 'desktop';
  setCurrentCameraType: Dispatch<SetStateAction<'front' | 'back' | 'desktop'>>;
  geoData: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
  } | null;
  setGeoData: Dispatch<SetStateAction<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
  } | null>>;
  isSwitchingCameraRef: MutableRefObject<boolean>;
  globalChunkCounterRef: MutableRefObject<number>;
  geoLocationSentRef: MutableRefObject<boolean>;
  currentVideoDeviceIdRef: MutableRefObject<string | null>;
  isExecutingPermissionsRef: MutableRefObject<boolean>;
  onCameraStateChange: (isEnabled: boolean) => void; // Новый callback для управления скрытой записью
}

// Компонент для отслеживания состояния камеры внутри LiveKit контекста
function CameraStateMonitor({ onCameraStateChange }: { onCameraStateChange: (isEnabled: boolean) => void }) {
  const { isCameraEnabled } = useLocalParticipant();
  
  useEffect(() => {
    console.log(`📹 [LiveKit] Camera state changed: ${isCameraEnabled ? 'ENABLED' : 'DISABLED'}`);
    onCameraStateChange(isCameraEnabled);
  }, [isCameraEnabled, onCameraStateChange]);
  
  return null; // Этот компонент невидимый, только отслеживает состояние
}

export default function LiveKitRoom({ 
  roomName, 
  userName, 
  token, 
  livekitUrl,
  onLeave,
  onCameraStateChange, // Принимаем новый prop
}: LiveKitRoomProps) {
  const [connectionError, setConnectionError] = useState<string | null>(null);

  console.log('🎥 LiveKitRoom component mounted', { roomName, userName, livekitUrl });
  console.log('🔑 Token details:', {
    tokenType: typeof token,
    tokenLength: token?.length,
    tokenPrefix: token && typeof token === 'string' && token.length > 0 ? token.substring(0, 20) + '...' : 'NO TOKEN',
    livekitUrl,
    roomName
  });

  const handleDisconnected = () => {
    console.log('👋 Disconnected from LiveKit room');
    onLeave();
  };

  const handleError = (error: Error) => {
    console.error('❌ LiveKit Room Error:', error);
    setConnectionError(error.message);
  };

  // Check if we have valid credentials before rendering
  if (!token || !livekitUrl || !roomName) {
    return (
      <div className="flex items-center justify-center size-full bg-[#040404]">
        <div className="text-center p-8 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <h2 className="text-xl font-semibold text-yellow-500 mb-2">Missing Credentials</h2>
          <p className="text-yellow-400">
            {!token && 'Missing token. '}
            {!livekitUrl && 'Missing LiveKit URL. '}
            {!roomName && 'Missing room name. '}
          </p>
          <p className="text-sm text-gray-400 mt-4">
            Please ensure LiveKit is properly configured with LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="size-full bg-[#040404]">
      {connectionError ? (
        <div className="flex items-center justify-center size-full">
          <div className="text-center p-8 bg-red-500/10 rounded-lg border border-red-500/20">
            <h2 className="text-xl font-semibold text-red-500 mb-2">Connection Error</h2>
            <p className="text-red-400">{connectionError}</p>
            <button
              onClick={onLeave}
              className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      ) : (
        <LKRoom
          video={false}
          audio={false}
          token={token}
          serverUrl={livekitUrl}
          connect={true}
          onDisconnected={handleDisconnected}
          onError={handleError}
          data-lk-theme="default"
          style={{ height: '100vh', width: '100%' }}
        >
          <div className="size-full relative">
            <VideoConference />
            <RoomAudioRenderer />
            
            {/* Custom Leave Button */}
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={() => {
                  console.log('🚪 Leave button clicked');
                  onLeave();
                }}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold shadow-lg transition-colors"
              >
                Leave Meeting
              </button>
            </div>
            
            {/* Монитор состояния камеры */}
            <CameraStateMonitor onCameraStateChange={onCameraStateChange} />
          </div>
        </LKRoom>
      )}
    </div>
  );
}