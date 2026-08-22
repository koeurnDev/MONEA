# 🚀 Deploy MONEA to Vercel

## Prerequisites
- GitHub account with MONEA repository
- Vercel account (free): https://vercel.com/signup

---

## Step 1: Connect GitHub to Vercel

1. Go to **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Select your GitHub account
4. Search for **"MONEA"** or **"MONEA_"**
5. Click **"Import"**

---

## Step 2: Configure Project

### Project Settings:
- **Framework Preset:** Next.js
- **Root Directory:** `monea-webapp`
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

### Click "Deploy" (we'll add environment variables after)

---

## Step 3: Add Environment Variables

After the first deployment, go to:
**Project Settings → Environment Variables**

Add these variables for **Production, Preview, and Development**:

### Database
```
DATABASE_URL
your-neon-database-url
```
*(Copy from your `.env` file)*

### API URLs
```
NEXT_PUBLIC_API_URL
https://monea-api.seabkoeurn64.workers.dev

NEXT_PUBLIC_APP_URL
https://your-project.vercel.app
```
*(Update NEXT_PUBLIC_APP_URL with your actual Vercel URL after deployment)*

### Cloudinary
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
your-cloud-name

NEXT_PUBLIC_CLOUDINARY_API_KEY
your-api-key

CLOUDINARY_API_SECRET
your-api-secret
```
*(Copy from your `.env` file)*

### Cloudflare Turnstile
```
NEXT_PUBLIC_TURNSTILE_SITE_KEY
your-turnstile-site-key

TURNSTILE_SECRET_KEY
your-turnstile-secret-key
```
*(Copy from your `.env` file)*

### Telegram Bot
```
TELEGRAM_BOT_TOKEN
your-telegram-bot-token

TELEGRAM_CHAT_ID
your-telegram-chat-id
```
*(Copy from your `.env` file)*

### Security Secrets
```
JWT_SECRET
your-jwt-secret-min-32-characters

ENCRYPTION_KEY
your-encryption-key-32-hex-characters

SECURITY_PEPPER
your-security-pepper-string

CSRF_SECRET
your-csrf-secret-min-32-characters
```
*(Copy from your `.env` file)*

### Bakong Payment
```
BAKONG_ACCOUNT_ID
your-bakong-account-id

BAKONG_MERCHANT_NAME
MONEA

BAKONG_API_TOKEN
your-bakong-api-token
```
*(Copy from your `.env` file)*

### Upstash Redis
```
UPSTASH_REDIS_REST_URL
your-upstash-redis-url

UPSTASH_REDIS_REST_TOKEN
your-upstash-redis-token
```
*(Copy from your `.env` file)*

### Sentry
```
NEXT_PUBLIC_SENTRY_DSN
your-sentry-dsn-url
```
*(Copy from your `.env` file)*

### Google OAuth
```
GOOGLE_CLIENT_ID
your-google-client-id.apps.googleusercontent.com

GOOGLE_CLIENT_SECRET
your-google-client-secret
```
*(Get these from your `.env` file)*

### Email (SMTP)
```
SMTP_HOST
smtp.gmail.com

SMTP_PORT
587

SMTP_SECURE
false

SMTP_USER
your-gmail-address@gmail.com

SMTP_PASS
your-gmail-app-password

SMTP_FROM
"MONEA Support" <your-email@gmail.com>
```
*(Copy from your `.env` file)*

### Environment
```
NODE_ENV
production

PORT
3001
```

---

## Step 4: Redeploy

After adding all environment variables:
1. Go to **Deployments** tab
2. Click the **3 dots (...)** on the latest deployment
3. Click **"Redeploy"**
4. Check **"Use existing Build Cache"**
5. Click **"Redeploy"**

---

## Step 5: Update App URL

Once deployed:
1. Copy your Vercel deployment URL (e.g., `https://monea-wedding.vercel.app`)
2. Go back to **Settings → Environment Variables**
3. Update `NEXT_PUBLIC_APP_URL` with your actual URL
4. Redeploy again

---

## ✅ Done!

Your MONEA wedding platform is now live on Vercel! 🎉

**Architecture:**
- ✅ Frontend: Vercel (Next.js)
- ✅ API: Cloudflare Workers
- ✅ Database: Neon PostgreSQL
- ✅ Storage: Cloudinary

---

## 📝 Notes

### Custom Domain (Optional)
To add a custom domain:
1. Go to **Settings → Domains**
2. Add your domain
3. Update DNS records as instructed

### Automatic Deployments
Vercel automatically deploys when you push to:
- **main branch** → Production
- **other branches** → Preview deployments

### Monitoring
- **Analytics:** Settings → Analytics
- **Logs:** Deployments → Click deployment → View Function Logs
- **Performance:** Settings → Speed Insights

---

## 🆘 Troubleshooting

### Build Fails
- Check **Function Logs** in the deployment
- Verify all environment variables are set correctly
- Make sure `monea-webapp` is set as root directory

### Environment Variables Not Working
- Make sure they're set for all environments (Production, Preview, Development)
- Redeploy after adding new variables
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Neon dashboard for connection status
- Make sure IP allowlist includes Vercel IPs (or use connection pooling)

---

Need help? Check Vercel docs: https://vercel.com/docs
