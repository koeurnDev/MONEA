import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    debug: false,
  });
} else {
  // Silent in production client, or log if needed
  if (process.env.NODE_ENV === "development") {
    console.warn("[Sentry] NEXT_PUBLIC_SENTRY_DSN is not set. Sentry initialization skipped.");
  }
}
