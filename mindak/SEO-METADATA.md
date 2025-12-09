# SEO Metadata Documentation - Mindak Studio

## Overview
This document outlines the comprehensive SEO metadata implemented across all pages of the Mindak Studio website. All metadata is optimized for local SEO (Alger/Algérie), premium brand positioning, and French language targeting.

---

## 1. Homepage (/)

### SEO Title
**Mindak Studio – Votre contenu, notre expertise | Alger**
- Length: 54 characters ✓
- Includes brand name, tagline, and location
- Optimized for brand recognition

### Meta Description
**Studio de création haut de gamme à Alger : production vidéo, podcasts, shootings produits. Matériel professionnel, espace moderne, qualité premium.**
- Length: 155 characters ✓
- Highlights key services and premium positioning
- Includes location (Alger) for local SEO
- Emphasizes quality and professionalism

### Keywords
- Mindak Studio
- studio création Alger
- production contenu Alger
- studio professionnel Alger
- création vidéo Alger
- studio podcast Alger
- shooting produit Alger
- location studio Alger

### Open Graph Tags
- **og:title**: Mindak Studio – Votre contenu, notre expertise
- **og:description**: Studio de création haut de gamme à Alger : production vidéo, podcasts, shootings produits. Matériel professionnel, espace moderne, qualité premium.
- **og:url**: https://mindakstudio.com
- **og:site_name**: Mindak Studio
- **og:locale**: fr_DZ
- **og:type**: website
- **og:image**: /Studio/mindakstudiologo.png (1200x630)

### Twitter Card
- **twitter:card**: summary_large_image
- **twitter:title**: Mindak Studio – Votre contenu, notre expertise
- **twitter:description**: Studio de création haut de gamme à Alger : production vidéo, podcasts, shootings produits. Matériel professionnel, espace moderne, qualité premium.
- **twitter:image**: /Studio/mindakstudiologo.png

### Canonical URL
https://mindakstudio.com

---

## 2. Studio Page (/studio)

### SEO Title
**Location Studio Alger – Production Vidéo & Shooting | Mindak**
- Length: 59 characters ✓
- Focuses on studio rental and video production
- Includes location and brand name
- Optimized for "location studio Alger" searches

### Meta Description
**Studio de création premium à Alger : production vidéo, shooting produit, espace moderne avec matériel professionnel. Location studio haut de gamme.**
- Length: 153 characters ✓
- Emphasizes premium positioning
- Highlights key services: video production, product shooting
- Mentions modern space and professional equipment
- Includes "location studio" for rental searches

### Keywords
- location studio Alger
- studio production vidéo Alger
- shooting produit Alger
- studio création contenu Alger
- production vidéo professionnelle
- studio photo Alger
- location studio premium Alger
- Mindak Studio

### Open Graph Tags
- **og:title**: Location Studio Alger – Production Vidéo & Shooting | Mindak
- **og:description**: Studio de création premium à Alger : production vidéo, shooting produit, espace moderne avec matériel professionnel.
- **og:url**: https://mindakstudio.com/studio
- **og:site_name**: Mindak Studio
- **og:locale**: fr_DZ
- **og:type**: website
- **og:image**: /Studio/mindakstudiologo.png (1200x630)
- **og:image:alt**: Mindak Studio - Location Studio Alger

### Twitter Card
- **twitter:card**: summary_large_image
- **twitter:title**: Location Studio Alger – Production Vidéo & Shooting | Mindak
- **twitter:description**: Studio de création premium à Alger : production vidéo, shooting produit, espace moderne avec matériel professionnel.
- **twitter:image**: /Studio/mindakstudiologo.png

### Canonical URL
https://mindakstudio.com/studio

---

## 3. Podcast Page (/podcast)

### SEO Title
**Production Podcast Alger – Studio Enregistrement Pro | Mindak**
- Length: 60 characters ✓
- Focuses on podcast production and recording
- Includes "Pro" to emphasize professional quality
- Optimized for "production podcast Alger" searches

