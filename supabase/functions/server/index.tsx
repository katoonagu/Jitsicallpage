import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { AccessToken } from "npm:livekit-server-sdk";

// Force reload - version 2.1
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
function generateLiveKitToken(
  roomName: string,
  identity: string,
  displayName: string,
  isModerator: boolean = false
): string {
  console.log("🔑 [TOKEN GENERATION] Creating token:", { 
    roomName, 
    identity, 
    displayName, 
    isModerator,
    apiKeyPrefix: LIVEKIT_API_KEY?.substring(0, 10),
    secretPrefix: LIVEKIT_API_SECRET?.substring(0, 10),
    livekitUrl: LIVEKIT_URL
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

  const token = at.toJwt();
  console.log("✅ [TOKEN GENERATION] Token created:", {
    length: token?.length,
    type: typeof token,
    isString: typeof token === 'string',
    preview: typeof token === 'string' ? token.substring(0, 50) + '...' : 'NOT A STRING: ' + JSON.stringify(token)
  });
  
  // Convert to string if it's not already
  const tokenString = typeof token === 'string' ? token : String(token);
  console.log("🔄 [TOKEN GENERATION] Token converted to string:", {
    type: typeof tokenString,
    length: tokenString.length,
    preview: tokenString.substring(0, 50) + '...'
  });
  
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
    const token = generateLiveKitToken(roomName, identity, hostDisplayName, true);

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
    const token = generateLiveKitToken(roomName, identity, displayName, isModerator);

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

Deno.serve(app.fetch);