# MONEA Platform End-to-End Application QA Test Plan & Template

This document provides the master Quality Assurance (QA) certification protocol for testing the complete **MONEA Web Application & API Services** before any production release.

---

## 📋 1. Test Run Metadata

| Item | Details |
| :--- | :--- |
| **Release Version** | `v1.2.3 [or target release tag]` |
| **QA Lead / Engineers** | `[Names]` |
| **Execution Date** | `YYYY-MM-DD` |
| **Test Scope** | `[Full Regression / Smoke / Release Candidate]` |
| **Browsers Tested** | `Chrome (Desktop/Android), Safari (iOS/macOS), Samsung Internet, Firefox` |
| **Overall Status** | **[ APPROVED / REJECTED / CONDITIONAL ]** |

---

## 🔐 2. Authentication & Security Suite

| Test Case | Scenario / Steps | Expected Result | Status |
| :--- | :--- | :--- | :---: |
| **AUTH-01** | Sign up with valid email, password, and Turnstile verification | Account created; redirected to onboarding/dashboard; JWT session established. | `[ ]` |
| **AUTH-02** | Sign up with duplicate email address | Error alert displayed; user informed that email is already registered. | `[ ]` |
| **AUTH-03** | Sign in with valid credentials | Instant redirect to `/dashboard`; user session populated in context. | `[ ]` |
| **AUTH-04** | Sign in with incorrect password | Clear error message; rate-limiting counter increments. | `[ ]` |
| **AUTH-05** | Cloudflare Turnstile bot challenge | Token automatically attached; blocked if challenge fails or is missing. | `[ ]` |
| **AUTH-06** | Forgot Password & Reset Flow | Password reset email received; reset token updates password securely. | `[ ]` |
| **AUTH-07** | Session Logout | Session cookie cleared; redirected to `/sign-in`; protected routes blocked. | `[ ]` |
| **AUTH-08** | Stealth Admin Route Protection | `/admin/login` returns 404 to unauthenticated or unauthorized visitors. | `[ ]` |

---

## 🛠️ 3. Dashboard & Wedding Creation

| Test Case | Scenario / Steps | Expected Result | Status |
| :--- | :--- | :--- | :---: |
| **DASH-01** | First-time user onboarding | Prompts user to create initial invitation (`/dashboard/create`). | `[ ]` |
| **DASH-02** | Dashboard overview statistics | Displays correct guest count, confirmed RSVP count, and gift summary. | `[ ]` |
| **DASH-03** | Sidebar Navigation & Collapsing | Collapses smoothly on desktop; transforms to mobile bottom bar on mobile. | `[ ]` |
| **DASH-04** | Multi-wedding switcher (if multiple) | Switches active wedding context across all dashboard sections. | `[ ]` |
| **DASH-05** | Account Profile Updates | User can update display name, phone, and password from `/dashboard/account`.| `[ ]` |

---

## 🎨 4. Wedding Design & Customization Wizard (`/dashboard/design`)

| Step / Module | Verification Check | Expected Result | Status |
| :--- | :--- | :--- | :---: |
| **Step 1: Template** | Select template (`M-01` to `M-07`) | Instant preview update in iframe; persists selection on save. | `[ ]` |
| **Step 2: Basic Info** | Bride & Groom names, parents, event type | Auto-syncs to preview; Khmer names render with correct typography. | `[ ]` |
| **Step 3: Date & Location**| Pick solar date & venue address | Khmer lunar date auto-computed (`កាលបរិច្ឆេទតាមចន្ទគតិ`); map link works. | `[ ]` |
| **Step 4: Media Upload** | Upload hero cover & gallery images | Uploads to Cloudinary; progress bar shows; failed uploads can be retried. | `[ ]` |
| **Step 5: Extra Features**| Toggle Story, Gallery, Timeline, Guestbook | Disabled sections disappear from preview immediately; no broken spacing. | `[ ]` |
| **Color & Paper** | Change primary accent color & paper texture | Custom theme applies dynamically; text retains accessible AA contrast. | `[ ]` |
| **Serial Save Queue** | Rapid edits and save triggers | Requests serialized sequentially via queue; no race conditions or lost data. | `[ ]` |
| **Unsaved Guard** | Attempt to close tab with dirty edits | Browser prompts user before leaving to prevent accidental data loss. | `[ ]` |

---

## 👥 5. Guest Management & Invitations (`/dashboard/guests`)

