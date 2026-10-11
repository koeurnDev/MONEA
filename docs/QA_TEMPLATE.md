# MONEA Quality Assurance (QA) Certification Template

This document provides the standard QA protocol, acceptance criteria, and testing checklist for releasing and certifying digital wedding/engagement invitation templates and features in the MONEA platform.

---

## 📋 Test Execution Metadata

| Item | Details |
| :--- | :--- |
| **Feature / Template Tested** | `[e.g., Template M-05 NEA Olive & Gold / Guestbook RSVP / Media Upload]` |
| **Tester Name / Role** | `[Name]` |
| **Test Date & Time** | `YYYY-MM-DD` |
| **Test Environment** | `[Local Dev / Preview / Staging / Production]` |
| **Commit SHA / Branch** | `[e.g., main @ abc1234]` |
| **Test Devices / Viewports** | `[iPhone 15 (390px), Android Samsung S23 (360px), iPad (768px), Desktop (1440px)]` |
| **Overall Verdict** | **[ PASS / CONDITIONAL PASS / FAIL ]** |

---

## 🔍 Section 1: Template Metadata & Registration Checklist

- [ ] **Catalog Registration**:
  - Registered in `src/components/templates/template-config.ts` (`TEMPLATE_DEFINITIONS`).
  - Unique ID (`id`) and display code (`code`, e.g., `M-01` to `M-07`).
  - Supported `eventType` correctly set (`"wedding"`, `"anniversary"`, or `"both"`).
  - Standard `visibilityControls`: `["story", "gallery", "timeline", "guestbook"]`.
- [ ] **Backend Alignment**:
  - Registered in `monea-api-worker/lib/template-availability.ts` (`TEMPLATE_AVAILABILITY_DEFAULTS`).
  - Default enabled state matches frontend selectable catalog.
- [ ] **Thumbnail & Preview Assets**:
  - Preview card asset exists in `/public/assets/...` or `/public/images/...`.
  - Preview image size is optimized (< 250 KB, `.webp` or compressed `.jpg`).

---

## 🎨 Section 2: UX / UI & Theme Customization Verification

- [ ] **Color Palette & Theme Contrast**:
  - Accent color picker dynamically updates template accents without page reload.
  - Foreground text color automatically complies with WCAG AA readable contrast (`getContrastingTextColor`).
  - Background cards remain legible in both Dark Mode and Light Mode.
- [ ] **Khmer Typography & Fonts**:
  - Khmer scripts render with proper ligatures and sub-consonants (no broken diacritics/boxes).
  - Headings, hero names, and quotes use proper font families (`Kantumruy Pro`, `Moul`, `Playfair`).
  - Khmer lunar date formatting (`កាលបរិច្ឆេទតាមចន្ទគតិ`) displays accurately matching solar date.
- [ ] **Paper Texture Layering** (if applicable):
  - Texture options (`cream`, `linen`, `plain`) apply properly without obscuring text content.
  - Textures load from bundled local starter kit paths only.

---

## 👁️ Section 3: Dynamic Section Toggling & Content Normalization

| Section | Toggle Key | Expected Behavior When Hidden | Tested (Pass/Fail) |
| :--- | :--- | :--- | :---: |
| **Story / Love Story** | `showStory` | Section completely removed from DOM; no orphan spacing or dividers. | `[ ]` |
| **Gallery** | `showGallery` | Section completely removed; does not break background music or RSVP bar. | `[ ]` |
| **Schedule / Timeline** | `showTimeline` | Normalizes legacy `showSchedule`; ceremony list hidden smoothly. | `[ ]` |
| **Guestbook / Wishes** | `showGuestbook` | Wishes form and comment stream hidden. | `[ ]` |
| **KHQR / Monetary Gifts**| `showGift` | Payment/KHQR cards hidden from invitation. | `[ ]` |

- [ ] **Schedule Normalization**:
  - Blank and duplicate ceremonies are automatically removed (`normalizeWeddingActivities`).
  - Default Khmer wedding program loads 8 ceremony steps; anniversary loads 5 engagement steps.
- [ ] **Custom Labels**:
  - Custom label overrides in `customLabels` take precedence over default headers.
  - Legacy snake_case labels (`invite_title`, `hero_subtitle`) map gracefully to current camelCase.

---

## 📸 Section 4: Media, Gallery & Image Error Fallbacks

- [ ] **Hero Couple Photo (Slot 0)**:
  - Loads configured couple photo from slot 0 via `getWeddingSectionPhoto(wedding, 0)`.
  - Falls back gracefully to default placeholder if no photo has been uploaded.
- [ ] **Multi-Slot Layout Ratios**:
  - Aspect ratios match editor crop presets (portrait 4:5, landscape 16:9, square 1:1).
- [ ] **Network & Broken URL Resilience**:
  - 404 or corrupted photo URLs trigger `<PhotoImage />` error fallback (`"មិនអាចបង្ហាញរូបនេះបាន"`).
  - No broken `<img>` icons or infinite layout shifts.
- [ ] **Cloudinary Retry Pipeline**:
  - Multi-image uploads allow selective retry of failed items without re-uploading succeeded assets.

---

## 📱 Section 5: Responsive Viewports & Mobile Gestures

- [ ] **Viewport 360px** (Small Android / Galaxy):
  - No horizontal scrolling or viewport overflow (`overflow-x: hidden`).
  - Text does not truncate awkwardly; buttons are minimum 44px tap targets.
- [ ] **Viewport 390px - 430px** (iPhone / Standard Mobile):
  - Sticky bottom RSVP bar or navigation buttons do not obscure template content.
  - Envelope opening animations (e.g., M-07) execute smoothly at 60fps.
  - Respects `prefers-reduced-motion` settings.
- [ ] **Tablet & Desktop (768px - 1440px)**:
  - Invitation card centers cleanly in desktop shell with tasteful backdrop treatment.

---

## ⚡ Section 6: Performance, Audio & PWA

- [ ] **Audio Player (Background Music)**:
  - Music respects mobile browser autoplay policies (requires explicit guest tap to start).
  - Floating mute/play toggle button remains accessible across scroll positions.
- [ ] **PWA / Service Worker Caching**:
  - Invitation shell renders offline fallback screen when network drops.
  - Cached shell does not intercept API or Cloudinary CDN queries.
- [ ] **Network Throttling (Fast 3G)**:
  - Hero section displays in < 2.0s on Fast 3G simulation.
  - Lazy images below the fold load as viewport scrolls into view.

---

## 🧪 Section 7: Automated Test Gate Verification

Run and verify all platform gates prior to signing off:

```powershell
# 1. Template Contract Suite (42 tests)
npm --prefix monea-webapp run test:templates

# 2. Navigation & Dead Link Verification (0 dead links, 0 orphans)
npm --prefix monea-webapp run test:nav

# 3. Service Worker Contract Suite (7 tests)
npm --prefix monea-webapp run test:sw

# 4. Mobile Bundle & Code Optimization Suite
npm --prefix monea-webapp run test:mobile

# 5. Linter Check (0 errors, 0 warnings)
npm --prefix monea-webapp run lint

# 6. Type-check & Production Build
npm --prefix monea-webapp run build

# 7. Backend Availability & Admin Master Suite
npm --prefix monea-api-worker run test:admin-master
```

---

## 📝 QA Sign-Off & Release Notes

- **Blocking Defects Discovered**: `[None / List defect IDs]`
- **Known Limitations**: `[Any non-blocking observations]`
- **Approved for Deployment**: `[ ] YES   [ ] NO`
- **Sign-off By**: `_________________________`
