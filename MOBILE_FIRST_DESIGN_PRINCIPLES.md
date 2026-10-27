# Mobile-First Design Principles for Wedding Invitations

## 🎯 ហេតុផលសំខាន់

### បច្ចប្បន្ន:
- 📱 **90%+ users** មើលធៀបអញ្ជើញតាម phone
- 👆 Touch interface = Primary interaction
- 📶 Network speed varies (3G, 4G, 5G)
- 🔋 Battery និង performance concerns

### Goal:
> **មើលស្អាតលើ phone FIRST, រួចទើប desktop**

---

## 📐 Core Design Principles

### 1. **Typography & Readability**

#### ✅ Font Sizes (Mobile-First)
```css
/* ❌ Don't: Desktop first */
.title { font-size: 48px; }
@media (max-width: 768px) { .title { font-size: 24px; } }

/* ✅ Do: Mobile first */
.title { font-size: 24px; }
@media (min-width: 768px) { .title { font-size: 32px; } }
@media (min-width: 1024px) { .title { font-size: 48px; } }
```

#### Recommended Sizes:
```tsx
// Khmer fonts (need larger sizes)
<h1 className="text-2xl sm:text-3xl lg:text-4xl">    // 24px → 30px → 36px
<h2 className="text-xl sm:text-2xl lg:text-3xl">     // 20px → 24px → 30px
<h3 className="text-lg sm:text-xl lg:text-2xl">      // 18px → 20px → 24px
<p className="text-base sm:text-lg">                 // 16px → 18px

// Minimum readable size
Body text: 16px (never smaller!)
Khmer text: 18px+ recommended
```

#### Line Height & Spacing:
```tsx
// Khmer needs more breathing room
<p className="leading-relaxed">    // line-height: 1.625
<p className="leading-loose">      // line-height: 2

// Touch-friendly spacing
<button className="py-3 px-6">    // min 44x44px tap target
```

---

### 2. **Layout & Grid**

#### ✅ Mobile Grid Strategy
```tsx
// Single column mobile, then expand
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Stack vertical on mobile
<div className="flex flex-col md:flex-row gap-4">

// Hide complex layouts on mobile
<div className="hidden md:block">Desktop only</div>
<div className="block md:hidden">Mobile alternative</div>
```

#### Container Sizes:
```tsx
// Mobile padding
<div className="px-4 sm:px-6 lg:px-8">    // 16px → 24px → 32px

// Max width for readability
<div className="max-w-screen-sm">         // Good for mobile
<div className="max-w-screen-xl">         // Good for desktop
```

---

### 3. **Images & Media**

#### ✅ Image Optimization
```tsx
// Responsive images
<img 
  src="photo-mobile.jpg"
  srcSet="
    photo-mobile.jpg 640w,
    photo-tablet.jpg 1024w,
    photo-desktop.jpg 1920w
  "
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>

// Aspect ratios
<div className="aspect-[3/4] sm:aspect-[4/3] lg:aspect-[16/9]">
```

#### Gallery Strategy:
```tsx
// Mobile: 2 columns (not 1, not 3+)
<div className="grid grid-cols-2 lg:grid-cols-3 gap-2">

// Touch-friendly image spacing
gap-2  // 8px - Good for mobile
gap-4  // 16px - Better for desktop
```

---

### 4. **Touch Interactions**

#### ✅ Tap Targets
```tsx
// Minimum 44x44px (Apple) / 48x48px (Android)
<button className="min-h-[44px] min-w-[44px] p-3">

// Spacing between tappable elements
<div className="space-y-3">  // 12px minimum

// Don't make users zoom
<input className="text-base">  // 16px+ prevents zoom on iOS
```

#### Interactive Elements:
```tsx
// Clear visual feedback
<button className="
  active:scale-95 
  active:bg-primary/90
  transition-transform
">

// Hover states (desktop only)
<button className="
  hover:bg-primary/90 
  md:hover:scale-105
">
```

---

### 5. **Navigation & Menu**

