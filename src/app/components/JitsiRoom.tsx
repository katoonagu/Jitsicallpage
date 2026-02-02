import { useState, Dispatch, SetStateAction, MutableRefObject } from 'react';
import svgPaths from '@/imports/svg-ibsq2di4qw';
import { ChevronLeft, Mic, MicOff, Video, VideoOff, MonitorUp, MessageSquare, Users, MoreHorizontal, PhoneOff } from 'lucide-react';

interface JitsiRoomProps {
  roomName: string;
  userName: string;
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
}

export default function JitsiRoom({ roomName, userName }: JitsiRoomProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [participants, setParticipants] = useState([
    { id: 1, name: userName || 'You', initial: userName ? userName[0].toUpperCase() : 'Y', color: '#df486f', isMuted: false }
  ]);

  // Generate avatar initial and color
  const getAvatarProps = (name: string, index: number) => {
    const colors = ['#df486f', '#4380e2', '#44a5ff', '#e24343', '#43e287'];
    return {
      initial: name ? name[0].toUpperCase() : '?',
      color: colors[index % colors.length]
    };
  };

  const currentUser = participants[0];
  const otherParticipants = participants.slice(1);

  return (
    <div className="relative w-full h-screen bg-[#040404] flex overflow-hidden">
      {/* Sidebar - выдвижная панель */}
      <div 
        className={`absolute top-0 left-0 h-full bg-[#1c1c1c] transition-transform duration-300 z-10 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '137px' }}
      >
        {/* Current user (me) - top */}
        <div className="p-2">
          <div className="relative w-[124px] h-[124px] bg-[#292929] rounded-[4px] overflow-hidden">
            {/* Avatar */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-[33.5px] h-[33.5px] rounded-full flex items-center justify-center"
                style={{ backgroundColor: currentUser.color }}
              >
                <span className="text-white font-semibold text-[13.4px]">
                  {currentUser.initial}
                </span>
              </div>
            </div>

            {/* Mic icon */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-[2px]">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-[5px] h-[5px] rounded-[2.5px] ${currentUser.isMuted ? 'opacity-0' : 'bg-[#44a5ff]'}`} 
                />
              ))}
            </div>

            {/* Name overlay */}
            <div className="absolute bottom-[2px] left-[2px] right-[2px] p-1">
              <div className="bg-[rgba(0,0,0,0.7)] px-2 py-1 rounded flex items-center gap-2 max-w-[136px]">
                {currentUser.isMuted && (
                  <MicOff className="w-4 h-4 text-white" />
                )}
                <span className="text-white text-[12px] font-semibold truncate">
                  {currentUser.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Other participants */}
        <div className="flex-1 overflow-auto pb-[130px]">
          {otherParticipants.map((participant, index) => (
            <div key={participant.id} className="p-2">
              <div className="relative w-[124px] h-[124px] bg-[#292929] rounded-[4px] overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center bg-[rgba(4,4,4,0.8)]">
                  <div 
                    className="w-[60px] h-[60px] rounded-full flex items-center justify-center"
                    style={{ backgroundColor: participant.color }}
                  >
                    <span className="text-white font-semibold text-[24px]">
                      {participant.initial}
                    </span>
                  </div>
                </div>

                {/* Name overlay */}
                <div className="absolute bottom-[2px] left-[2px] w-[120px] p-1">
                  <div className="bg-[rgba(0,0,0,0.7)] px-2 py-1 rounded flex items-center gap-2">
                    {participant.isMuted && (
                      <MicOff className="w-4 h-4 text-white" />
                    )}
                    <span className="text-white text-[12px] font-semibold truncate">
                      {participant.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Toggle sidebar button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-[26px] top-1/2 -translate-y-1/2 w-6 h-8 bg-[rgba(51,51,51,0.5)] hover:bg-[rgba(51,51,51,0.7)] rounded flex items-center justify-center -rotate-90 transition-colors"
        >
          <div className="rotate-90">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d={svgPaths.p12a59980} fill="white" />
            </svg>
          </div>
        </button>
      </div>

      {/* Toggle button when sidebar is closed */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-8 bg-[rgba(51,51,51,0.5)] hover:bg-[rgba(51,51,51,0.7)] rounded flex items-center justify-center -rotate-90 transition-colors z-20"
        >
          <div className="rotate-90">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d={svgPaths.p12a59980} fill="white" />
            </svg>
          </div>
        </button>
      )}

      {/* Main content area */}
      <div className="flex-1 relative">
        {/* Top bar with room name and time */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-center pt-5 z-10">
          <div className="flex items-center gap-0">
            <div className="bg-[rgba(0,0,0,0.6)] px-4 py-[2px] rounded-l-[6px] max-w-[324px]">
              <span className="text-white text-[14px] font-['Arial'] truncate">
                {roomName || 'Casual Prizes Rely Strangely'}
              </span>
            </div>
            <div className="bg-[rgba(0,0,0,0.8)] px-2 py-[6px] rounded-r-[6px]">
              <span className="text-white text-[12px]">
                {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <button className="ml-0.5 bg-[#e0e0e0] w-7 h-7 rounded flex items-center justify-center hover:bg-[#d0d0d0] transition-colors">
              <ChevronLeft className="w-4 h-4 text-[#040404]" />
            </button>
          </div>
        </div>

        {/* Center - Main participant or self */}
        <div className="absolute inset-0 flex items-center justify-center">
          {otherParticipants.length > 0 ? (
            // Show other participant
            <div className="flex flex-col items-center">
              <div 
                className="w-[200px] h-[200px] rounded-full flex items-center justify-center"
                style={{ backgroundColor: otherParticipants[0].color }}
              >
                <span className="text-white font-['Arial'] text-[80px] leading-[114px]">
                  {otherParticipants[0].initial}
                </span>
              </div>
              <div className="mt-[88px] bg-[rgba(0,0,0,0.6)] px-4 py-[1.5px] rounded-[3px]">
                <span className="text-white text-[15.2px] font-['Arial']">
                  {otherParticipants[0].name}
                </span>
              </div>
            </div>
          ) : (
            // Show self when alone
            <div className="flex flex-col items-center">
              <div 
                className="w-[200px] h-[200px] rounded-full flex items-center justify-center"
                style={{ backgroundColor: currentUser.color }}
              >
                <span className="text-white font-['Arial'] text-[80px] leading-[114px]">
                  {currentUser.initial}
                </span>
              </div>
              <div className="mt-[88px] bg-[rgba(0,0,0,0.6)] px-4 py-[1.5px] rounded-[3px]">
                <span className="text-white text-[15.2px] font-['Arial']">
                  {currentUser.name}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Logo */}
        <a 
          href="https://jitsi.org/" 
          className="absolute top-8 left-8 w-[71px] h-8"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="71" height="32" viewBox="0 0 71 32" fill="none">
            <g clipPath="url(#clip0_1_107)">
              <path d={svgPaths.p187d5d00} fill="white" />
              <path d={svgPaths.p373a8600} fill="white" />
              <path d={svgPaths.p1981b00} fill="white" />
              <path d={svgPaths.p1c73ca00} fill="white" />
              <path d={svgPaths.p883c300} fill="white" />
              <path d={svgPaths.p30fb000} fill="white" />
            </g>
            <defs>
              <clipPath id="clip0_1_107">
                <rect fill="white" height="32" width="71" />
              </clipPath>
            </defs>
          </svg>
        </a>

        {/* Bottom toolbar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-6">
          <div className="flex items-center gap-2 bg-[rgba(0,0,0,0.3)] px-4 py-2 rounded-lg">
            {/* Mic button */}
            <button
              onClick={() => setIsMicMuted(!isMicMuted)}
              className={`w-12 h-12 rounded-[3px] flex items-center justify-center transition-colors ${
                isMicMuted ? 'bg-[#c2c2c2]' : 'bg-[#3d3d3d]'
              }`}
            >
              {isMicMuted ? (
                <MicOff className="w-6 h-6 text-[#858585]" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>

            {/* Camera button */}
            <button
              onClick={() => setIsCameraOff(!isCameraOff)}
              className={`w-12 h-12 rounded-[3px] flex items-center justify-center transition-colors ${
                isCameraOff ? 'bg-[#c2c2c2]' : 'bg-[#3d3d3d]'
              }`}
            >
              {isCameraOff ? (
                <VideoOff className="w-6 h-6 text-[#858585]" />
              ) : (
                <Video className="w-6 h-6 text-white" />
              )}
            </button>

            {/* Share screen button */}
            <button className="w-12 h-12 rounded-[3px] bg-transparent flex items-center justify-center hover:bg-[rgba(255,255,255,0.1)] transition-colors">
              <MonitorUp className="w-6 h-6 text-white" />
            </button>

            {/* Chat button */}
            <button className="w-12 h-12 rounded-[3px] bg-transparent flex items-center justify-center hover:bg-[rgba(255,255,255,0.1)] transition-colors">
              <MessageSquare className="w-6 h-6 text-white" />
            </button>

            {/* Raise hand button */}
            <button className="w-12 h-12 rounded-[3px] bg-transparent flex items-center justify-center hover:bg-[rgba(255,255,255,0.1)] transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d={svgPaths.p2cb6fc00} fill="white" />
                <path fillRule="evenodd" clipRule="evenodd" d={svgPaths.p17b686f0} fill="white" />
              </svg>
            </button>

            {/* Participants button */}
            <button className="w-12 h-12 rounded-[3px] bg-transparent flex items-center justify-center hover:bg-[rgba(255,255,255,0.1)] transition-colors relative">
              <Users className="w-6 h-6 text-white" />
              {participants.length > 1 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {participants.length}
                </div>
              )}
            </button>

            {/* More options button */}
            <button className="w-12 h-12 rounded-[3px] bg-transparent flex items-center justify-center hover:bg-[rgba(255,255,255,0.1)] transition-colors">
              <MoreHorizontal className="w-6 h-6 text-white" />
            </button>

            {/* Hang up button */}
            <button className="w-12 h-12 rounded-[3px] bg-[#df2020] hover:bg-[#c41c1c] flex items-center justify-center transition-colors ml-2">
              <PhoneOff className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}