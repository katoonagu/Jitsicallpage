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
    const { slug, displayName } = await req.json();

    if (!slug || !displayName) {
      return new Response(
        JSON.stringify({ error: 'slug and displayName are required' }),
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

    if (!livekitUrl || !livekitApiKey || !livekitApiSecret) {
      console.error('❌ Missing LiveKit credentials');
      throw new Error('LiveKit credentials not configured');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Looking for room:', slug);

    // Get room data from KV store
    const { data: roomRecord, error: kvError } = await supabase
      .from('kv_store_039e5f24')
      .select('value')
      .eq('key', `room:${slug}`)
      .single();

    if (kvError || !roomRecord) {
      console.error('❌ Room not found:', slug);
      return new Response(
        JSON.stringify({ error: 'Room not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const roomData = roomRecord.value;

    if (!roomData.isActive) {
      return new Response(
        JSON.stringify({ error: 'Room is no longer active' }),
        { 
          status: 410, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Room found:', roomData);

    // Determine if user is moderator (host)
    const isModerator = displayName === roomData.hostName;
    const identity = isModerator 
      ? roomData.hostIdentity 
      : `participant_${crypto.randomUUID()}`;

    console.log('👤 Joining as:', { displayName, identity, isModerator });

    // Generate JWT token for the participant
    const token = new AccessToken(livekitApiKey, livekitApiSecret, {
      identity: identity,
      name: displayName,
      ttl: '2h',
    });

    // Grant permissions based on role
    if (isModerator) {
      // Full permissions for moderator
      token.addGrant({
        roomJoin: true,
        room: slug,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
        canUpdateOwnMetadata: true,
        roomAdmin: true,
        roomRecord: true,
      });
    } else {
      // Standard permissions for participants
      token.addGrant({
        roomJoin: true,
        room: slug,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
        canUpdateOwnMetadata: true,
      });
    }

    const jwt = await token.toJwt();
    console.log('✅ JWT token generated');

    // Return response
    return new Response(
      JSON.stringify({
        livekitUrl,
        roomName: slug,
        token: jwt,
        identity,
        role: isModerator ? 'moderator' : 'participant',
        displayName,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error joining room:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
