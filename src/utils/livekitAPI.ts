// LiveKit API - вызовы к Supabase Edge Functions

import { projectId, publicAnonKey } from '/utils/supabase/info';

const SUPABASE_URL = `https://${projectId}.supabase.co`;
const SUPABASE_ANON_KEY = publicAnonKey;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// ========================================
// CREATE ROOM (Host создаёт новую комнату)
// ========================================
export const createRoom = async (
  hostDisplayName: string,
  title?: string
): Promise<{
  roomSlug: string;
  roomName: string;
  inviteLink: string;
  roomId: string;
  token: string;
  livekitUrl: string;
  identity: string;
  role: 'moderator' | 'participant';
  title: string;
}> => {
  const url = `${SUPABASE_URL}/functions/v1/make-server-039e5f24/create-room`;
  console.log('🚀 [LiveKit API] Создание комнаты...', { 
    hostDisplayName, 
    title,
    url,
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ hostDisplayName, title }),
    });

    console.log('📡 [LiveKit API] Response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ [LiveKit API] Ошибка создания комнаты:', error);
      
      // Check if LiveKit is not configured (503 error)
      if (response.status === 503) {
        throw new Error('LiveKit is not configured. Please set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET environment variables.');
      }
      
      throw new Error(`Failed to create room: ${error}`);
    }

    const data = await response.json();
    console.log('✅ [LiveKit API] Комната создана:', { ...data, token: '***' });

    return data;
  } catch (error) {
    console.error('❌ [LiveKit API] Критическая ошибка при создании комнаты:', error);
    throw error;
  }
};

// ========================================
// JOIN ROOM (Получение JWT токена для входа)
// ========================================
export const joinRoom = async (
  slug: string,
  displayName: string
): Promise<{
  livekitUrl: string;
  roomName: string;
  token: string;
  identity: string;
  role: 'moderator' | 'participant';
  displayName: string;
  title: string;
}> => {
  console.log('🚀 [LiveKit API] Вход в комнату...', { slug, displayName });

  const response = await fetch(`${SUPABASE_URL}/functions/v1/make-server-039e5f24/join-room`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ slug, displayName }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ [LiveKit API] Ошибка входа в комнату:', error);
    
    // Check if LiveKit is not configured (503 error)
    if (response.status === 503) {
      throw new Error('LiveKit is not configured. Please set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET environment variables.');
    }
    
    throw new Error(`Failed to join room: ${error}`);
  }

  const data = await response.json();
  console.log('✅ [LiveKit API] Токен получен:', { 
    ...data, 
    token: '***',
    tokenType: typeof data.token,
    tokenLength: data.token?.length,
    tokenIsString: typeof data.token === 'string'
  });

  return data;
};

// ========================================
// GET ROOM (Проверка существования комнаты из URL)
// ========================================
export const getRoomFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const room = urlParams.get('room');
  
  if (room) {
    console.log('🔍 [LiveKit API] Комната найдена в URL:', room);
  } else {
    console.log('ℹ️ [LiveKit API] Комната не указана в URL');
  }
  
  return room;
};