import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { AccessToken } from 'npm:livekit-server-sdk@2.7.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { hostDisplayName, title } = await req.json();

    if (!hostDisplayName) {
      return new Response(
        JSON.stringify({ error: 'hostDisplayName is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // LiveKit environment variables
    const livekitUrl = Deno.env.get('LIVEKIT_URL')!;
    const livekitApiKey = Deno.env.get('LIVEKIT_API_KEY')!;
    const livekitApiSecret = Deno.env.get('LIVEKIT_API_SECRET')!;
    const appBaseUrl = Deno.env.get('APP_BASE_URL') || 'https://stray-bone-61183886.figma.site';

    if (!livekitUrl || !livekitApiKey || !livekitApiSecret) {
      console.error('❌ Missing LiveKit credentials');
      throw new Error('LiveKit credentials not configured');
    }

    // Generate unique room slug and room ID
    const roomSlug = Math.random().toString(36).substring(2, 10);
    const roomId = crypto.randomUUID();
    const identity = `host_${crypto.randomUUID()}`;
    
    console.log('🚀 Creating room:', { roomSlug, roomId, hostDisplayName });

    // Create Supabase client for KV store
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store room data in KV store
    const roomData = {
      id: roomId,
      slug: roomSlug,
      livekitRoomName: roomSlug, // LiveKit использует slug как имя комнаты
      title: title || `${hostDisplayName}'s Meeting`,
      hostName: hostDisplayName,
      hostIdentity: identity,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const { error: kvError } = await supabase
      .from('kv_store_039e5f24')
      .insert({
        key: `room:${roomSlug}`,
        value: roomData,
      });

    if (kvError) {
      console.error('❌ KV Store Error:', kvError);
      throw kvError;
    }

    console.log('✅ Room saved to KV store:', roomData);

    // Generate JWT token for the host (moderator)
    const token = new AccessToken(livekitApiKey, livekitApiSecret, {
      identity: identity,
      name: hostDisplayName,
      ttl: '2h',
    });

    // Grant full permissions for the host
    token.addGrant({
      roomJoin: true,
      room: roomSlug,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      canUpdateOwnMetadata: true,
      roomAdmin: true,
      roomCreate: true,
      roomRecord: true,
    });

    const jwt = await token.toJwt();
    console.log('✅ JWT token generated for host');

    // Return response
    const inviteLink = `${appBaseUrl}?room=${roomSlug}`;
    
    return new Response(
      JSON.stringify({
        roomSlug,
        roomName: roomSlug, // LiveKit room name
        roomId,
        inviteLink,
        token: jwt,
        livekitUrl,
        identity,
        role: 'moderator',
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error creating room:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
