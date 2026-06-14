# Design Brief Templates by Website Type

Use during Stage 9 to select the right visual style and generate exact color palettes, fonts, and layout directions.

---

## Style Selector by Website Type

| Website Type | Recommended Style | Key Feeling |
|---|---|---|
| SaaS / Productivity tool | Clean & Minimal | Fast, focused, professional |
| E-commerce (general) | Warm & Friendly | Approachable, trustworthy |
| E-commerce (luxury/fashion) | Dark & Premium | Exclusive, aspirational |
| Marketplace | Clean & Minimal | Trustworthy, organised |
| Portfolio / Creative | Bold & Energetic OR Playful | Memorable, distinctive |
| Startup / Tech | Clean & Minimal OR Bold | Modern, innovative |
| Community / Forum | Warm & Friendly | Welcoming, inclusive |
| Health / Wellness | Warm & Friendly | Calming, trustworthy |
| Finance / Legal | Professional & Corporate | Reliable, serious |
| Food / Restaurant | Warm & Friendly | Sensory, inviting |
| Kids / Education | Playful & Creative | Fun, safe, encouraging |
| Non-profit | Warm & Friendly | Human, inspiring |

---

## Pre-Built Palettes

### 1. Clean & Minimal (SaaS, Productivity, Marketplace)
```
Primary:    #6366F1  (Indigo)
Secondary:  #8B5CF6  (Purple)
Accent:     #06B6D4  (Cyan)
Background: #FFFFFF
Surface:    #F8FAFC
Text:       #0F172A
Text-muted: #64748B
```
Heading font: Inter (or Geist)
Body font: Inter
Border radius: 8px
Button style: Rounded (6px), solid fill
Shadow: subtle — box-shadow: 0 1px 3px rgba(0,0,0,0.1)
Inspiration: Linear.app, Vercel.com, Notion.so

---

### 2. Warm & Friendly (E-commerce, Community, Food, Health)
```
Primary:    #F97316  (Orange)
Secondary:  #FB923C  (Light Orange)
Accent:     #FBBF24  (Amber)
Background: #FFFBF5
Surface:    #FFFFFF
Text:       #1C1917
Text-muted: #78716C
```
Heading font: Plus Jakarta Sans
Body font: Inter
Border radius: 12px
Button style: Pill (9999px), solid and warm
Shadow: medium — box-shadow: 0 4px 12px rgba(0,0,0,0.08)
Inspiration: Airbnb.com, Etsy.com, Duolingo.com

---

### 3. Bold & Energetic (Startup, Sports, Creator, Events)
```
Primary:    #EF4444  (Red) OR #7C3AED  (Violet) — pick one
Secondary:  #1D1D1D  (Near black)
Accent:     #FACC15  (Yellow)
Background: #FFFFFF  OR  #0A0A0A  (dark version)
Surface:    #F4F4F5  OR  #18181B
Text:       #09090B  OR  #FAFAFA
Text-muted: #71717A
```
Heading font: Syne OR Space Grotesk (bold, personality)
Body font: Inter
Border radius: 4px (sharp feels bold)
Button style: Square corners, thick border, hover with color invert
Shadow: none or very sharp — box-shadow: 4px 4px 0px #000000
Inspiration: Framer.com, Linear.app (dark), Stripe.com

---

### 4. Professional & Corporate (Finance, Legal, B2B, Insurance)
```
Primary:    #1E40AF  (Deep Blue)
Secondary:  #1E3A5F  (Navy)
Accent:     #0EA5E9  (Sky Blue)
Background: #FFFFFF
Surface:    #F0F4F8
Text:       #1E293B
Text-muted: #475569
```
Heading font: Merriweather OR Lora (serif feels authoritative)
Body font: Source Sans Pro
Border radius: 4px (structured, not playful)
Button style: Rectangular, solid primary blue
Shadow: minimal — box-shadow: 0 1px 2px rgba(0,0,0,0.05)
Inspiration: Stripe.com, Intercom.com, HubSpot.com

