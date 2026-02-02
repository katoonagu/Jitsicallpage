# 🚀 Деплой Edge Functions

## Созданные функции

1. ✅ `/supabase/functions/create-room/index.ts` - создание комнаты
2. ✅ `/supabase/functions/join-room/index.ts` - вход в комнату и генерация JWT

## Команды для деплоя

```bash
# 1. Задеплоить create-room
supabase functions deploy create-room

# 2. Задеплоить join-room
supabase functions deploy join-room
```

## Проверка деплоя

После деплоя проверь что функции работают:

```bash
# Test create-room
curl -X POST \
  'https://gcrbvrdbtszjqfhsardf.supabase.co/functions/v1/create-room' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjcmJ2cmRidHN6anFmaHNhcmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjc2NjcsImV4cCI6MjA4NTYwMzY2N30.pWwE2n4h7wioQJ5HAzmV9wY6ZhBrb6c06PYCiVbR5Ok' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjcmJ2cmRidHN6anFmaHNhcmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjc2NjcsImV4cCI6MjA4NTYwMzY2N30.pWwE2n4h7wioQJ5HAzmV9wY6ZhBrb6c06PYCiVbR5Ok' \
  --data '{"hostDisplayName":"Max","title":"Test call"}'

# Должен вернуть:
# {
#   "roomSlug": "abc123",
#   "inviteLink": "https://meet.jit.si/abc123",
#   "roomId": "uuid-here"
# }

# Test join-room (используй slug из предыдущего ответа)
curl -X POST \
  'https://gcrbvrdbtszjqfhsardf.supabase.co/functions/v1/join-room' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjcmJ2cmRidHN6anFmaHNhcmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjc2NjcsImV4cCI6MjA4NTYwMzY2N30.pWwE2n4h7wioQJ5HAzmV9wY6ZhBrb6c06PYCiVbR5Ok' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjcmJ2cmRidHN6anFmaHNhcmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjc2NjcsImV4cCI6MjA4NTYwMzY2N30.pWwE2n4h7wioQJ5HAzmV9wY6ZhBrb6c06PYCiVbR5Ok' \
  --data '{"slug":"abc123","displayName":"Guest1"}'

# Должен вернуть:
# {
#   "jitsiUrl": "8x8.vc",
#   "roomName": "abc123",
#   "token": "jwt-token-here",
#   "identity": "uuid-here",
#   "role": "participant",
#   "displayName": "Guest1"
# }
```

## Важно!

### 1. Environment Variables (опционально)

Если хочешь использовать **настоящий Jitsi JWT** (для JaaS от 8x8), установи переменные окружения:

```bash
supabase secrets set JITSI_APP_ID=vpaas-magic-cookie-YOUR_APP_ID
supabase secrets set JITSI_KEY_ID=vpaas/YOUR_KEY_ID
supabase secrets set JITSI_PRIVATE_KEY=YOUR_BASE64_PRIVATE_KEY
supabase secrets set JITSI_DOMAIN=8x8.vc
```

**Но это НЕ обязательно!** Функции будут работать и без JWT токенов на публичном `meet.jit.si`.

### 2. Без JWT (для MVP)

Если не настроишь JWT токены, функции будут работать в режиме разработки:
- `token` будет mock строкой
- Jitsi будет работать на `meet.jit.si` без JWT
- Все функции (камера, звук, геолокация, запись) будут работать

### 3. Проблемы с деплоем?

Если `supabase functions deploy` не работает, попробуй:

```bash
# Проверить логин
supabase login

# Связать проект
supabase link --project-ref gcrbvrdbtszjqfhsardf

# Попробовать снова
supabase functions deploy create-room
supabase functions deploy join-room
```

## После деплоя

После успешного деплоя функций:
1. ✅ Протестируй через curl (команды выше)
2. ✅ Обнови фронтенд (уже готов!)
3. ✅ Протести через UI приложения

Если всё работает - увидишь в консоли браузера:
```
🚀 [API] Создание комнаты... {hostDisplayName: "Max", title: undefined, url: "https://...", ...}
📡 [API] Response status: 200
📡 [API] Response ok: true
✅ [API] Комната создана: {roomSlug: "abc123", inviteLink: "...", roomId: "..."}
```
