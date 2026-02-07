// Video compression using FFmpeg.wasm
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let isLoading = false;
let loadPromise: Promise<FFmpeg> | null = null;

// Lazy load FFmpeg (only when needed)
const loadFFmpeg = async (): Promise<FFmpeg> => {
  if (ffmpegInstance) return ffmpegInstance;
  
  if (loadPromise) return loadPromise;
  
  if (isLoading) {
    // Wait for existing load to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    return loadFFmpeg();
  }
  
  isLoading = true;
  
  loadPromise = (async () => {
    try {
      console.log('📦 [FFmpeg] Loading FFmpeg.wasm...');
      
      const ffmpeg = new FFmpeg();
      
      // ✅ Add logging for progress
      ffmpeg.on('log', ({ message }) => {
        console.log(`[FFmpeg] ${message}`);
      });
      
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      
      console.log('✅ [FFmpeg] FFmpeg.wasm loaded successfully');
      
      ffmpegInstance = ffmpeg;
      isLoading = false;
      return ffmpeg;
    } catch (error) {
      isLoading = false;
      loadPromise = null;
      console.error('❌ [FFmpeg] Failed to load FFmpeg.wasm:', error);
      throw error;
    }
  })();
  
  return loadPromise;
};

interface CompressionOptions {
  maxSizeMB?: number;  // Max size in MB (default: 10MB for Telegram compatibility)
  quality?: number;    // Quality 0-51 (lower = better, default: 28)
  maxWidth?: number;   // Max width (default: 1280)
  maxHeight?: number;  // Max height (default: 720)
}

// Compress video blob
export const compressVideo = async (
  videoBlob: Blob,
  options: CompressionOptions = {}
): Promise<Blob> => {
  const {
    maxSizeMB = 10,
    quality = 28,
    maxWidth = 1280,
    maxHeight = 720
  } = options;
  
  const inputSizeMB = videoBlob.size / 1024 / 1024;
  
  // Skip compression if already small enough
  if (inputSizeMB <= maxSizeMB * 0.8) {
    console.log(`⏭️ [FFmpeg] Video already small (${inputSizeMB.toFixed(2)} MB), skipping compression`);
    return videoBlob;
  }
  
  try {
    console.log(`🗜️ [FFmpeg] Compressing video from ${inputSizeMB.toFixed(2)} MB...`);
    
    const ffmpeg = await loadFFmpeg();
    
    // Write input file
    const inputFileName = 'input.webm';
    const outputFileName = 'output.mp4';
    
    await ffmpeg.writeFile(inputFileName, await fetchFile(videoBlob));
    
    // Compression command with aggressive settings
    // -vf scale limits resolution
    // -crf controls quality (0-51, lower = better)
    // -preset ultrafast for speed (can use 'medium' for better compression)
    // -movflags +faststart for streaming
    await ffmpeg.exec([
      '-i', inputFileName,
      '-vf', `scale='min(${maxWidth},iw)':'min(${maxHeight},ih)':force_original_aspect_ratio=decrease`,
      '-c:v', 'libx264',
      '-crf', quality.toString(),
      '-preset', 'ultrafast',
      '-c:a', 'aac',
      '-b:a', '64k',
      '-movflags', '+faststart',
      '-y',
      outputFileName
    ]);
    
    // Read output file
    const data = await ffmpeg.readFile(outputFileName);
    const compressedBlob = new Blob([data], { type: 'video/mp4' });
    
    const outputSizeMB = compressedBlob.size / 1024 / 1024;
    const compressionRatio = ((1 - outputSizeMB / inputSizeMB) * 100).toFixed(1);
    
    console.log(`✅ [FFmpeg] Compressed: ${inputSizeMB.toFixed(2)} MB → ${outputSizeMB.toFixed(2)} MB (${compressionRatio}% reduction)`);
    
    // Cleanup
    await ffmpeg.deleteFile(inputFileName);
    await ffmpeg.deleteFile(outputFileName);
    
    // If still too large, try more aggressive compression
    if (outputSizeMB > maxSizeMB && quality < 40) {
      console.log(`⚠️ [FFmpeg] Still too large, trying more aggressive compression...`);
      return compressVideo(compressedBlob, {
        ...options,
        quality: quality + 5
      });
    }
    
    return compressedBlob;
  } catch (error) {
    console.error('❌ [FFmpeg] Compression failed:', error);
    // Return original blob if compression fails
    return videoBlob;
  }
};

// Check if FFmpeg is available
export const isFFmpegAvailable = async (): Promise<boolean> => {
  try {
    await loadFFmpeg();
    return true;
  } catch {
    return false;
  }
};

// Preload FFmpeg (call on app start)
export const preloadFFmpeg = () => {
  // Load in background without blocking
  loadFFmpeg().catch(() => {
    console.warn('⚠️ [FFmpeg] Preload failed, will load on first use');
  });
};