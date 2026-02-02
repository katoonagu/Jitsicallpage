# ⚠️ НЕОБХОДИМО СДЕЛАТЬ

## 🔴 Критично - Деплой Edge Functions

### Проблема
Фронтенд пытается вызвать Edge Functions, но они не задеплоены:
- `POST /functions/v1/create-room` → **404 Not Found**
- `POST /functions/v1/join-room` → **404 Not Found**

### Решение

**Шаг 1:** Задеплоить функции

```bash
cd /path/to/your/project

# Деплой create-room
supabase functions deploy create-room

# Деплой join-room  
supabase functions deploy join-room
```

**Шаг 2:** Проверить что они работают

```bash
# Test create-room
curl -X POST \
  'https://gcrbvrdbtszjqfhsardf.supabase.co/functions/v1/create-room' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjcmJ2cmRidHN6anFmaHNhcmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjc2NjcsImV4cCI6MjA4NTYwMzY2N30.pWwE2n4h7wioQJ5HAzmV9wY6ZhBrb6c06PYCiVbR5Ok' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjcmJ2cmRidHN6anFmaHNhcmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjc2NjcsImV4cCI6MjA4NTYwMzY2N30.pWwE2n4h7wioQJ5HAzmV9wY6ZhBrb6c06PYCiVbR5Ok' \
  --data '{"hostDisplayName":"Max"}'
```

**Ожидаемый результат:**
```json
{
  "roomSlug": "abc123",
  "inviteLink": "https://meet.jit.si/abc123",
  "roomId": "uuid-here"
}
```

---

## 📋 Что было сделано AI

### ✅ Созданы Edge Functions
1. `/supabase/functions/create-room/index.ts` - создание комнаты
2. `/supabase/functions/join-room/index.ts` - вход и JWT генерация

### ✅ Фронтенд готов
- HomePage вызывает `createRoom()`
- PreJoin вызывает `joinRoom()`
- Все импорты и логика настроены

### ✅ Добавлено логирование
- Подробные логи в консоли браузера
- Логи статуса запросов
- Логи ошибок

---

## 🎯 После деплоя

После успешного деплоя функций, проверь что в консоли браузера появились логи:

```
🚀 [API] Создание комнаты... {hostDisplayName: "...", url: "https://..."}
📡 [API] Response status: 200
📡 [API] Response ok: true
✅ [API] Комната создана: {roomSlug: "...", ...}
```

Если всё ОК - переходи к следующему шагу (интеграция Jitsi iframe).

---

## 🆘 Если не работает деплой

Попробуй:

```bash
# 1. Проверить что залогинен
supabase login

# 2. Связать проект
supabase link --project-ref gcrbvrdbtszjqfhsardf

# 3. Попробовать снова
supabase functions deploy create-room
supabase functions deploy join-room
```

Или задеплой через Supabase Dashboard:
1. Открой https://supabase.com/dashboard/project/gcrbvrdbtszjqfhsardf
2. Перейди в "Edge Functions"
3. Создай новую функцию "create-room"
4. Скопируй код из `/supabase/functions/create-room/index.ts`
5. Повтори для "join-room"
