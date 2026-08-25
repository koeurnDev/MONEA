---
name: turnstile-spin
description: Set up Cloudflare Turnstile end-to-end in a project. Scan the codebase, create or link widgets, embed Turnstile widgets where requests need verification, wire canonical server-side siteverify, and validate.
---

# Cloudflare Turnstile Integration Skill

This skill guides the end-to-end integration and maintenance of Cloudflare Turnstile CAPTCHA protection across frontend forms and backend validation endpoints.

## Siteverify Contract
- **URL**: `https://challenges.cloudflare.com/turnstile/v0/siteverify`
- **Method**: POST
- **Headers**: `Content-Type: application/x-www-form-urlencoded`
- **Body**:
  - `secret`: `process.env.TURNSTILE_SECRET_KEY` or `process.env.TURNSTILE_SECRET`
  - `response`: Client-submitted token (`cf-turnstile-response` or `turnstileToken`)
  - `remoteip`: Client IP (optional)

## Validation Rule
Tokens are single-use. The backend handler must check `result.success === true`.
