---
name: LesMap Samarinda
description: WebGIS directory for tutoring and course centers in Samarinda, East Kalimantan.
colors:
  primary: "#2563EB"
  primary-hover: "#1d4ed8"
  primary-light: "#dbeafe"
  ink: "#030213"
  surface: "#ffffff"
  surface-raised: "#f8fafc"
  neutral-light: "#ececf0"
  neutral-muted-text: "#717182"
  accent-bg: "#e9ebef"
  destructive: "#d4183d"
  destructive-light: "#fee2e2"
  border: "rgba(0,0,0,0.1)"
  border-strong: "rgba(0,0,0,0.15)"
  success: "#16a34a"
  success-light: "#dcfce7"
  warning: "#ca8a04"
  warning-light: "#fef9c3"
  chart-1: "oklch(0.646 0.222 41.116)"
  chart-2: "oklch(0.6 0.118 184.704)"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    letterSpacing: "0"
  small:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  "2xl": "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.surface}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.lg}"
    padding: "24px"
    shadow: "0 1px 3px rgba(0,0,0,0.05)"
  card-hover:
    border: "1px solid {colors.border-strong}"
    shadow: "0 4px 12px rgba(0,0,0,0.08)"
  input:
    backgroundColor: "{colors.surface-raised}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  input-focus:
    border: "1px solid {colors.primary}"
    boxShadow: "0 0 0 3px rgba(37,99,235,0.1)"
  badge-category:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
    fontSize: "0.75rem"
    fontWeight: "600"
  badge-status-approved:
    backgroundColor: "{colors.success-light}"
    textColor: "{colors.success}"
    rounded: "{rounded.sm}"
  badge-status-pending:
    backgroundColor: "{colors.warning-light}"
    textColor: "{colors.warning}"
    rounded: "{rounded.sm}"
---

# Design System: LesMap Samarinda

## 1. Overview

**Creative North Star: "The Municipal Modern"**

A civic-grade WebGIS tool that treats Samarinda's course-seekers with the respect they deserve. Like a well-engineered government portal that actually works — clean, systematic, and trustworthy — but without the coldness of generic SaaS. The map and data are the stars; the UI serves, it does not compete. Every screen asks: "Does this help someone find a course center faster?"

This system explicitly rejects the Stripe-style SaaS aesthetic: blue gradient hero backgrounds, identical 3-column feature cards, numbered section markers (01/02/03), hero metrics, and glassmorphism used decoratively. LesMap is a tool, not a marketing page.

**Key Characteristics:**

- Sky Blue primary with Warm Gray neutrals — professional without being corporate
- Flat surfaces with selective shadows only on interactive/elevated elements
- Approachable and clear — rounded corners, legible typography, educational context without being childish
- Consistent across all surfaces: landing, search, detail, and admin share visual language
- Indonesian language throughout

## 2. Colors: The Sky Blue + Warm Gray Palette

A restrained, professional palette with one vibrant accent. The blue communicates trust and clarity; warm grays provide breathing room without going full cream/parchment AI-default.

