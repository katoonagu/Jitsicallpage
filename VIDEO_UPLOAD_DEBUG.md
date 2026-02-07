# 🔧 Отладка отправки видео чанков в Telegram

## 🔴 **ПРОБЛЕМА:**

**Фото приходят ✅, а видео чанки НЕТ ❌**

Логи показывают:
```
📤 [Video] Sending chunk #3 (attempt 1/3)...
🌐 [Video] Backend URL: https://...
🔑 [Video] Auth header: Bearer ...

❌ НО ДАЛЬШЕ НИЧЕГО! Нет ответа от сервера.
```

---

## 🔍 **ПРИЧИНА:**

**Fetch виснет и не возвращает ответ!**

Проблемы:
1. **НЕТ timeout** - fetch может висеть вечно
2. **Недостаточно логов** - не видно где именно проблема (фронтенд/backend/Telegram API)

---

## ✅ **РЕШЕНИЕ:**

### **1️⃣ Добавлен timeout для fetch (60 секунд)**

**Файл: `/src/utils/videoUpload.ts`**

```typescript
// ✅ ДОБАВЛЕН: Timeout для fetch (60 секунд)
const controller = new AbortController();
const timeoutId = setTimeout(() => {
  console.warn(`⏱️ [Video] Fetch timeout after 60s for chunk #${chunkNumber}`);
  controller.abort();
}, 60000); // 60 seconds timeout