#### ✅ Mobile Navigation
```tsx
// Hamburger menu for mobile
<nav className="hidden md:flex">Desktop nav</nav>
<button className="md:hidden">☰ Menu</button>

// Bottom navigation (easier to reach)
<nav className="fixed bottom-0 left-0 right-0 md:relative">

// Sticky elements
<header className="sticky top-0 z-50">
```

---

### 6. **Performance**

#### ✅ Loading Strategy
```tsx
// Lazy load images below fold
<img loading="lazy" decoding="async" />

// Critical CSS inline
<style>/* Critical above-fold styles */</style>

// Defer non-critical resources
<link rel="stylesheet" href="fonts.css" media="print" onload="this.media='all'" />
```

#### Code Splitting:
```tsx
// Load heavy components on-demand
const HeavyComponent = lazy(() => import('./Heavy'));

// Preload critical templates
preloadTemplate(templateId);
```

---

### 7. **Forms & Input**

#### ✅ Mobile-Friendly Forms
```tsx
// Stack labels above inputs
<div className="flex flex-col gap-2">
  <label>ឈ្មោះ</label>
  <input className="w-full" />
</div>

// Large input fields
<input className="h-12 px-4 text-base">  // 48px height

// Appropriate input types
<input type="tel" />        // Opens number pad
<input type="email" />      // Shows @ key
<input type="date" />       // Native date picker
```

---

### 8. **Colors & Contrast**

#### ✅ Mobile Considerations
```css
/* High contrast for outdoor viewing */
text: #000000 on #FFFFFF  /* Not gray on gray */

/* Avoid pure white backgrounds (battery drain on OLED) */
background: #FAFAFA  /* Slightly off-white */

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  /* Adjust colors */
}
```

---

## 🎨 Template-Specific Guidelines

### For Wedding Invitation Templates:

#### 1. **Hero Section**
```tsx
// Full viewport height on mobile
<section className="min-h-screen flex flex-col justify-center px-4">
  
  {/* Large, readable text */}
  <h1 className="text-3xl sm:text-5xl font-khmer-moul text-center">
    សិរីសួស្តីអាពាហ៍ពិពាហ៍
  </h1>
  
  {/* Couple names */}
  <h2 className="text-2xl sm:text-4xl font-moulpali text-center mt-6">
    រស្មី ♥ ភក្ដី
  </h2>
  
  {/* Clear CTA */}
  <button className="mt-8 w-full max-w-xs mx-auto h-14 text-lg">
    សូមបើកធៀប
  </button>
</section>
```

#### 2. **Info Section**
```tsx
// Stack vertically on mobile
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Date & Time */}
  <div className="flex items-center gap-4 p-4 bg-card rounded-xl">
    <CalendarIcon className="h-8 w-8" />  {/* Larger icons */}
    <div>
      <p className="text-sm text-muted-foreground">កាលបរិច្ឆេទ</p>
      <p className="text-lg font-bold">១៥ កុម្ភៈ ២០២៦</p>
    </div>
  </div>
  
  {/* Location */}
  <div className="flex items-center gap-4 p-4 bg-card rounded-xl">
    <MapPinIcon className="h-8 w-8" />
    <div>
      <p className="text-sm text-muted-foreground">ទីតាំង</p>
      <p className="text-lg font-bold">វត្តភ្នំ</p>
    </div>
  </div>
</div>
```

#### 3. **Gallery Section**
```tsx
// 2-column grid for mobile
<div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
  {photos.map(photo => (
    <div 
      key={photo.id}
      className="aspect-square overflow-hidden rounded-lg"
    >
      <img 
        src={photo.url}
        loading="lazy"
        className="w-full h-full object-cover"
      />
    </div>
  ))}
</div>
```