### Primary
- **Sky Blue** (#2563EB / oklch): Primary actions, links, active states, map highlights. Used for buttons, badges, focus rings, and the primary navigation indicator. Should appear on ≤15% of any given screen.

- **Sky Blue Hover** (#1d4ed8): Hover state for all primary elements.

- **Sky Blue Light** (#dbeafe): Subtle backgrounds for badges, selected states, and category tags.

### Semantic
- **Success Green** (#16a34a): Approved status, positive indicators. Light variant (#dcfce7) for badges.
- **Warning Amber** (#ca8a04): Pending status, caution states. Light variant (#fef9c3) for badges.
- **Destructive Red** (#d4183d): Errors, rejections, destructive actions. Light variant (#fee2e2) for error states.

### Neutral
- **Ink** (#030213): Primary text, headings, high-emphasis labels. Not pure black — slightly warm for legibility.
- **Surface** (#ffffff): Card backgrounds, input backgrounds, elevated surfaces.
- **Surface Raised** (#f8fafc): Secondary backgrounds, alternating rows, subtle separation.
- **Warm Gray** (#ececf0): Dividers, borders on white surfaces, subtle backgrounds.
- **Muted Text** (#717182): Secondary text, labels, metadata, timestamps.

### Map
- **Chart Blue** (oklch 0.646 0.222 41.116): Map course markers, charts.
- **Chart Teal** (oklch 0.6 0.118 184.704): Landmarks on map, secondary data.
- **Chart Coral** (oklch 0.398 0.07 227.392): Accent data series.

**The Sky Blue Rule.** The primary accent appears on ≤15% of any given screen. Its rarity is the point. Never use it for large background areas or decorative borders.

## 3. Typography

**Display/Body Font:** Inter (with system-ui, sans-serif fallback)

**Character:** Clean and legible at every size. Optimized for Indonesian text with proper diacritic support. The single-family approach keeps the system cohesive — no competing voices between serif and sans.

### Hierarchy
- **Display** (font-weight: 800, clamp(2rem, 5vw, 3rem), line-height: 1.1, letter-spacing: -0.02em): Hero headings only. "Cari Tempat Les Terdekat di Samarinda."
- **Headline** (font-weight: 700, clamp(1.5rem, 3vw, 2rem), line-height: 1.2, letter-spacing: -0.01em): Section headings, page titles.
- **Title** (font-weight: 600, 1.25rem, line-height: 1.3): Card headings, component labels.
- **Body** (font-weight: 400, 1rem, line-height: 1.6): Paragraphs, descriptions. Max line length: 65ch.
- **Label** (font-weight: 500, 0.875rem): Button text, form labels, navigation links.
- **Small** (font-weight: 500, 0.75rem): Badges, metadata, timestamps.

### Named Rules
**The No Ornament Rule.** No decorative typography. No gradient text. No text shadows. Type hierarchy comes from weight and size alone.

## 4. Elevation

Flat surfaces with selective shadows. Most UI elements are flat at rest. Shadows appear only as a response to interaction or to indicate elevation above other content.

### Shadow Vocabulary
- **Subtle** (`0 1px 3px rgba(0,0,0,0.05)`): Cards at rest, input backgrounds. Near-invisible, adds just enough presence.
- **Medium** (`0 4px 12px rgba(0,0,0,0.08)`): Cards on hover, dropdowns, elevated panels.
- **Focus Ring** (`0 0 0 3px rgba(37,99,235,0.1)`): Input focus states, button focus.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only on hover, focus, or when elevating content above other elements. Never ship a card with a shadow just to make it "pop."

## 5. Components

### Buttons
- **Shape:** Rounded-md (10px radius) throughout. No pill buttons except icon-only actions.
- **Primary:** Sky Blue background, white text, medium shadow. Padding: 12px 24px. Hover: darker blue.
- **Secondary:** Surface-raised background, ink text, 1px border. Hover: slightly darker background.
- **Ghost:** Transparent background, ink text. Hover: subtle gray background.
- **Icon Button:** 36x36px minimum touch target, rounded-md.

### Cards / Containers
- **Corner Style:** Rounded-lg (16px radius) for major containers, rounded-md (10px) for cards.
- **Background:** White surface with 1px border (rgba(0,0,0,0.1)).
- **Shadow Strategy:** Subtle shadow at rest, medium shadow on hover.
- **Internal Padding:** 24px for large cards, 16px for compact cards.

### Inputs / Fields
- **Style:** Surface-raised background, 1px border, rounded-md.
- **Focus:** Border shifts to primary blue with focus ring glow.
- **Search Input:** Icon prefix (Search, MapPin), slightly larger padding, rounded-lg.

### Navigation
- **Top Nav:** White background, 1px bottom border, sticky positioning. Active link: Sky Blue background tint, Sky Blue text.
- **Sidebar (Admin):** Dark slate background (#1e293b), light text, hover state with darker background.

### Badges / Tags
- **Category Badge:** Primary Light background, Primary text, rounded-sm, 4px 8px padding, 12px font, bold.
- **Status Badge:** Semantic color backgrounds (success/pending/warning variants), rounded-sm.

### Map Markers
- **Course Marker:** Sky Blue or Green filled circle with icon, white border.
- **Landmark Marker:** Amber/Yellow filled circle with icon, white border.
- **Active Marker:** Scaled 1.25x with ring indicator.

## 6. Do's and Don'ts

### Do:
- **Do** use Sky Blue (#2563EB) for primary actions, links, and the active navigation indicator.
- **Do** keep surfaces flat with shadows appearing only on hover or elevation.
- **Do** use rounded-md (10px) as the default corner radius.
- **Do** maintain the Sky Blue on ≤15% of any screen — its scarcity signals importance.
- **Do** show distance, category, and price on course cards without scrolling.
- **Do** use Inter throughout, varying weight and size for hierarchy.
- **Do** use status colors paired with icons (not color-alone for meaning).

### Don't:
- **Don't** use blue gradient hero backgrounds — solid white or subtle tint only.
- **Don't** use identical 3-column card grids as a default layout pattern.
- **Don't** add numbered section markers (01/02/03) as scaffolding.
- **Don't** use gradient text for headings or emphasis.
- **Don't** use glassmorphism decoratively (blurred backgrounds, semi-transparent cards).
- **Don't** use side-stripe borders (colored left borders >1px on cards or list items).
- **Don't** ship hero metrics (big number + small label) as section headers.
- **Don't** use tiny uppercase tracked eyebrows above every section heading.
- **Don't** apply shadows to cards at rest — only on hover or when elevating.
- **Don't** mix the Sky Blue with competing accent colors on the same surface.