---

### 5. Dark & Premium (Luxury, High-end E-commerce, Tech, Gaming)
```
Primary:    #F5C518  (Gold) OR #E2E8F0  (Silver-white)
Secondary:  #A78BFA  (Soft violet)
Accent:     #38BDF8  (Sky)
Background: #0A0A0A
Surface:    #171717
Border:     #262626
Text:       #FAFAFA
Text-muted: #A1A1AA
```
Heading font: Playfair Display (serif for luxury) OR Space Grotesk
Body font: Inter
Border radius: 6px
Button style: Outlined in light color OR solid gold/accent
Shadow: glow — box-shadow: 0 0 20px rgba(245,197,24,0.2)
Inspiration: Apple.com, Vercel.com (dark), Stripe.com (dark)

---

### 6. Playful & Creative (Kids, Gaming, Creative tools, Fun apps)
```
Primary:    #8B5CF6  (Purple)
Secondary:  #EC4899  (Pink)
Accent:     #10B981  (Green)
Background: #FEFCE8  (Soft yellow-white)
Surface:    #FFFFFF
Text:       #1C1917
Text-muted: #78716C
```
Heading font: Nunito OR Poppins (rounded, friendly)
Body font: Nunito
Border radius: 16px (very rounded = friendly)
Button style: Extra rounded (9999px), bold, colorful
Shadow: playful — box-shadow: 4px 4px 0px rgba(0,0,0,0.15)
Inspiration: Duolingo.com, Notion.so (fun mode), Canva.com

---

## Layout Patterns by Website Type

### Landing Page (SaaS, Startup)
```
Section order:
1. Navbar (logo left, links center, CTA button right)
2. Hero (headline + subheadline + 2 buttons + product screenshot/mockup)
3. Social proof bar (logos of companies using it, or user count)
4. Problem → Solution section
5. Features (3-column grid with icons)
6. How it works (3-step process, numbered)
7. Testimonials (3 cards)
8. Pricing (2-3 plans)
9. FAQ (accordion)
10. Final CTA banner
11. Footer
```

### E-commerce
```
Section order:
1. Navbar with cart icon + search
2. Hero banner (promotional or brand statement)
3. Category grid (shop by category)
4. Featured products (horizontal scroll or 4-column grid)
5. Trust badges (Free shipping, Returns, Secure payment)
6. About / Brand story (brief)
7. Instagram feed / UGC section (optional)
8. Newsletter signup
9. Footer
```

### Portfolio / Freelancer
```
Section order:
1. Navbar (minimal — name + 3-4 links)
2. Hero (name, role, one-line value prop, photo)
3. Selected work (2-3 case studies, large images)
4. Skills / Services
5. About (brief, personal)
6. Testimonials (2-3)
7. Contact CTA
8. Footer
```

### Marketplace
```
Section order:
1. Navbar with search bar prominent
2. Hero with search bar
3. Category navigation
4. Featured listings
5. How it works (for both buyer and seller)
6. Trust signals
7. Recent/Popular listings
8. Footer
```

---

## Icon Library Recommendations

| Style | Library | Import Method |
|---|---|---|
| Outline (modern, clean) | Lucide | npm install lucide-react |
| Solid + Outline | Heroicons | npm install @heroicons/react |
| Colorful / Illustrated | Phosphor Icons | npm install phosphor-react |
| Brand icons | React Icons | npm install react-icons |
| Animated | Lottie files | lottiefiles.com (free) |

Always use a consistent icon style — never mix outline and solid icons on the same page.

---

## Free Image Resources

| Source | Best For | License |
|---|---|---|
| unsplash.com | People, places, lifestyle | Free commercial use |
| pexels.com | Everything | Free commercial use |
| undraw.co | Illustrations (customizable color) | Free |
| storyset.com | Animated illustrations | Free with attribution |
| blush.design | Diverse people illustrations | Free tier |
| haikei.app | Abstract SVG backgrounds | Free |
| heropatterns.com | Subtle background patterns | Free |
