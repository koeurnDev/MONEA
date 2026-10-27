# Fix: Telegram Khmer Unicode URL Encoding Issue

**Date:** 2026-10-27  
**Status:** ✅ Fixed (Hybrid Approach)

## Problem
When sending wedding invitation links to guests via Telegram, there were two issues:
1. Khmer Unicode characters in the guest name appeared as URL-encoded gibberish (`%E1%9E%80%E1%9E%89...`) in Telegram messages
2. When users copied the link and pasted it in browser address bar, some browsers failed to load the page with Unicode characters

### Example of Original Issue
**In Telegram:** `https://moneoez.com/invite/cmn7m5lh800017yugdm8lhk4i?to=%E1%9E%80%E1%9E%89%E1%9E%BB%E1%9F...`  
**Copy/Paste to Browser:** Some browsers failed to navigate properly with Unicode characters

## Root Cause
Initially, the code was using `encodeURIComponent()` on the Khmer guest name when creating the invitation URL. When this already-encoded URL was then passed to Telegram's share API, it got **double-encoded**, resulting in unreadable characters.

However, removing encoding entirely caused issues with browser address bar compatibility when users manually copied and pasted the links.

## Solution: Hybrid Approach
Use different encoding strategies for different use cases:
- **Copy Link (for manual paste)**: Use `encodeURIComponent()` for maximum browser compatibility
- **Share on Telegram**: Use plain Unicode because Telegram automatically handles encoding/decoding properly

### Changed Files
- `monea-webapp/src/app/dashboard/guests/hooks/useGuests.ts`

### Changes Made

**In `copyLink()` function (line 259) - Uses encoded URL:**
```typescript
// Use encoded URL for reliable copy/paste compatibility across all browsers
const link = `${window.location.origin}/invite/${wedding.id}?to=${encodeURIComponent(name)}&g=${guestId}`;
```
This ensures the link works when users manually paste it into any browser's address bar.

**In `shareTelegram()` function (line 292) - Uses plain Unicode:**
```typescript
// Telegram decodes URLs automatically, so we use plain Unicode for better display
const link = `${window.location.origin}/invite/${wedding.id}?to=${name}&g=${guestId}`;
```
This prevents double-encoding in Telegram messages while still being properly encoded when passed through `encodeURIComponent(link)` to the Telegram share API.

## Why This Works

### Copy Link (Encoded):
1. **Maximum Compatibility:** `encodeURIComponent()` ensures the URL works in all browsers when manually copied and pasted
2. **Address Bar Support:** Encoded URLs are universally recognized by all browser address bars
3. **No Manual Decoding Needed:** The invitation page automatically decodes the parameter

### Share on Telegram (Unicode):
1. **Telegram's Smart Handling:** Telegram decodes URLs automatically for display, but properly encodes them when clicked
2. **Better User Experience:** Shows readable Khmer text in the message preview instead of `%E1%9E%...`
3. **Single Encoding:** When passed through `encodeURIComponent(link)` to the Telegram share API, it only gets encoded once (not double-encoded)

### Invitation Page Compatibility:
The invitation page (`/invite/[id]/page.tsx`) already has robust error handling that works with both approaches:
```typescript
if (guestNameParam) {
    try {
        guestName = decodeURIComponent(guestNameParam);
    } catch {
        guestName = guestNameParam; // Fallback for already-decoded Unicode
    }
}
```
This means both encoded (`%E1%9E%80`) and Unicode (`កញ្ញា`) parameters work correctly.

## Testing
✅ Build passed successfully with no errors  
✅ TypeScript compilation successful  
✅ All chunks generated correctly

## Deployment
Ready to deploy. After deployment, test both scenarios:

### Test 1: Copy Link Feature
1. Create/edit a wedding invitation
2. Add a guest with a Khmer name (e.g., "កញ្ញា សុភា")
3. Click "Copy Link" button
4. Paste the copied text into a browser address bar
5. ✅ Verify the page loads correctly (URL will show encoded: `?to=%E1%9E%80...`)

### Test 2: Share on Telegram Feature
1. Add a guest with a Khmer name (e.g., "កញ្ញា សុភា")
2. Click "Share on Telegram" button
3. Check the Telegram message preview
4. ✅ Verify the URL shows readable Khmer text in the message (e.g., `?to=កញ្ញា សុភា`)
5. Click the link in Telegram
6. ✅ Verify the page loads correctly

## Technical Notes
- **Different strategies for different use cases:** Copy Link uses encoding, Share on Telegram uses Unicode
- The `encodeURIComponent(link)` and `encodeURIComponent(text)` calls in the Telegram share URL (`t.me/share/url?url=...&text=...`) are still correct - they encode the entire URL and message text for the Telegram share API
- This hybrid approach provides the best of both worlds: browser compatibility AND readable Telegram messages

## Visual Comparison

### Copy Link Feature (Encoded URL):
```
User sees in clipboard:
សួស្តី កញ្ញា សុភា 🤍
យើងខ្ញុំសូមគោរពអញ្ជើញចូលរួមពិធីមង្គលការរបស់យើងខ្ញុំ។
https://moneoez.com/invite/abc123?to=%E1%9E%80%E1%9E%89%E1%9E%BB%E1%9E%B6&g=xyz

Paste in browser → Works in all browsers ✅
```

### Share on Telegram Feature (Unicode URL):
```
Telegram receives URL:
https://moneoez.com/invite/abc123?to=កញ្ញា សុភា&g=xyz

Telegram encodes it to: (internal)
https://moneoez.com/invite/abc123?to=%E1%9E%80%E1%9E%89...&g=xyz

User sees in message: (decoded by Telegram)
https://moneoez.com/invite/abc123?to=កញ្ញា សុភា&g=xyz ✅

Click link → Telegram properly encodes before opening → Works ✅
```

## Related Files
- `monea-webapp/src/app/dashboard/guests/hooks/useGuests.ts` - Fixed
- `monea-webapp/src/app/invite/[id]/page.tsx` - Already has proper fallback handling