#### 4. **RSVP/Guestbook**
```tsx
// Full-width on mobile
<form className="space-y-4">
  <div>
    <label className="block text-sm font-bold mb-2">
      ឈ្មោះ
    </label>
    <input 
      type="text"
      className="w-full h-12 px-4 text-base rounded-xl"
      placeholder="បញ្ចូលឈ្មោះ..."
    />
  </div>
  
  <textarea 
    className="w-full min-h-[120px] p-4 text-base rounded-xl"
    placeholder="សារជូនពរ..."
  />
  
  <button 
    type="submit"
    className="w-full h-14 text-lg font-bold rounded-xl"
  >
    ផ្ញើរជូនពរ
  </button>
</form>
```

---

## 📊 Breakpoint Strategy

### Tailwind Breakpoints (Mobile-First):
```css
/* Default: Mobile (0-639px) */
.class

/* Small tablets (640px+) */
sm:class

/* Tablets (768px+) */
md:class

/* Small desktop (1024px+) */
lg:class

/* Large desktop (1280px+) */
xl:class

/* Extra large (1536px+) */
2xl:class
```

### Usage Example:
```tsx
<div className="
  text-base       // Mobile: 16px
  sm:text-lg      // Tablet: 18px
  lg:text-xl      // Desktop: 20px
  
  px-4            // Mobile: 16px padding
  sm:px-6         // Tablet: 24px padding
  lg:px-8         // Desktop: 32px padding
  
  grid-cols-1     // Mobile: Single column
  md:grid-cols-2  // Tablet: 2 columns
  lg:grid-cols-3  // Desktop: 3 columns
">
```

---

## ✅ Checklist for Each Template

### Before Deploy:
- [ ] Test on real mobile device (not just browser)
- [ ] Check all fonts are readable at mobile size
- [ ] All tap targets are 44px+ minimum
- [ ] Images load fast on 3G
- [ ] Forms work with mobile keyboard
- [ ] Navigation is thumb-friendly
- [ ] Text doesn't require zoom
- [ ] Landscape orientation works
- [ ] Dark mode looks good
- [ ] Battery usage is reasonable

### Testing Tools:
```bash
# Lighthouse mobile audit
npm run lighthouse -- --only-categories=performance,accessibility

# Test on various devices
- iPhone SE (small screen)
- iPhone 13 Pro (standard)
- Samsung Galaxy (Android)
- iPad (tablet)
```

---

## 🎯 Priority Order

### 1. **Phone First** (Most Important)
- Portrait orientation
- Single column layout
- Touch-friendly
- Fast loading

### 2. **Tablet** (Nice to Have)
- 2-column layout
- Better use of space
- Landscape support

### 3. **Desktop** (Bonus)
- 3-column layout
- Hover effects
- More visual effects

---

## 💡 Quick Wins

### Easy improvements for all templates:

```tsx
// 1. Larger touch targets
<button className="min-h-12 px-6">  // Instead of min-h-10

// 2. Better spacing
<div className="space-y-6">  // Instead of space-y-2

// 3. Readable fonts
<p className="text-base">  // Never smaller than 16px

// 4. Full-width buttons
<button className="w-full">  // Easy to tap

// 5. Simpler layouts
<div className="flex flex-col">  // Stack vertically
```

---

## 📱 Mobile-First CSS Example

```css
/* Start with mobile styles */
.wedding-card {
  padding: 1rem;
  font-size: 1rem;
  grid-template-columns: 1fr;
}

/* Then add larger screens */
@media (min-width: 768px) {
  .wedding-card {
    padding: 2rem;
    font-size: 1.125rem;
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .wedding-card {
    padding: 3rem;
    font-size: 1.25rem;
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## 🚀 Summary

### តាមគោលការ Mobile-First:

1. **Text:** Large and readable (16px+)
2. **Touch:** Big tap targets (44px+)
3. **Layout:** Single column → Multi-column
4. **Images:** Optimized and lazy-loaded
5. **Performance:** Fast on slow networks
6. **Navigation:** Thumb-friendly
7. **Forms:** Easy to fill
8. **Testing:** Real devices

### Remember:
> **មើលស្អាតលើ phone = មើលស្អាតគ្រប់កន្លែង**  
> **Desktop is a bonus, mobile is the requirement!**

---

**Last Updated:** 2026-10-27