| Test Case | Scenario / Steps | Expected Result | Status |
| :--- | :--- | :--- | :---: |
| **GUEST-01** | Add new guest (Name, group, table, phone) | Guest added to table; unique invitation link generated. | `[ ]` |
| **GUEST-02** | Excel / CSV Bulk Guest Import | Parses spreadsheet; imports rows in batch with validation error report. | `[ ]` |
| **GUEST-03** | Mobile Guest List (`MobileGuestList.tsx`) | Touch-friendly cards; quick copy link; Telegram share action works. | `[ ]` |
| **GUEST-04** | QR Code Generation (`SafeQRCode.tsx`) | Renders SVG QR code cleanly for both mobile screens and print invitations. | `[ ]` |
| **GUEST-05** | Search & Filter guests | Instant search filtering by guest name, attendance status, and group. | `[ ]` |
| **GUEST-06** | Export Guest List | Exports complete guest list with RSVP status and gift records to Excel. | `[ ]` |

---

## 💌 6. Public Guest Invitation Experience (`/w/:id` & `/invite/:id`)

| Feature | Verification Check | Expected Result | Status |
| :--- | :--- | :--- | :---: |
| **Envelope Animation** | Guest opens digital invitation | Envelope animation runs smoothly; respects `prefers-reduced-motion`. | `[ ]` |
| **Khmer Typography** | Text scaling and layout across devices | No awkward line breaks on Khmer vowels/sub-consonants. | `[ ]` |
| **Audio Background** | Background music player | Plays on explicit guest tap; mute button toggles state cleanly. | `[ ]` |
| **RSVP Submission** | Submit attendance, guest count, and note | Updates database; success modal appears; prevents duplicate submissions. | `[ ]` |
| **Guestbook Wishes** | Submit blessing message with Turnstile | Appears in guestbook stream in real-time; abusive submissions prevented. | `[ ]` |
| **KHQR Monetary Gift** | View KHQR code & recipient account | Clean QR display; tappable account copy; Bakong app deep link opens. | `[ ]` |
| **Google Maps Link** | Tap location navigation button | Opens Google Maps / Apple Maps at the correct coordinates. | `[ ]` |

---

## 📷 7. Live Wedding Photo Gallery (`/w/:id/gallery` & `/live`)

| Feature | Verification Check | Expected Result | Status |
| :--- | :--- | :--- | :---: |
| **Public Gallery** | Guests view uploaded ceremony photos | High-res modal lightbox; left/right arrow keys & swipe navigation work. | `[ ]` |
| **Guest Photo Upload**| Guests upload real-time photos from phone | Media uploads to pending queue; verifies file types (JPEG, PNG, HEIC). | `[ ]` |
| **Live Projector Mode**| `/w/:id/gallery/live` on TV / projector | Auto-advances slides every 5-10 seconds; handles new photos in real time. | `[ ]` |
| **Image Fallbacks** | Network drop or corrupted image URL | `<PhotoImage />` displays friendly Khmer error fallback without crashing. | `[ ]` |

---

## 🛡️ 8. Admin & Master Portal (`/admin` & `/admin/master`)

| Section | Verification Check | Expected Result | Status |
| :--- | :--- | :--- | :---: |
| **Master Analytics** | View total weddings, guests, active users | Key performance metrics and growth charts load accurately. | `[ ]` |
| **User Governance** | View, suspend, or unlock user accounts | Role-based permission enforced; actions audited in log. | `[ ]` |
| **Template Availability**| Toggle template availability at runtime | Toggled templates immediately reflect in user dashboard catalog. | `[ ]` |
| **Security & Rate Limit**| Monitor IP throttling and security alerts | Rate-limiting blocks repeated brute-force attacks cleanly. | `[ ]` |

---

## ⚙️ 9. Performance, Offline & Cross-Platform Criteria

- [ ] **Lighthouse Mobile Score**:
  - Performance: $\ge 85$
  - Accessibility: $\ge 90$
  - Best Practices: $\ge 90$
  - SEO: $\ge 90$
- [ ] **Service Worker & Offline Navigation**:
  - Cached shell delivers instant navigation without network latency.
  - Offline message renders when network is completely severed.
- [ ] **Mobile Touch UX**:
  - Tap target sizes $\ge 44\text{px} \times 44\text{px}$.
  - No horizontal page jitter or horizontal overflow scrollbar.

---

## 🚀 10. Automated Pre-Flight Test Gate

Every release candidate must pass all automated suites before deployment:

```powershell
# 1. Full template contract validation
npm --prefix monea-webapp run test:templates

# 2. Complete navigation and dead-link audit
npm --prefix monea-webapp run test:nav

# 3. Service worker contract verification
npm --prefix monea-webapp run test:sw

# 4. Mobile performance optimization audit
npm --prefix monea-webapp run test:mobile

# 5. Lint validation (0 errors, 0 warnings)
npm --prefix monea-webapp run lint

# 6. Type-check & Production Build
npm --prefix monea-webapp run build

# 7. Backend availability and administrative tests
npm --prefix monea-api-worker run test:admin-master
```

---

## ✍️ 11. Sign-Off Approval

| Role | Name | Signature / Approval | Date |
| :--- | :--- | :--- | :--- |
| **QA Lead** | | | |
| **Lead Developer** | | | |
| **Product Manager**| | | |
