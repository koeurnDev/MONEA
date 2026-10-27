# MONEA Templates - Font Recommendations Guide

រាល់ template មាន personality និង style ផ្សេងៗគ្នា។ នេះគឺ font recommendations សម្រាប់ template នីមួយៗ។

---

## 📋 រាល់ Templates (8 Templates)

| Code | Template ID | Name | Style | Event Type |
|------|------------|------|-------|------------|
| M1 | khmer-legacy | Khmer Legacy | ប្រពៃណីខ្មែរ | Both |
| M2 | modern-minimal | ទំនើប សាមញ្ញ | Modern Minimal | Both |
| M3 | fortune-harmony | Fortune Harmony | ប្រណីត | Both |
| M4 | blossom-romance | Rose Garden | Floral Romance | Both |
| M5 | nea-m05 | NEA - Olive & Gold | ក្រដាសធៀបខ្មែរ | Both |
| M6 | emerald-garden | Emerald Garden | Nature/Garden | Both |
| M7 | anniversary-elegant | Anniversary Elegant | Elegant | Anniversary |
| M8 | garden-editorial | Palace Bloom | Editorial/Luxury | Wedding |

---

## 🎨 Font Recommendations by Template

### M1: Khmer Legacy (ប្រពៃណីខ្មែរ)
**Style:** Traditional Khmer, Classical
**Primary Color:** #E8AC00 (Gold)

```tsx
// Recommended Fonts
ចំណងជើង: font-khmer-moul or font-preahvihear
ឡូហ្គោឈ្មោះ: font-moulpali or font-battambang
អត្ថបទ: font-kantumruy or font-noto-serif-khmer

// Example
<h1 className="font-preahvihear text-4xl text-[#E8AC00]">
  សិរីសួស្តីអាពាហ៍ពិពាហ៍
</h1>
<h2 className="font-battambang text-2xl">
  រស្មី ♥ ភក្ដី
</h2>
<p className="font-kantumruy">
  សូមគោរពអញ្ជើញចូលរួម...
</p>
```

**Why:** Preahvihear និង Battambang មានអារម្មណ៍ប្រពៃណី classical ល្អ

---

### M2: Modern Minimal (ទំនើប សាមញ្ញ) ✨
**Style:** Modern, Clean, Minimalist
**Primary Color:** #0A1226 (Dark Blue)
**Status:** ✅ **ធ្វើរួចហើយ!**

```tsx
// Official M2 Fonts (Already configured)
ចំណងជើង: font-khmer-moul
ឡូហ្គោឈ្មោះ: font-moulpali
អត្ថបទ: font-kantumruy
English Script: font-script (Pinyon Script)
English Body: font-serif-elegant (Cormorant)

// Example
<h1 className="font-khmer-moul">សិរីសួស្តី</h1>
<h2 className="font-moulpali">រស្មី ♥ ភក្ដី</h2>
<p className="font-kantumruy">សូមគោរពអញ្ជើញ...</p>
<span className="font-script italic">The Wedding Invitation</span>
```

**Why:** Moul + Moulpali = Perfect modern elegant combination

**📖 Full Documentation:** See `M2_FONT_GUIDE.md`

---

### M3: Fortune Harmony (ប្រណីត)
**Style:** Elegant, Refined, Formal
**Primary Color:** #D4AF37 (Gold)

```tsx
// Recommended Fonts
ចំណងជើង: font-khmer-moul or font-moulpali
ឡូហ្គោឈ្មោះ: font-moulpali or font-noto-serif-khmer
អត្ថបទ: font-kantumruy or font-noto-serif-khmer

// Example
<h1 className="font-khmer-moul text-4xl text-[#D4AF37]">
  សិរីមង្គលភ្ជាប់ពាក្យ
</h1>
<h2 className="font-moulpali text-3xl">
  សុភ័ក្ត្រ ♥ ស្រីពៅ
</h2>
<p className="font-noto-serif-khmer text-lg">
  យើងខ្ញុំសូមគោរពអញ្ជើញ...
</p>
```

**Why:** Serif fonts ផ្តល់អារម្មណ៍ elegant និង formal

---

### M4: Rose Garden / Blossom Romance
**Style:** Floral, Romantic, Soft
**Primary Color:** #B76572 (Rose Pink)

```tsx
// Recommended Fonts
ចំណងជើង: font-fasthand or font-moulpali
ឡូហ្គោឈ្មោះ: font-fasthand or font-moulpali
អត្ថបទ: font-kantumruy
English: font-script (Pinyon Script)

// Example
<h1 className="font-fasthand text-4xl text-[#B76572]">
  Rose Garden
</h1>
<h2 className="font-moulpali text-3xl">
  មករា ♥ សុផល្លា
</h2>
<p className="font-kantumruy">
  Join us in celebrating our love...
</p>
<span className="font-script text-xl">
  The Wedding of Dreams
</span>
```

**Why:** Fasthand មានអារម្មណ៍ handwritten romantic ល្អសម្រាប់ floral theme

---

### M5: NEA (ក្រដាសធៀបខ្មែរ)
**Style:** Traditional Khmer Paper Card
**Primary Color:** #A27A43 (Olive/Gold)

```tsx
// Recommended Fonts (Similar to M2)
ចំណងជើង: font-khmer-moul
ឡូហ្គោឈ្មោះ: font-moulpali
អត្ថបទ: font-kantumruy
English: font-script

// Example
<div className="m05-type-system">
  <h1 className="font-khmer-moul">សិរីមង្គល</h1>
  <h2 className="font-moulpali">វិបុល ♥ សុផាត</h2>
  <p className="font-kantumruy">
    សូមគោរពអញ្ជើញចូលរួមពិធី...
  </p>
</div>
```

