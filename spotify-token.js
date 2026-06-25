/**
 * /api/spotify-token
 *
 * Serverless function (Vercel Node runtime) that performs the Spotify
 * "Client Credentials" OAuth flow server-side.
 *
 * WHY THIS FILE EXISTS:
 * Spotify's token endpoint requires CLIENT_ID + CLIENT_SECRET together.
 * The secret must never reach the browser — anyone could open dev tools
 * and steal it. So the frontend never talks to accounts.spotify.com
 * directly; it calls THIS endpoint, which holds the secret safely in
 * server-side environment variables and hands back only a short-lived
 * access token (which is safe to use in the browser).
 *
 * REQUIRED ENVIRONMENT VARIABLES (set on your hosting provider, never in code):
 *   SPOTIFY_CLIENT_ID
 *   SPOTIFY_CLIENT_SECRET
 *
 * Where to put them:
 *   - Local dev   -> a ".env.local" file in your project root (gitignored)
 *   - Vercel prod -> Project Settings → Environment Variables
 */

export default async function handler(req, res) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({
      error: "Missing Spotify credentials on the server.",
      hint: "Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET as environment variables on your hosting provider (never in frontend code)."
    });
  }

  try {
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    const data = await tokenRes.json();

    if (!tokenRes.ok) {
      return res.status(tokenRes.status).json({ error: "Spotify token exchange failed", detail: data });
    }

    // access_token is short-lived (~1hr) and safe to expose to the browser.
    // Client secret never leaves this function.
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      access_token: data.access_token,
      expires_in: data.expires_in
    });
  } catch (err) {
    return res.status(500).json({ error: "Token request failed", detail: String(err) });
  }
}