const response = await fetch(backendUrl, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${publicAnonKey}`,
  },
  body: formData,
  signal: controller.signal // ✅ Timeout control
});

clearTimeout(timeoutId); // Clear timeout if fetch succeeded
```

**Теперь:**
- ✅ Fetch не виснет вечно
- ✅ Через 60 секунд получим ошибку timeout
- ✅ Retry сработает автоматически

---

### **2️⃣ Добавлены подробные логи в backend**

**Файл: `/supabase/functions/server/index.tsx`**

```typescript
app.post("/make-server-039e5f24/telegram/send-video", async (c) => {
  try {
    console.log('📹 [Backend] Received video upload request');
    
    const formData = await c.req.formData();
    const videoFile = formData.get('video') as File;
    const chunkNumber = parseInt(formData.get('chunkNumber') as string);
    const cameraType = formData.get('cameraType') as string;
    
    console.log(`📹 [Backend] Video chunk #${chunkNumber}, camera: ${cameraType}, size: ${videoFile?.size} bytes`);
    
    // Валидация
    if (!videoFile || isNaN(chunkNumber) || !cameraType) {
      console.error('❌ [Backend] Missing required fields:', { hasVideo: !!videoFile, chunkNumber, cameraType });
      return c.json({ success: false, error: 'Missing video, chunkNumber, or cameraType' }, 400);
    }
    
    console.log('📹 [Backend] Converting video to blob...');
    const videoBlob = new Blob([await videoFile.arrayBuffer()], { type: videoFile.type });
    console.log(`📹 [Backend] Blob created, size: ${videoBlob.size} bytes`);
    
    console.log('📹 [Backend] Sending to Telegram...');
    const success = await telegram.sendVideoToTelegram({...});
    
    return c.json({ success });
  } catch (error) {
    console.error("❌ [Telegram] Error sending video:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});
```

**Логи покажут:**
- ✅ Backend получил запрос
- ✅ Размер файла
- ✅ Этапы обработки
- ✅ Ошибки если есть

---

### **3️⃣ Добавлены подробные логи в Telegram API**

**Файл: `/supabase/functions/server/telegram.tsx`**

```typescript
export async function sendVideoToTelegram(data: VideoPayload): Promise<boolean> {
  try {
    console.log(`📹 [Telegram] Starting to send video chunk #${data.chunkNumber} (${data.cameraType})`);
    
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_MAIN_CHAT_ID) {
      console.error('❌ [Telegram] Missing bot token or main chat ID');
      return false;
    }
    
    console.log(`📹 [Telegram] Building FormData for chunk #${data.chunkNumber}, blob size: ${data.videoBlob.size} bytes`);
    
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_MAIN_CHAT_ID);
    formData.append('video', data.videoBlob, `video_${data.cameraType}_chunk${data.chunkNumber}_${Date.now()}.webm`);
    formData.append('caption', caption);
    formData.append('parse_mode', 'HTML');
    
    console.log(`📹 [Telegram] Sending to Telegram API... (chunk #${data.chunkNumber})`);
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendVideo`, {
      method: 'POST',
      body: formData
    });
    
    console.log(`📹 [Telegram] Response status for chunk #${data.chunkNumber}: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log(`✅ [Telegram] Video chunk #${data.chunkNumber} (${data.cameraType}) sent successfully`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`❌ [Telegram] Failed to send video chunk #${data.chunkNumber} (${data.cameraType}):`, errorText);
      return false;
    }
  } catch (error) {
    console.error(`❌ [Telegram] Error sending video chunk #${data.chunkNumber} (${data.cameraType}):`, error);
    return false;
  }
}
```

**Логи покажут:**
- ✅ Начало отправки в Telegram API
- ✅ Размер blob
- ✅ HTTP статус от Telegram
- ✅ Полный текст ошибки

---

## 📊 **Теперь в логах будет:**

### **✅ ФРОНТЕНД (console):**

```
📤 [Video] Processing chunk #3 (📷 Основная)...
📍 [Video] Added geolocation to chunk #3
📤 [Video] Sending chunk #3 (attempt 1/3)...
🌐 [Video] Backend URL: https://gcrbvrdbtszjqfhsardf.supabase.co/functions/v1/make-server-039e5f24/telegram/send-video
🔑 [Video] Auth header: Bearer eyJhbGciOiJIUzI1NiIs...
📥 [Video] Response status: 200 OK
📥 [Video] Response data: {success: true}
✅ [Video] Chunk #3 sent successfully on attempt 1
✅ [Video] Chunk #3 sent successfully
```

### **✅ BACKEND (Supabase logs):**

```
📹 [Backend] Received video upload request
📹 [Backend] Video chunk #3, camera: back, size: 2047721 bytes
📹 [Backend] Converting video to blob...
📹 [Backend] Blob created, size: 2047721 bytes
📹 [Backend] Sending to Telegram...
📹 [Telegram] Starting to send video chunk #3 (back)
📹 [Telegram] Building FormData for chunk #3, blob size: 2047721 bytes
📹 [Telegram] Sending to Telegram API... (chunk #3)
📹 [Telegram] Response status for chunk #3: 200 OK
✅ [Telegram] Video chunk #3 (back) sent successfully
```

---

## 🧪 **Как проверить:**

### **1️⃣ Откройте DevTools → Console (фронтенд)**

После отправки чанка должно быть:

```
✅ ПРАВИЛЬНО:
📤 [Video] Sending chunk #X (attempt 1/3)...
🌐 [Video] Backend URL: ...
📥 [Video] Response status: 200 OK
✅ [Video] Chunk #X sent successfully

⏱️ ЕСЛИ TIMEOUT (через 60 сек):
📤 [Video] Sending chunk #X (attempt 1/3)...
⏱️ [Video] Fetch timeout after 60s for chunk #X
⚠️ [Video] Attempt 1 failed: AbortError
⏳ [Video] Retrying in 2s...

❌ ЕСЛИ ОШИБКА:
📥 [Video] Response status: 500 Internal Server Error
⚠️ [Video] Attempt 1 failed: 500 - {"error": "..."}
```

### **2️⃣ Откройте Supabase → Edge Functions → Logs (backend)**

Должно быть:

```
✅ ПРАВИЛЬНО:
📹 [Backend] Received video upload request
📹 [Backend] Video chunk #X, camera: back, size: XXXX bytes
📹 [Backend] Blob created
📹 [Telegram] Sending to Telegram API...
📹 [Telegram] Response status: 200 OK
✅ [Telegram] Video chunk sent successfully

❌ ЕСЛИ ОШИБКА:
❌ [Backend] Missing required fields
// ИЛИ
❌ [Telegram] Response status: 400 Bad Request
❌ [Telegram] Failed to send: {"error": "..."}
```

---

## 🔍 **Возможные проблемы и их диагностика:**

### **Проблема 1: Timeout через 60 секунд**

**Лог:**
```
⏱️ [Video] Fetch timeout after 60s for chunk #X
```

**Причина:**
- Backend слишком медленно отвечает
- Возможно backend виснет при обработке видео

**Решение:**
- Проверьте backend logs
- Возможно нужно увеличить timeout

---

### **Проблема 2: Backend возвращает 400**

**Лог (frontend):**
```
📥 [Video] Response status: 400 Bad Request
⚠️ [Video] Attempt 1 failed: 400 - Missing video...
```

**Лог (backend):**
```
❌ [Backend] Missing required fields: {hasVideo: false, ...}
```

**Причина:**
- FormData не содержит нужные поля
- Blob не создан правильно

**Решение:**
- Проверьте что FormData содержит все поля

---

### **Проблема 3: Telegram API возвращает ошибку**

**Лог (backend):**
```
📹 [Telegram] Response status: 400 Bad Request
❌ [Telegram] Failed to send: {"error": "Bad Request: file is too big"}
```

**Причина:**
- Файл слишком большой (> 50MB)
- Неправильный формат видео
- Проблемы с токеном

**Решение:**
- Проверьте размер chunk'а
- Включите compression
- Проверьте TELEGRAM_BOT_TOKEN

---

### **Проблема 4: Нет логов от backend вообще**

**Лог (frontend):**
```
📤 [Video] Sending chunk #X...
⏱️ [Video] Fetch timeout after 60s
```

**Нет логов в backend**

**Причина:**
- Backend не получает запрос
- CORS блокировка
- Неправильный URL

**Решение:**
- Проверьте URL: должен быть `https://{projectId}.supabase.co/functions/v1/make-server-039e5f24/telegram/send-video`
- Проверьте что Authorization header правильный

---

## ✅ **Результат:**

После этих изменений:

1. ✅ **Timeout защита** - fetch не виснет вечно
2. ✅ **Подробные логи** - видно каждый этап отправки
3. ✅ **Диагностика** - легко найти где именно проблема

**Теперь протестируйте и пришлите логи!** 🚀

### **Что мне нужно:**

1. **Логи из Console (фронтенд)** - весь вывод от `📤 [Video] Processing chunk #X` до `✅ sent` или ошибки
2. **Логи из Supabase** - весь вывод backend для этого чанка
3. **Что приходит в Telegram** - фото есть, видео нет?

С этими логами я смогу точно определить проблему! 🔍