**Why:** NEA = ក្រដាសធៀបប្រពៃណី ត្រូវការ fonts ប្រពៃណីតែទំនើប

---

### M6: Emerald Garden
**Style:** Nature, Garden, Fresh
**Primary Color:** #1B4332 (Dark Green)

```tsx
// Recommended Fonts
ចំណងជើង: font-kantumruy or font-khmer-moul
ឡូហ្គោឈ្មោះ: font-moulpali or font-battambang
អត្ថបទ: font-kantumruy
English: font-serif-elegant

// Example
<h1 className="font-khmer-moul text-4xl text-[#1B4332]">
  Emerald Garden
</h1>
<h2 className="font-moulpali text-3xl">
  គីមសេង ♥ សុខាន់
</h2>
<p className="font-kantumruy">
  A celebration in nature's embrace
</p>
```

**Why:** Clean fonts ដើម្បីបង្ហាញ nature's simplicity និង elegance

---

### M7: Anniversary Elegant
**Style:** Elegant, Sophisticated (Engagement focus)
**Primary Color:** #8B4B55 (Burgundy)

```tsx
// Recommended Fonts
ចំណងជើង: font-moulpali or font-noto-serif-khmer
ឡូហ្គោឈ្មោះ: font-moulpali
អត្ថបទ: font-kantumruy or font-noto-serif-khmer
English: font-serif-elegant

// Example
<h1 className="font-moulpali text-4xl text-[#8B4B55]">
  សិរីមង្គលភ្ជាប់ពាក្យ
</h1>
<h2 className="font-moulpali text-3xl">
  ភីរៈម ♥ សុគន្ធា
</h2>
<p className="font-noto-serif-khmer">
  សូមគោរពអញ្ជើញចូលរួមពិធីភ្ជាប់ពាក្យ
</p>
```

**Why:** Serif fonts = Formal និង Elegant សម្រាប់ engagement

---

### M8: Palace Bloom / Garden Editorial
**Style:** Editorial, Luxury, Royal
**Primary Color:** #A78337 (Antique Gold)

```tsx
// Recommended Fonts
ចំណងជើង: font-khmer-moul or font-preahvihear
ឡូហ្គោឈ្មោះ: font-moulpali or font-noto-serif-khmer
អត្ថបទ: font-kantumruy or font-noto-serif-khmer
English: font-serif-elegant

// Example
<h1 className="font-khmer-moul text-5xl text-[#A78337]">
  Palace Bloom
</h1>
<h2 className="font-moulpali text-4xl">
  បូរ៉ាណា ♥ វិចិត្រ
</h2>
<p className="font-noto-serif-khmer text-lg">
  A Royal Celebration of Love
</p>
```

**Why:** Strong bold fonts សម្រាប់ editorial/magazine style

---

## 🎯 Font Pairing Rules

### ក្បួនទូទៅ:

1. **ចំណងជើង + ឡូហ្គោ + អត្ថបទ**
   - Bold/Decorative + Elegant + Clean
   - Example: Moul + Moulpali + Kantumruy

2. **Traditional Templates:**
   - Use: Preahvihear, Battambang, Noto Serif Khmer
   - Avoid: Fasthand, Koulen (too modern)

3. **Modern Templates:**
   - Use: Moul, Moulpali, Kantumruy
   - Can use: Dangrek, Koulen (for impact)

4. **Romantic Templates:**
   - Use: Fasthand, Moulpali, Kantumruy
   - Add: Pinyon Script for English

5. **Formal/Elegant Templates:**
   - Use: Moulpali, Noto Serif Khmer
   - Avoid: Fasthand, Koulen (too casual)

---

## 📦 Quick Reference

### Primary Fonts (Use First)
```
ចំណងជើង: font-khmer-moul
ឡូហ្គោឈ្មោះ: font-moulpali  
អត្ថបទ: font-kantumruy
```

### Alternative Khmer Fonts
```
Traditional: font-preahvihear, font-battambang
Modern: font-dangrek, font-koulen
Handwritten: font-fasthand
Serif: font-noto-serif-khmer
```

### English Fonts
```
Script: font-script (Pinyon Script)
Serif: font-serif-elegant (Cormorant)
```

---

## 💡 Implementation Tips

### 1. តាម Template Style
```tsx
// Traditional template
const traditionalFonts = {
  heading: "font-preahvihear",
  name: "font-battambang", 
  body: "font-noto-serif-khmer"
};

// Modern template  
const modernFonts = {
  heading: "font-khmer-moul",
  name: "font-moulpali",
  body: "font-kantumruy"
};

// Romantic template
const romanticFonts = {
  heading: "font-fasthand",
  name: "font-moulpali",
  body: "font-kantumruy"
};
```

### 2. Color Matching
```tsx
// Match font weight to color
<h1 className={`font-khmer-moul text-[${template.primaryColor}]`}>
  សិរីសួស្តី
</h1>
```

### 3. Responsive Sizing
```tsx
// Khmer fonts need larger sizes
<h1 className="font-khmer-moul text-2xl sm:text-3xl lg:text-4xl">
  ចំណងជើង
</h1>

// Body text
<p className="font-kantumruy text-base sm:text-lg">
  អត្ថបទ
</p>
```

---

## 🚀 Next Steps

### For Each Template:

1. ✅ **M2 (Modern Minimal)** - រួចរាល់!
2. 🔄 **M1-M8 Others** - អនុវត្តតាម guide នេះ

### Recommendation:
1. ចាប់ផ្តើមពី template ដែល popular បំផុត
2. ប្រើ M2 font system ជា base reference
3. Customize តាម style នៃ template នីមួយៗ
4. Test លើ mobile និង desktop

---

**Last Updated:** 2026-10-27  
**Status:** 
- ✅ M2 Complete
- 📋 M1, M3-M8 Pending Implementation
