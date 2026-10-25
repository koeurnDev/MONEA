# Quick SEO Reference Card

**Last Updated**: October 23, 2026

## 🚀 Quick Commands

```bash
# Development
npm run dev                          # Start dev server

# Build & Preview
npm run build                        # Build production
npm run preview                      # Preview production build

# SEO Tools
npm run sitemap:generate             # Generate sitemap (static pages)
npm run prerender                    # Prerender static pages for SEO
npm run seo:validate                 # Instructions for validation

# Testing
npm run test:mobile                  # Mobile performance test
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `docs/SEO_IMPLEMENTATION_GUIDE.md` | Step-by-step guide |
| `docs/SEO_IMPLEMENTATION_CHECKLIST.md` | Progress tracker |
| `src/components/seo/SEOHead.tsx` | Reusable SEO component |
| `src/components/seo/README.md` | Component documentation |

## 💻 Using SEOHead Component

```tsx
import { SEOHead } from '@/components/seo/SEOHead';

<SEOHead
  title="Page Title | MONEO"
  description="Page description (150-160 chars)"
  canonical="https://moneoez.com/page"
  keywords="keyword1, keyword2, keyword3"
  structuredData={{
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Page Name"
  }}
  breadcrumbs={[
    { name: "Home", url: "https://moneoez.com/" },
    { name: "Page", url: "https://moneoez.com/page" }
  ]}
/>
```

## ✅ SEO Checklist (New Page)

- [ ] Unique title (50-60 chars)
- [ ] Unique description (150-160 chars)
- [ ] Canonical URL set
- [ ] Structured data added
- [ ] Breadcrumbs configured
- [ ] Images have alt text
- [ ] Added to sitemap
- [ ] Tested in preview
- [ ] Validated with Google Rich Results

## 🔗 Validation Tools

- **Google Rich Results**: https://search.google.com/test/rich-results
- **Schema Validator**: https://validator.schema.org/
- **Facebook Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card**: https://cards-dev.twitter.com/validator
- **PageSpeed**: https://pagespeed.web.dev/

## 📊 Current Status

**Phase 1**: ✅ Complete (Foundation)  
**Phase 2**: 🚧 20% (Critical Fixes)  
**Overall**: 35% Complete

### Completed
- ✅ SEO audit (18 issues identified)
- ✅ SEOHead component created
- ✅ Sitemaps fixed (100% coverage)
- ✅ Wedding pages updated
- ✅ Documentation complete

### This Week
- ⏳ Update 5 remaining pages
- ⏳ Test & validate all pages
- ⏳ Deploy to production

## 🎯 Expected Impact (6 months)

- Organic Traffic: **+200-300%**
- Indexed Pages: **8 → 50+**
- Search Impressions: **5K → 20K/mo**
- CTR: **2% → 5%**

## 📞 Quick Help

**Component not working?**
- Check React Helmet Async is installed
- Verify import path is correct
- Check TypeScript types

**Structured data errors?**
- Validate JSON-LD at validator.schema.org
- Check all required fields present
- Ensure proper nesting

**Social previews not showing?**
- Clear cache with Facebook Debugger
- Verify image URL is absolute
- Check image size (1200x630 minimum)

## 🔄 Weekly Tasks

1. Check Search Console for errors
2. Review organic traffic
3. Update sitemap if needed
4. Monitor indexing status

---

**Need More Info?** See `docs/SEO_IMPLEMENTATION_GUIDE.md`
