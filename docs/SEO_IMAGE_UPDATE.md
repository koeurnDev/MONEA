# SEO Social Media Image Update

**Date**: October 23, 2026  
**Change**: Updated default Open Graph/Twitter Card image

## Summary

Changed default social media sharing image from `logomoneo.jpg` to `SE.png` for better social media display.

## Changes Made

### 1. Updated SEOHead Component
**File**: `src/components/seo/SEOHead.tsx`

```tsx
// Changed default ogImage from:
ogImage = 'https://moneoez.com/icons/logomoneo.jpg'

// To:
ogImage = 'https://moneoez.com/icons/SE.png'

// Updated dimensions from:
ogImageWidth = 1024
ogImageHeight = 1024

// To:
ogImageWidth = 1200
ogImageHeight = 630
```

### 2. Updated index.html
**File**: `index.html`

Changed Open Graph and Twitter Card meta tags to use SE.png:
- Updated `og:image` to `/icons/SE.png`
- Updated `og:image:type` to `image/png`
- Updated `og:image:width` to `1200`
- Updated `og:image:height` to `630`
- Updated `twitter:image` to `/icons/SE.png`

## Image Specifications

### SE.png (Social Media Image)
- **Purpose**: Default Open Graph/Twitter Card image
- **Recommended Size**: 1200x630px
- **Format**: PNG
- **Location**: `/public/icons/SE.png`
- **URL**: `https://moneoez.com/icons/SE.png`

### logomoneo.jpg (Logo)
- **Purpose**: Brand logo, favicon
- **Format**: JPG
- **Location**: `/public/icons/logomoneo.jpg`
- **Still used for**: Favicon, brand identity

## Why This Change?

### Optimal Social Media Dimensions
- **Facebook**: 1200x630px recommended
- **Twitter**: 1200x628px recommended  
- **LinkedIn**: 1200x627px recommended
- **Telegram**: 1200x630px recommended

The new SE.png image at 1200x630px is optimized for all major social media platforms, ensuring the best preview when sharing MONEO links.

## Testing

After deployment, test social previews:

1. **Facebook Sharing Debugger**
   ```
   https://developers.facebook.com/tools/debug/
   ```
   - Enter: `https://moneoez.com/`
   - Click "Scrape Again" to refresh cache
   - Verify SE.png appears correctly

2. **Twitter Card Validator**
   ```
   https://cards-dev.twitter.com/validator
   ```
   - Enter: `https://moneoez.com/`
   - Verify SE.png appears correctly

3. **LinkedIn Post Inspector**
   ```
   https://www.linkedin.com/post-inspector/
   ```
   - Enter: `https://moneoez.com/`
   - Verify SE.png appears correctly

4. **Telegram Link Preview**
   - Send link in Telegram chat
   - Verify SE.png appears in preview

## Notes

- SE.png is now the default for all pages unless overridden
- Individual wedding pages can still use custom images
- Dynamic OG image generation (future feature) will use wedding-specific images
- logomoneo.jpg remains available for other uses

## Impact

✅ Better social media previews  
✅ Consistent branding across platforms  
✅ Optimal dimensions for all major social networks  
✅ Improved click-through rates from social shares  

---

**Updated By**: Kiro AI  
**Date**: October 23, 2026
