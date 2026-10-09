# Telegram OIDC login setup

MONEA uses Telegram's OpenID Connect authorization-code flow with PKCE. The API
Worker handles the callback and keeps the client secret server-side.

## BotFather

1. Open the MONEA bot in `@BotFather` and open **Login Widget**.
2. Switch to **OpenID Connect Login**.
3. Add these allowed URLs:
   - `https://monea-webapp.pages.dev`
   - `https://monea-webapp.pages.dev/auth/telegram/callback`
4. Keep the signing algorithm set to **RS256**.
5. Copy the OIDC **Client ID** and **Client Secret**. Do not use the Bot API token
   in place of either OIDC credential.

## Cloudflare Worker

For local development, add these names to `monea-api-worker/.dev.vars` (the file
is git-ignored):

```powershell
OIDC_CLIENT_ID=...
OIDC_CLIENT_SECRET=...
```

For production, configure them as Cloudflare Worker secrets:

```powershell
npx wrangler secret put OIDC_CLIENT_ID
npx wrangler secret put OIDC_CLIENT_SECRET
```

`TELEGRAM_REDIRECT_URI` is a non-secret Worker variable in `wrangler.toml`. It
must exactly match the callback URL registered in BotFather. `NEXT_PUBLIC_APP_URL`
is the frontend destination after authentication. MONEA requests the
`telegram:bot_access` scope so users can grant the bot permission to send
password-recovery messages.

To connect Telegram to an existing email/password account, sign in first, open
Dashboard → Account, and select **ភ្ជាប់ Telegram**. Telegram login remains
available as a separate sign-in option. The account-link callback checks that
the signed-in MONEA user matches the server-signed OIDC state.

After configuring BotFather and the secrets, deploy the API Worker and the
webapp. Then test sign-in from the production HTTPS site, including a mobile
browser. Telegram OIDC sign-in is intentionally unavailable on localhost.

The separate `TELEGRAM_BOT_TOKEN`, if configured for bot messaging or alerts,
is not used by OIDC login and must remain private.