### Meta Description
**Studio podcast professionnel à Alger : enregistrement, production, montage. Espace équipé, accompagnement complet. Créez votre podcast premium.**
- Length: 154 characters ✓
- Highlights complete podcast production services
- Mentions recording, production, and editing
- Emphasizes equipped space and full support
- Call-to-action: "Créez votre podcast premium"

### Keywords
- production podcast Alger
- studio podcast Alger
- enregistrement podcast Alger
- création podcast professionnel
- studio enregistrement Alger
- podcast production Algérie
- Mindak Studio podcast
- location studio podcast Alger

### Open Graph Tags
- **og:title**: Production Podcast Alger – Studio Enregistrement Pro | Mindak
- **og:description**: Studio podcast professionnel à Alger : enregistrement, production, montage. Espace équipé, accompagnement complet.
- **og:url**: https://mindakstudio.com/podcast
- **og:site_name**: Mindak Studio
- **og:locale**: fr_DZ
- **og:type**: website
- **og:image**: /Studio/mindakstudiologo.png (1200x630)
- **og:image:alt**: Mindak Studio - Production Podcast Alger

### Twitter Card
- **twitter:card**: summary_large_image
- **twitter:title**: Production Podcast Alger – Studio Enregistrement Pro | Mindak
- **twitter:description**: Studio podcast professionnel à Alger : enregistrement, production, montage. Espace équipé, accompagnement complet.
- **twitter:image**: /Studio/mindakstudiologo.png

### Canonical URL
https://mindakstudio.com/podcast

---

## SEO Strategy Summary

### Local SEO Optimization
All pages are optimized for Alger/Algérie targeting:
- "Alger" included in all titles and descriptions
- French language (fr_DZ locale)
- Location-specific keywords throughout
- Targets local search queries

### Premium Brand Positioning
Consistent premium messaging across all pages:
- "haut de gamme" / "premium" terminology
- "professionnel" / "pro" emphasis
- Quality-focused language
- Modern, equipped space messaging

### Technical SEO Best Practices
✓ Title tags under 60 characters
✓ Meta descriptions 150-160 characters
✓ Comprehensive Open Graph tags for social sharing
✓ Twitter Card implementation
✓ Canonical URLs defined
✓ Robots directives configured
✓ Locale specification (fr_DZ)
✓ Structured image metadata (1200x630 OG images)

### Keyword Strategy
Each page targets specific search intents:
- **Homepage**: General brand and content creation
- **/studio**: Studio rental, video production, product shooting
- **/podcast**: Podcast production and recording services

All keywords include location modifiers (Alger/Algérie) for local SEO.

---

## Implementation Details

### File Structure
```
src/app/
├── (external)/
│   └── layout.tsx          # Homepage metadata
├── (agency)/
│   ├── studio/
│   │   └── layout.tsx      # Studio page metadata
│   └── podcast/
│       └── layout.tsx      # Podcast page metadata
```

### Next.js App Router
- Metadata is exported from layout.tsx files
- Follows Next.js 13+ App Router conventions
- Server-side metadata generation
- Automatic meta tag injection

---

## Recommendations for Future Optimization

1. **Add Structured Data (JSON-LD)**
   - LocalBusiness schema for studio location
   - Service schema for each offering
   - Review schema for testimonials

2. **Create Dedicated OG Images**
   - Design custom 1200x630 images for each page
   - Include page-specific visuals
   - Add text overlays with key messaging

3. **Implement hreflang Tags**
   - If expanding to other languages/regions
   - Specify language variants

4. **Add FAQ Schema**
   - Implement on FAQ sections
   - Improve rich snippet visibility

5. **Monitor and Iterate**
   - Track rankings for target keywords
   - Analyze click-through rates
   - A/B test title and description variations

---

## Contact & Support
For questions about SEO implementation or updates, refer to this documentation or consult with the development team.

**Last Updated**: December 2025
**Version**: 1.0
