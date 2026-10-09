# MONEA - មនោសញ្ចេតនានៃក្តីស្រឡាញ់

MONEA is a premium, cinematic digital wedding invitation platform designed to provide couples with a high-end, immersive way to invite their guests and manage their special day.

## ✨ Key Features

- **Cinematic Experience**: High-end entrance animations with music synchronization and smooth parallax transitions.
- **Visual Editor**: Real-time design wizard with image panning, scaling, and instant preview.
- **Smart Color Extraction**: Automatically adapts invitation themes based on the primary colors of the couple's hero image.
- **Multi-step RSVP**: Integrated guest response system with real-time dashboard notifications.
- **QR & Payments**: Seamless integration for gift scanning (KHQR) and location mapping.
- **Production Grade**: Includes typed frontend code, API-backed data, Cloudinary media, and Sentry monitoring.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, React Router, Tailwind CSS, and Framer Motion.
- **Frontend hosting**: Cloudflare Pages.
- **API**: Hono on Cloudflare Workers (maintained in the sibling `monea-api-worker` project).
- **Database**: PostgreSQL on Neon; Prisma is used by the application.
- **Media**: Cloudinary.
- **Monitoring**: Sentry.

## Getting Started

1. **Environment Setup**:
   Copy `.env.example` to `.env` and fill in your Cloudinary and Database credentials.

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

   Apply database migrations only in the intended environment and follow the database deployment process; do not use `prisma db push` as an automatic setup step against a shared or production database.

4. **Launch the frontend**:
   ```bash
   npm run dev
   ```

## Template Development

To add an invitation design, follow the current [Template Creation Guide](./docs/TEMPLATE_CREATION_GUIDE.md). A template must be added to both the selection catalog and the lazy component registry; the guide also lists the editor, preview, and mobile checks.

## Architecture Overview

```
MONEA
├── monea-webapp
│   ├── React + Vite frontend (Cloudflare Pages)
│   ├── Invitation templates and design wizard
│   └── Prisma client
└── monea-api-worker
    └── Hono API (Cloudflare Workers)
        └── Neon PostgreSQL
```

---
*Created with ❤️ for MONEA Team.*
