# Product

## Register

product

## Users

**Primary:** Course seekers — students, parents, and job seekers in Samarinda, East Kalimantan searching for tutoring centers by location, category, and proximity to landmarks.

**Secondary:**
- **Course center owners** managing their listings, viewing analytics, and handling reviews
- **Admin moderators** verifying new listings and maintaining data quality

**Context:** Users are on mobile while commuting or planning. They need fast, location-aware results with clear pricing and distance. Indonesian language interface.

## Product Purpose

LesMap Samarinda is a WebGIS directory that maps tutoring and course centers across Samarinda. Users search by category (English, coding, music, etc.), filter by distance from landmarks (UMKT, Big Mall, etc.), and view course details with pricing and contact info.

**Success looks like:** A course seeker finds a relevant center within their desired radius in under 60 seconds and gets directions. An owner sees their listing is verified and getting inquiries. An admin processes verification queue efficiently.

## Brand Personality

**Modern SaaS** — clean, minimal, and functional without being sterile.

- **Confident:** The map and data take center stage. The UI supports, not competes.
- **Clear:** Every label, button, and message is unambiguous in Indonesian context.
- **Efficient:** No unnecessary steps between intent and action.

**Tone:** Professional but approachable. Educational context, not corporate coldness.

## Anti-references

1. **Stripe-style SaaS pages:** Blue gradient hero backgrounds, identical 3-column feature cards, numbered section markers (01/02/03), hero metrics, gradient text, glassmorphism decoratively used.
2. **Generic admin templates:** Dark sidebar + data table + badge patterns that feel like purchased theme. No personality in dashboard states.
3. **Old GIS portals:** Cluttered interfaces, low contrast, overwhelming density, legacy UI patterns.

## Design Principles

1. **Map-first hierarchy:** The map IS the product. All other UI serves navigation and discovery. Map always visible on desktop; accessible via tab on mobile.

2. **Reduce distance, not just clicks:** Radius filtering from landmarks is the core interaction. Make it prominent, not buried in a dropdown.

3. **Scannable at a glance:** Course cards must show category, name, distance, and price without scrolling. Progressive disclosure for details.

4. **Consistent across surfaces:** Landing, search, detail, and admin share the same visual language. No visual rewrites between pages.

5. **Trust through clarity:** Verified badges, transparent pricing ranges, and clear status states (pending/approved/rejected) build user confidence.

## Accessibility & Inclusion

- **WCAG AA** compliance target for all interactive elements and text.
- **Reduced motion** respected via `@media (prefers-reduced-motion: reduce)` alternatives.
- **Color-blind safe:** Status colors paired with icons/text, not color-alone indicators.
- **Touch targets** minimum 44x44px on mobile interactions.
- **Indonesian language** throughout; no mixed-language UI confusion.
