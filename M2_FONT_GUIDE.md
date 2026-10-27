# M2 (Modern Minimal) Template - Font Guide

## 🎨 ការប្រើប្រាស់ Font ផ្លូវការ

### ភាសាខ្មែរ (Khmer)

| ប្រភេទ | Font | CSS Class | ឧទាហរណ៍ |
|--------|------|-----------|----------|
| **ចំណងជើង** | Moul | `font-khmer-moul` | សិរីសួស្តីអាពាហ៍ពិពាហ៍ |
| **ឡូហ្គោឈ្មោះ** | Moulpali | `font-moulpali` | រស្មី ♥ ភក្ដី |
| **អត្ថបទទូទៅ** | Kantumruy Pro | `font-kantumruy` | សូមគោរពអញ្ជើញចូលរួម |

### English

| Type | Font | CSS Class | Example |
|------|------|-----------|---------|
| **Script/Decorative** | Pinyon Script | `font-serif-elegant` | The Wedding Invitation |
| **Body Text** | Cormorant Garamond | `font-serif-elegant` | Join us in celebrating |

---

## 🔤 ជម្រើស Font ជំនួស (Alternative Fonts)

### សម្រាប់ឡូហ្គោឈ្មោះ ឬចំណងជើង

```tsx
// Dangrek - Bold និង Modern
<h2 className="font-[Dangrek]">រស្មី ♥ ភក្ដី</h2>

// Koulen - Strong និង Impactful
<h2 className="font-[Koulen]">រស្មី ♥ ភក្ដី</h2>

// Battambang - Classic និង Elegant
<h2 className="font-[Battambang]">រស្មី ♥ ភក្ដី</h2>

// Fasthand - Handwritten Style
<h2 className="font-[Fasthand]">រស្មី ♥ ភក្ដី</h2>

// Preahvihear - Traditional
<h2 className="font-[Preahvihear]">រស្មី ♥ ភក្ដី</h2>

// Noto Serif Khmer - Serif Style
<h2 className="font-['Noto_Serif_Khmer']">រស្មី ♥ ភក្ដី</h2>
```

---

## 📝 Code Examples

### HTML Structure
```html
<div class="modern-minimal-invitation m05-type-system">
  <!-- Heading: Moul -->
  <h1 class="font-khmer-moul text-3xl">សិរីសួស្តីអាពាហ៍ពិពាហ៍</h1>
  
  <!-- Name Logo: Moulpali -->
  <h2 class="font-moulpali text-xl">រស្មី ♥ ភក្ដី</h2>
  
  <!-- Body Text: Kantumruy Pro -->
  <p class="font-kantumruy text-base">
    សូមគោរពអញ្ជើញចូលរួមពិធីអាពាហ៍ពិពាហ៍
  </p>
  
  <!-- English Script: Pinyon Script -->
  <span class="font-serif-elegant italic">The Wedding Invitation</span>
</div>
```

### CSS Variables (M05 Type System)
```css
.m05-type-system {
  --m05-title-font: 'Moul', serif;
  --m05-name-font: 'Moulpali', serif;
  font-family: 'Kantumruy Pro', sans-serif;
}

.font-khmer-moul {
  font-family: var(--m05-title-font);
}

.font-moulpali {
  font-family: var(--m05-name-font);
}

.font-kantumruy {
  font-family: 'Kantumruy Pro', sans-serif;
}
```

---

## 🎯 Font Characteristics

### Moul (ចំណងជើង)
- **Style:** Bold, Decorative
- **Best for:** Main titles, headings
- **Tone:** Formal, Traditional
- [Google Fonts Link](https://fonts.google.com/specimen/Moul)

### Moulpali (ឡូហ្គោឈ្មោះ)
- **Style:** Elegant, Distinctive
- **Best for:** Couple names, name logos
- **Tone:** Romantic, Sophisticated
- [Google Fonts Link](https://fonts.google.com/specimen/Moulpali)

### Kantumruy Pro (អត្ថបទ)
- **Style:** Clean, Readable
- **Best for:** Body text, paragraphs
- **Tone:** Modern, Professional
- [Google Fonts Link](https://fonts.google.com/specimen/Kantumruy+Pro)

### Pinyon Script (English Decorative)
- **Style:** Calligraphy, Script
- **Best for:** English subtitles, decorative text
- **Tone:** Elegant, Romantic
- [Google Fonts Link](https://fonts.google.com/specimen/Pinyon+Script)

### Cormorant Garamond (English Body)
- **Style:** Serif, Classic
- **Best for:** English body text
- **Tone:** Elegant, Timeless
- [Google Fonts Link](https://fonts.google.com/specimen/Cormorant+Garamond)

---

## 🔧 Tailwind Configuration

All fonts are configured in `tailwind.config.ts`:

```typescript
fontFamily: {
  // Khmer fonts
  "khmer-moul": ["'Moul'", "serif"],
  "moulpali": ["'Moulpali'", "serif"],
  "kantumruy": ["'Kantumruy Pro'", "sans-serif"],
  
  // English fonts
  "serif-elegant": ["'Cormorant Garamond'", "serif"],
  "script": ["'Pinyon Script'", "cursive"],
  
  // Alternative Khmer fonts
  "dangrek": ["'Dangrek'", "sans-serif"],
  "koulen": ["'Koulen'", "sans-serif"],
  "battambang": ["'Battambang'", "sans-serif"],
  "fasthand": ["'Fasthand'", "cursive"],
  "preahvihear": ["'Preahvihear'", "sans-serif"],
}
```

---

## 📦 Font Loading

Fonts are loaded in `index.html`:

```html
<!-- Google Fonts -->
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Moul&family=Moulpali&family=Kantumruy+Pro:wght@100..700&family=Pinyon+Script&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Dangrek&family=Koulen&family=Battambang&family=Fasthand&family=Preahvihear&family=Noto+Serif+Khmer:wght@100..900&display=optional"
  media="print"
  onload="this.media='all'"
/>
```

---

## 🎨 Quick Copy Names

ចុចដើម្បីចម្លង font names:

### Khmer Fonts
- `Moul`
- `Moulpali`
- `Kantumruy Pro`
- `Dangrek`
- `Koulen`
- `Battambang`
- `Fasthand`
- `Preahvihear`
- `Noto Serif Khmer`

### English Fonts
- `Pinyon Script`
- `Cormorant Garamond`

---

## 💡 Tips

1. **Pairing:** Moul (headings) + Moulpali (names) + Kantumruy Pro (body) = Perfect combination
2. **Line Height:** Use `leading-relaxed` or `leading-loose` for Khmer fonts
3. **Letter Spacing:** Avoid tight letter-spacing with Khmer fonts
4. **Size:** Khmer fonts need slightly larger size than Latin fonts for readability
5. **Weight:** Moul and Moulpali don't have weight variations, use size for emphasis

---

**Last Updated:** 2026-10-27
