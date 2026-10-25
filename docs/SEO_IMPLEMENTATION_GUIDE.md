# SEO Implementation Guide

## Quick Start

This guide helps you implement SEO improvements for the MONEA platform.

## ✅ Completed (October 23, 2026)

- [x] Created reusable `SEOHead` component
- [x] Updated sitemaps with all public routes
- [x] Fixed sitemap lastmod dates
- [x] Added structured data to Contact page
- [x] Added structured data to Support page
- [x] Created comprehensive SEO analysis document
- [x] Created SEO component documentation

## 🚧 In Progress

### Priority 1: Critical Fixes (This Week)

#### 1. Fix Wedding Page Meta Tags

**File**: `d:\MONEA\monea-webapp\src\app\w\[id]\_components\WeddingDataView.tsx`

**Current Issue**: Wedding pages use generic meta tags

**Solution**:
```tsx
import { SEOHead, generateWeddingOGImage } from '@/components/seo/SEOHead';

// Inside component, after wedding data is loaded:
<SEOHead
  title={`${bride} & ${groom} - មង្គលការឌីជីថល | MONEO`}
  description={`ធៀបអញ្ជើញមង្គលការរបស់ ${bride} និង ${groom} នៅថ្ងៃទី ${weddingDate} ទីតាំង ${venue}`}
  canonical={`https://moneoez.com/w/${weddingId}`}
  ogImage={generateWeddingOGImage({
    coupleName: `${bride} & ${groom}`,
    date: weddingDate,
    venue: venue,
    templateId: templateId
  })}
  structuredData={{
    "@context": "https://schema.org",
    "@type": "Event",
    "name": `មង្គលការរបស់ ${bride} និង ${groom}`,
    "startDate": weddingDate,
    "endDate": weddingEndDate,
    "location": {
      "@type": "Place",
      "name": venue,
      "address": venueAddress
    },
    "organizer": {
      "@type": "Person",
      "name": `${bride} & ${groom}`
    },
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode"
  }}
/>
```

#### 2. Update Templates Page with New SEO Component

**File**: `d:\MONEA\monea-webapp\src\app\templates\page.tsx`

**Solution**:
```tsx
import { SEOHead } from '@/components/seo/SEOHead';

// Replace Helmet with:
<SEOHead
  title="MONEO | Khmer Digital Wedding Invitation Templates | គំរូធៀបការឌីជីថល"
  description="មើលគំរូធៀបអាពាហ៍ពិពាហ៍ឌីជីថលជាភាសាខ្មែរ ជ្រើសរើសរចនាបថ និងចាប់ផ្តើមបង្កើតធៀបសម្រាប់ថ្ងៃពិសេសរបស់អ្នកជាមួយ MONEO។"
  canonical="https://moneoez.com/templates"
  keywords="គំរូធៀបការ, wedding templates Cambodia, digital invitation templates khmer"
  structuredData={[
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "គំរូធៀបការឌីជីថល",
      "url": "https://moneoez.com/templates",
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": TEMPLATES.length,
        "itemListElement": TEMPLATES.map((t, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "item": {
            "@type": "CreativeWork",
            "name": t.title,
            "image": t.image
          }
        }))
      }
    }
  ]}
  breadcrumbs={[
    { name: "ទំព័រដើម", url: "https://moneoez.com/" },
    { name: "គំរូ", url: "https://moneoez.com/templates" }
  ]}
/>
```

#### 3. Update Landing Page

**File**: `d:\MONEA\monea-webapp\src\app\page.tsx`

Replace Helmet with:
```tsx
import { SEOHead } from '@/components/seo/SEOHead';

<SEOHead
  title="ធៀបការឌីជីថល | TheapKa Digital - Online Invitation Khmer"
  description="បង្កើតធៀបអញ្ជើញមង្គលការឌីជីថលបានយ៉ាងងាយស្រួល ភ្ជាប់ Google Maps, KHQR និង Telegram ក្នុងពេលតែមួយជាមួយ MONEO។"
  canonical="https://moneoez.com/"
  keywords="MONEO, ធៀបអញ្ជើញមង្គលការ, ធៀបការ, ធៀបការឌីជីថល, digital wedding invitation Cambodia"
/>
```

### Priority 2: Short Term (This Month)

#### 4. Implement Dynamic OG Image Generation

**Create**: `d:\MONEA\monea-api-worker\routers\og-images.ts`

```typescript
import { Hono } from 'hono';

const router = new Hono();

// Generate OG image for wedding
router.get('/og/wedding/:id', async (c) => {
  const weddingId = c.req.param('id');
  
  // Fetch wedding data
  const wedding = await getWedding(weddingId);
  
  // Use Cloudinary or Canvas to generate image
  const imageUrl = generateOGImage({
    coupleName: `${wedding.bride} & ${wedding.groom}`,
    date: wedding.date,
    venue: wedding.venue,
    template: wedding.templateId
  });
  
  return c.redirect(imageUrl);
});

