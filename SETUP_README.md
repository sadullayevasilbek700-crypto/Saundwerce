# SoundVerse — Spotify Integration Setup

## What's inside this package
- `index.html` — the full SoundVerse site (search, charts, player, artist/album pages, Uzbek/English/Russian UI). Tries Spotify first, falls back automatically to the free iTunes API if Spotify isn't reachable.
- `api/spotify-token.js` — serverless function that securely exchanges your Client ID + Secret for a short-lived access token. This is the ONLY place the secret is ever used.
- `.env.example` — template showing the two environment variable names needed.
- `.gitignore` — keeps real `.env` files out of git.
- `vercel.json` — tells Vercel how to run the function.

## Why you can't just open index.html directly
`api/spotify-token.js` only runs on a server. Opening `index.html` by double-clicking it (or Netlify drag-and-drop) will NOT run that function — Spotify search will silently fall back to iTunes instead (which still works, just without Spotify's catalog). To get real Spotify data, you must deploy this whole folder to a platform that runs serverless functions, like **Vercel**.

## Deploy steps (from your phone, no manual file editing needed)

1. Create a free account at vercel.com if you don't have one.
2. Create a new GitHub repository and upload this entire folder to it (GitHub's mobile web upload works for this — go to your repo → "Add file" → "Upload files" → select everything in this ZIP).
3. In Vercel: **Add New Project** → **Import** your GitHub repo.
4. Before deploying, open **Environment Variables** in the import screen and add:
   - `SPOTIFY_CLIENT_ID` = `87c1b8009b0a45b38ebeac5dcd780c6a`
   - `SPOTIFY_CLIENT_SECRET` = *(your rotated secret — see note below)*
5. Click **Deploy**. Vercel gives you a public URL like `soundverse.vercel.app`.

## About the Client Secret
The secret you previously pasted into this chat should be treated as compromised. Before deploying:
1. Go to https://developer.spotify.com/dashboard → your app → **Settings**
2. Click **Reset secret** (or the equivalent "view/regenerate" option)
3. Use that NEW value as `SPOTIFY_CLIENT_SECRET` in step 4 above — never in code, never in chat.

## Where each value goes
| Variable | Where |
|---|---|
| `SPOTIFY_CLIENT_ID` | Vercel → Project Settings → Environment Variables (also fine in `.env.local` for local testing — it's not secret) |
| `SPOTIFY_CLIENT_SECRET` | Vercel → Project Settings → Environment Variables ONLY. Never in frontend code, never committed to git. |

## What happens without Spotify keys set
The app keeps working — every search, chart, and artist page automatically uses the free iTunes Search API instead, with no errors shown to users. Once valid Spotify env vars are present and the `/api/spotify-token` function responds, Spotify becomes the primary data source automatically, no frontend code changes needed.
