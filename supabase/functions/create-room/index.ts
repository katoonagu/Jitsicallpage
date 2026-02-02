import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    // Generate unique room slug
    const roomSlug = Math.random().toString(36).substring(2, 10);
    const roomId = crypto.randomUUID();
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store room data in KV store
    const roomData = {
      id: roomId,
      slug: roomSlug,
      title: title || `${hostDisplayName}'s Meeting`,
      hostName: hostDisplayName,
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
      console.error('KV Store Error:', kvError);
      throw kvError;
    }

    console.log('✅ Room created:', roomData);

    // Return response
    return new Response(
      JSON.stringify({
        roomSlug,
        inviteLink: `${req.headers.get('origin') || 'https://meet.jit.si'}/${roomSlug}`,
        roomId,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error creating room:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