export default router;
```

#### 5. Add Breadcrumb Navigation UI

**Create**: `d:\MONEA\monea-webapp\src\components\ui\Breadcrumbs.tsx`

```tsx
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  url?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <ChevronRight size={14} className="text-muted-foreground" />}
          {item.url ? (
            <Link to={item.url} className="text-primary hover:underline">
              {item.name}
            </Link>
          ) : (
            <span className="text-muted-foreground">{item.name}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
```

#### 6. Remove Duplicate Meta Tags from index.html

**File**: `d:\MONEA\monea-webapp\index.html`

Keep only:
- charset
- viewport
- icon/favicon links
- preconnect links
- theme-color
- mobile-web-app meta tags

Remove:
- title (let React Helmet handle it)
- description (let React Helmet handle it)
- OG tags (let React Helmet handle it)
- Twitter tags (let React Helmet handle it)
- Structured data (let React Helmet handle it)

### Priority 3: Medium Term (Next Quarter)

#### 7. Multi-Language Support

**Create**: `d:\MONEA\monea-webapp\src\i18n\en.json`

Add English translations and update SEOHead to handle multiple languages:

```tsx
<SEOHead
  title="Digital Wedding Invitation | MONEO"
  description="Create beautiful digital wedding invitations..."
  languageAlternates={[
    { lang: 'km', url: 'https://moneoez.com/' },
    { lang: 'en', url: 'https://moneoez.com/en/' },
    { lang: 'x-default', url: 'https://moneoez.com/' }
  ]}
/>
```

#### 8. Add Rich Snippets

**Reviews/Testimonials**:
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "MONEO Digital Wedding Invitations",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127"
  }
}
```

#### 9. Performance Optimization

- Add `preconnect` to Cloudinary (not just `dns-prefetch`)
- Implement lazy loading for below-fold images
- Optimize font loading strategy
- Add `fetchpriority="high"` to hero images

## 📋 SEO Checklist

Use this checklist for each new page:

### Before Publishing

- [ ] Page has unique `<title>` (50-60 chars)
- [ ] Page has unique meta description (150-160 chars)
- [ ] Canonical URL is set correctly
- [ ] OG tags are complete (title, description, image)
- [ ] Twitter Card tags are set
- [ ] Structured data is added (if applicable)
- [ ] Breadcrumbs are implemented
- [ ] Images have alt text
- [ ] H1 tag exists and is unique
- [ ] URL is SEO-friendly (lowercase, hyphens)
- [ ] Page is added to sitemap
- [ ] robots.txt allows/disallows appropriately

### After Publishing

- [ ] Test with Google Rich Results Test
- [ ] Test social previews (Facebook, Twitter)
- [ ] Validate structured data
- [ ] Check mobile-friendliness
- [ ] Run Lighthouse SEO audit (score >90)
- [ ] Submit URL to Google Search Console
- [ ] Monitor indexing status

## 🧪 Testing Commands

```bash
# Build and test
npm run build
npm run preview

# Test mobile performance
npm run test:mobile

# Check navigation
npm run test:nav

# Prerender static pages
npm run prerender
```

## 📊 Monitoring Setup

### 1. Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `moneoez.com`
3. Verify ownership (DNS or HTML file method)
4. Submit sitemaps:
   - `https://moneoez.com/sitemap-index.xml`
   - `https://moneoez.com/sitemap.xml`
   - `https://moneoez.com/sitemap-pages.xml`

### 2. Google Analytics 4

Add to `index.html`:
```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 3. Monitoring Schedule

- **Daily**: Check Search Console for critical issues
- **Weekly**: Review search performance and CTR
- **Monthly**: Analyze organic traffic growth
- **Quarterly**: Conduct full SEO audit

## 🔧 Troubleshooting

### Issue: Pages Not Being Indexed

**Symptoms**: Low indexed pages in Search Console

**Solutions**:
1. Check `robots.txt` isn't blocking pages
2. Verify sitemap is accessible
3. Ensure pages have `robots` meta tag set to `index, follow`
4. Submit URLs manually in Search Console

### Issue: Duplicate Content

**Symptoms**: Multiple URLs showing same content

**Solutions**:
1. Set canonical URLs on all pages
2. Use 301 redirects for old URLs
3. Check for www vs non-www duplication
4. Verify pagination uses `rel="next"` and `rel="prev"`

### Issue: Poor Social Media Previews

**Symptoms**: Generic images when sharing on Facebook/Twitter

**Solutions**:
1. Verify OG image is at least 1200x630px
2. Use absolute URLs for images
3. Clear cache with Facebook Debugger
4. Test with Twitter Card Validator

## 📚 Resources

- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Moz SEO Guide](https://moz.com/learn/seo)

## 🆘 Support

For SEO questions or issues:
- Check this guide first
- Review `/docs/SEO_ANALYSIS_AND_FIXES_2026-10-23.md`
- Test with validation tools
- Document findings in docs/

---

**Last Updated**: October 23, 2026  
**Next Review**: November 23, 2026
