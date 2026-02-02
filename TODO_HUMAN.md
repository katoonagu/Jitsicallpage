# TODO для ЧЕЛОВЕКА (Настройка Supabase)

## 📋 Шаг 1: Создать Supabase проект

1. ✅ Зайти на https://supabase.com
2. ✅ Создать новый проект (или использовать существующий)
3. ✅ Записать:
   - Project URL: `https://xxx.supabase.co`
   - Anon (public) key: `eyJhbGc...` (Project Settings → API)
   - Service Role key: `eyJhbGc...` (Project Settings → API)

---

## 📋 Шаг 2: Создать таблицы в БД

1. Зайти в **SQL Editor** в Supabase Dashboard
2. Скопировать и выполнить SQL скрипт:

```sql
-- Таблица комнат
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  host_identity TEXT NOT NULL,
  host_display_name TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  passcode_hash TEXT,
  max_participants INTEGER DEFAULT 10
);

CREATE INDEX idx_rooms_slug ON rooms(slug);
CREATE INDEX idx_rooms_is_active ON rooms(is_active);

-- Таблица участников
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  identity TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('moderator', 'participant')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  is_online BOOLEAN DEFAULT true,
  user_agent TEXT,
  ip_address TEXT,
  UNIQUE(room_id, identity)
);

CREATE INDEX idx_participants_room_id ON participants(room_id);
CREATE INDEX idx_participants_is_online ON participants(is_online);

-- Таблица событий (опционально)
CREATE TABLE room_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  participant_identity TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_room_events_room_id ON room_events(room_id);
```

3. Нажать **RUN** для выполнения

---

## 📋 Шаг 3: Установить Supabase CLI (для Edge Functions)

### macOS / Linux:
```bash
brew install supabase/tap/supabase
```

### Windows:
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Проверка установки:
```bash
supabase --version
```

---

## 📋 Шаг 4: Подключиться к проекту

1. Логин в Supabase:
```bash
supabase login
```

2. Инициализация проекта (в корне вашего проекта):
```bash
supabase init
```

3. Связать с вашим Supabase проектом:
```bash
supabase link --project-ref <your-project-id>
```

> **Где найти project-id?**  
> Project Settings → General → Reference ID (например: `abcdefghijklmnop`)

---

## 📋 Шаг 5: Создать Edge Functions локально

После того как AI создаст файлы в папке `supabase/functions/`, нужно:

1. Деплоить каждую функцию:
```bash
supabase functions deploy create-room
supabase functions deploy join-room
supabase functions deploy get-room
```

2. Установить secrets (переменные окружения):
```bash
supabase secrets set JITSI_APP_ID=your-app-id
supabase secrets set JITSI_APP_SECRET=your-secret-key
supabase secrets set JITSI_DOMAIN=meet.jit.si
```

> **⚠️ Для Jitsi tokens нужно:**
> - `JITSI_APP_ID` - любая строка (например: `my-jitsi-app`)
> - `JITSI_APP_SECRET` - случайный секретный ключ (сгенерировать можно через `openssl rand -base64 32`)
> - `JITSI_DOMAIN` - `meet.jit.si` (публичный инстанс) или свой домен

3. Проверить что функции задеплоены:
```bash
supabase functions list
```

---

## 📋 Шаг 6: Настроить CORS для Edge Functions

В Supabase Dashboard:

1. **Settings** → **API**
2. Найти секцию **CORS**
3. Добавить:
   - `http://localhost:5173` (для разработки)
   - Ваш production домен (когда будет)

---

## 📋 Шаг 7: Добавить переменные окружения в проект

Создать файл `.env.local` в корне проекта:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

> ⚠️ **Не коммитить .env.local в Git!**

---

## 📋 Шаг 8: Проверка что всё работает

1. Убедиться что таблицы созданы (Supabase → Table Editor)
2. Убедиться что Edge Functions задеплоены (Supabase → Edge Functions)
3. Убедиться что secrets установлены:
```bash
supabase secrets list
```

---

## 🎯 Финальный чеклист

- [ ] Supabase проект создан
- [ ] Таблицы rooms, participants, room_events созданы
- [ ] Supabase CLI установлен
- [ ] Связь с проектом установлена (`supabase link`)
- [ ] Edge Functions задеплоены
- [ ] Secrets (JITSI_APP_ID, JITSI_APP_SECRET) установлены
- [ ] CORS настроен для localhost:5173
- [ ] `.env.local` создан с правильными ключами

---

## ❓ Частые вопросы

### Где взять JITSI_APP_SECRET?
Сгенерировать случайную строку:
```bash
openssl rand -base64 32
```

### Как посмотреть логи Edge Functions?
```bash
supabase functions logs create-room
```

### Как протестировать Edge Function локально?
```bash
supabase functions serve
```

Затем вызывать через:
```bash
curl http://localhost:54321/functions/v1/create-room
```

### Нужен ли свой Jitsi сервер?
Нет! Для MVP используем публичный `meet.jit.si` с JWT токенами.

---

## 🚀 После выполнения всех шагов

Сообщить AI что настройка завершена, и он начнёт реализацию фронтенда! 🎉
