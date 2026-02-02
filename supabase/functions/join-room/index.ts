import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { create, getNumericDate } from 'https://deno.land/x/djwt@v2.8/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Jitsi JWT Configuration
const JITSI_APP_ID = Deno.env.get('JITSI_APP_ID') || 'vpaas-magic-cookie-YOUR_APP_ID';
const JITSI_KEY_ID = Deno.env.get('JITSI_KEY_ID') || 'vpaas/YOUR_KEY_ID';
const JITSI_PRIVATE_KEY = Deno.env.get('JITSI_PRIVATE_KEY') || '';
const JITSI_DOMAIN = Deno.env.get('JITSI_DOMAIN') || '8x8.vc';

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

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get room data from KV store
    const { data: roomRecord, error: kvError } = await supabase
      .from('kv_store_039e5f24')
      .select('value')
      .eq('key', `room:${slug}`)
      .single();

    if (kvError || !roomRecord) {
      console.error('Room not found:', slug);
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

    // Determine if user is moderator (host)
    const isModerator = displayName === roomData.hostName;
    const identity = crypto.randomUUID();

    // Generate JWT token for Jitsi
    let token = '';
    
    if (JITSI_PRIVATE_KEY) {
      // Generate real JWT token (if private key is provided)
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        aud: JITSI_APP_ID,
        iss: JITSI_APP_ID,
        sub: JITSI_DOMAIN,
        room: slug,
        exp: getNumericDate(60 * 60 * 2), // 2 hours
        context: {
          user: {
            id: identity,
            name: displayName,
            avatar: '',
            email: '',
            moderator: isModerator,
          },
          features: {
            livestreaming: isModerator,
            recording: isModerator,
            transcription: false,
          },
        },
      };

      const key = await crypto.subtle.importKey(
        'pkcs8',
        new TextEncoder().encode(atob(JITSI_PRIVATE_KEY)),
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
      );

      token = await create({ alg: 'RS256', typ: 'JWT', kid: JITSI_KEY_ID }, payload, key);
    } else {
      // Mock token for development (Jitsi will work without JWT on meet.jit.si)
      console.warn('⚠️ No JITSI_PRIVATE_KEY found - using mock token');
      token = 'mock-jwt-token-for-development';
    }

    console.log('✅ JWT token generated for:', displayName, 'role:', isModerator ? 'moderator' : 'participant');

    // Return response
    return new Response(
      JSON.stringify({
        jitsiUrl: JITSI_DOMAIN,
        roomName: slug,
        token,
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
    console.error('Error joining room:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
