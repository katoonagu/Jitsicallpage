// IP Geolocation and WebRTC Leak Detection

import { STUN_SERVERS } from './stunServers';

export interface IPGeolocation {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isp?: string;
}

/**
 * Get IP-based geolocation using ipapi.co
 */
export const getIPGeolocation = async (): Promise<IPGeolocation | null> => {
  try {
    console.log('🌐 Получаем IP-геолокацию...');
    
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.reason || 'IP geolocation error');
    }
    
    const result: IPGeolocation = {
      ip: data.ip || 'Unknown',
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'Unknown',
      region: data.region || 'Unknown',
      city: data.city || 'Unknown',
      latitude: parseFloat(data.latitude) || 0,
      longitude: parseFloat(data.longitude) || 0,
      timezone: data.timezone || 'Unknown',
      isp: data.org || undefined
    };
    
    console.log('✅ IP-геолокация получена:', result);
    return result;
  } catch (error) {
    console.error('❌ Ошибка получения IP-геолокации:', error);
    return null;
  }
};

/**
 * Check if IP is private/local (should be filtered out)
 */
const isPrivateIP = (ip: string): boolean => {
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
};

/**
 * WebRTC IP leak detection using STUN servers
 */
export const getWebRTCIPs = (): Promise<string[]> => {
  return new Promise((resolve) => {
    const myPeerConnection = window.RTCPeerConnection || 
                             (window as any).mozRTCPeerConnection || 
                             (window as any).webkitRTCPeerConnection;
    
    if (!myPeerConnection) {
      console.warn('⚠️ WebRTC не поддерживается');
      resolve([]);
      return;
    }
    
    console.log(`🔍 [WebRTC] Запускаем сбор публичных IP через ${STUN_SERVERS.length} STUN серверов...`);
    
    const localIPs: { [key: string]: boolean } = {};
    const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g;
    const noop = function() {};
    
    function ipIterate(ip: string) {
      // Фильтруем локальные/приватные IP
      if (isPrivateIP(ip)) {
        console.log('   🚫 IP отфильтрован (локальный):', ip);
        return;
      }
      
      if (!localIPs[ip]) {
        console.log('   ✅ Публичный IP найден:', ip);
        localIPs[ip] = true;
      }
    }
    
    const connections: RTCPeerConnection[] = [];
    
    try {
      // METHOD 1: ALL STUN servers (270+)
      console.log(`   📡 [Method 1] Создаем соединение с ВСЕМИ ${STUN_SERVERS.length} STUN серверами...`);
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
      
      // METHOD 2: Google STUN (fast fallback)
      console.log('   📡 [Method 2] Создаем быстрое соединение с Google STUN...');
      const pc2 = new myPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:19302" }
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
      
      // Wait 3 seconds for IP collection
      setTimeout(() => {
        console.log('   ⏰ [WebRTC] 3 секунды прошло - завершаем сбор IP...');
        
        connections.forEach((pc, index) => {
          try {
            pc.close();
            console.log(`   🔒 Соединение #${index + 1} закрыто`);
          } catch (e) {
            console.warn(`   ⚠️ Ошибка закрытия соединения #${index + 1}:`, e);
          }
        });
        
        const ips = Object.keys(localIPs);
        console.log(`✅ [WebRTC] Всего найдено ${ips.length} уникальных ПУБЛИЧНЫХ IP:`, ips);
        resolve(ips);
      }, 3000);
      
    } catch (error) {
      console.error('❌ [WebRTC] Ошибка:', error);
      connections.forEach((pc) => {
        try { pc.close(); } catch (e) {}
      });
      resolve([]);
    }
  });
};

/**
 * Get public IP address (simple fallback if WebRTC fails)
 */
export const getPublicIP = async (): Promise<string> => {
  try {
    console.log('🌐 Запрашиваем публичный IP-адрес...');
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    const ip = data.ip || 'Unknown';
    console.log('✅ Публичный IP:', ip);
    return ip;
  } catch (error) {
    console.error('❌ Ошибка получения публичного IP:', error);
    return 'Unknown';
  }
};