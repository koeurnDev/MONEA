# MONEA - មនោសញ្ចេតនានៃក្តីស្រឡាញ់

MONEA is a premium, cinematic digital wedding invitation platform designed to provide couples with a high-end, immersive way to invite their guests and manage their special day.

## ✨ Key Features

- **Cinematic Experience**: High-end entrance animations with music synchronization and smooth parallax transitions.
- **Visual Editor**: Real-time design wizard with image panning, scaling, and instant preview.
- **Smart Color Extraction**: Automatically adapts invitation themes based on the primary colors of the couple's hero image.
- **Multi-step RSVP**: Integrated guest response system with real-time dashboard notifications.
- **QR & Payments**: Seamless integration for gift scanning (KHQR) and location mapping.
- **Production Grade**: Built with Next.js, Prisma, SWR, and Cloudinary for resilience and speed.

## 🛠 Tech Stack

- **Frontend**: Next.js (App Router), Tailwind CSS, Framer Motion.
- **Backend**: Hono API, Prisma ORM.
- **Runtime**: Cloudflare Workers.
- **Database**: PostgreSQL (Neon).
- **Storage**: Cloudinary.
- **Monitoring**: Sentry.

## 🚀 Getting Started

1. **Environment Setup**:
   Copy `.env.example` to `.env` and fill in your Cloudinary and Database credentials.

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Database Migration**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Launch Application**:
   ```bash
   npm run dev
   ```

## 🏗 Architecture Overview

```
MONEA
├── Next.js App (Frontend + API Routes)
│   ├── App Router (Pages, Layouts, Invitations)
│   ├── Prisma ORM (Database)
│   └── Cloudinary (Media Storage)
│
└── bakong-worker (Cloudflare Workers)
    └── Hono
        └── Backend API
            ├── POST /api/pay          — Generate KHQR code
            ├── GET  /api/orders       — List all orders
            ├── GET  /api/orders/:id   — Check order status
            └── POST /api/admin/confirm/:id — Mark order as paid
```

---
*Created with ❤️ for MONEA Team.*
