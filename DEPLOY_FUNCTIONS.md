# Deploy Edge Functions to Supabase

## Important: Edge Functions Deployment Required

The LiveKit video conferencing functionality requires Edge Functions to be deployed to Supabase. Currently, the functions exist only in this codebase and need to be deployed to your Supabase project.

## Quick Start

The Edge Functions are located in `/supabase/functions/server/index.tsx` and handle:
- Creating LiveKit rooms (`/create-room`)
- Joining existing rooms (`/join-room`)  
- Generating JWT tokens for authentication

## Environment Variables Already Configured

The following secrets are already set in your Supabase project:
- `LIVEKIT_URL` - LiveKit server URL
- `LIVEKIT_API_KEY` - LiveKit API key
- `LIVEKIT_API_SECRET` - LiveKit API secret
- `APP_BASE_URL` - Base URL for invite links (https://stray-bone-61183886.figma.site)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `SUPABASE_DB_URL` - Supabase database URL

## Option 1: Deploy via Supabase Dashboard (Easiest)

1. Go to https://supabase.com/dashboard/project/gcrbvrdbtszjqfhsardf/functions
2. Click "Deploy a new function"
3. Name it: `make-server-039e5f24`
4. Copy the entire contents of `/supabase/functions/server/index.tsx`
5. Paste into the function editor
6. Click "Deploy function"

## Option 2: Deploy via Supabase CLI

### Prerequisites
```bash
# Install Supabase CLI
npm install -g supabase
```

### Steps

1. **Login to Supabase**
```bash
supabase login
```

2. **Link to your project**
```bash
supabase link --project-ref gcrbvrdbtszjqfhsardf
```

3. **Deploy the function**
```bash
supabase functions deploy make-server-039e5f24 --project-ref gcrbvrdbtszjqfhsardf
```

## Testing the Deployment

After deployment, test the health endpoint:
```bash
curl https://gcrbvrdbtszjqfhsardf.supabase.co/functions/v1/make-server-039e5f24/health
```

Expected response:
```json
{"status":"ok"}
```

## Troubleshooting

### Function returns 404
- Ensure the function is deployed with the exact name: `make-server-039e5f24`
- Check the function is enabled in the Supabase dashboard

### Function returns 500
- Check function logs in Supabase Dashboard → Edge Functions → Logs
- Verify all environment variables are set correctly

### CORS errors
- The function already has CORS configured to allow all origins
- If issues persist, check browser console for specific CORS errors

## What Happens Next

Once deployed, the application will:
1. ✅ Create LiveKit rooms when users click "Start meeting"
2. ✅ Generate JWT tokens for authentication
3. ✅ Allow participants to join via invite links
4. ✅ Enable video/audio conferencing with LiveKit

## Need Help?

- Check Supabase Edge Functions docs: https://supabase.com/docs/guides/functions
- View function logs in Dashboard: https://supabase.com/dashboard/project/gcrbvrdbtszjqfhsardf/functions
