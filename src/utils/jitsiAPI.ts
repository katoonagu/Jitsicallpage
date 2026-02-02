// Jitsi API - вызовы к Supabase Edge Functions

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
  inviteLink: string;
  roomId: string;
}> => {
  const url = `${SUPABASE_URL}/functions/v1/create-room`;
  console.log('🚀 [API] Создание комнаты...', { 
    hostDisplayName, 
    title,
    url,
    supabaseUrl: SUPABASE_URL,
    hasAnonKey: !!SUPABASE_ANON_KEY
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

    console.log('📡 [API] Response status:', response.status);
    console.log('📡 [API] Response ok:', response.ok);

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ [API] Ошибка создания комнаты:', error);
      throw new Error(`Failed to create room: ${error}`);
    }

    const data = await response.json();
    console.log('✅ [API] Комната создана:', data);

    return data;
  } catch (error) {
    console.error('❌ [API] Критическая ошибка при создании комнаты:', error);
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
  jitsiUrl: string;
  roomName: string;
  token: string;
  identity: string;
  role: 'moderator' | 'participant';
  displayName: string;
}> => {
  console.log('🚀 [API] Вход в комнату...', { slug, displayName });

  const response = await fetch(`${SUPABASE_URL}/functions/v1/join-room`, {
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
    console.error('❌ [API] Ошибка входа в комнату:', error);
    throw new Error(`Failed to join room: ${error}`);
  }

  const data = await response.json();
  console.log('✅ [API] Токен получен:', { ...data, token: '***' });

  return data;
};

// ========================================
// GET ROOM (Проверка существования комнаты)
// ========================================
export const getRoom = async (
  slug: string
): Promise<{
  slug: string;
  title: string;
  isActive: boolean;
  hostName: string;
  createdAt: string;
} | null> => {
  console.log('🚀 [API] Проверка комнаты...', { slug });

  const response = await fetch(`${SUPABASE_URL}/functions/v1/get-room/${slug}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
    },
  });

  if (response.status === 404) {
    console.log('⚠️ [API] Комната не найдена');
    return null;
  }

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ [API] Ошибка проверки комнаты:', error);
    throw new Error(`Failed to get room: ${error}`);
  }

  const data = await response.json();
  console.log('✅ [API] Комната найдена:', data);

  return data;
};

// ========================================
// END MEETING (Завершение комнаты - только для moderator)
// ========================================
export const endMeeting = async (
  slug: string,
  token: string
): Promise<{ success: boolean }> => {
  console.log('🚀 [API] Завершение комнаты...', { slug });

  const response = await fetch(`${SUPABASE_URL}/functions/v1/end-meeting/${slug}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'apikey': SUPABASE_ANON_KEY,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ [API] Ошибка завершения комнаты:', error);
    throw new Error(`Failed to end meeting: ${error}`);
  }

  const data = await response.json();
  console.log('✅ [API] Комната завершена');

  return data;
};