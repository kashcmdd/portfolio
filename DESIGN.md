---
name: KashhCMD Portfolio
description: A cinematic dark portfolio for Discord-bot and web work, built as a static React site.
colors:
  oxide-black: "#0a0a0a"
  oxide-surface: "#141414"
  oxide-raised: "#121212"
  oxide-stroke: "#1f1f1f"
  bone: "#f5f5f5"
  bone-pure: "#ffffff"
  bone-muted: "#878787"
  hairline-strong: "rgba(255, 255, 255, 0.15)"
  steel: "#4e85bf"
  steel-light: "#89aacc"
typography:
  display:
    fontFamily: "Instrument Serif, serif"
    fontSize: "8rem"
    fontWeight: 400
    lineHeight: 0.9
  headline:
    fontFamily: "Instrument Serif, serif"
    fontSize: "6rem"
    fontWeight: 400
    lineHeight: 0.95
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 500
    lineHeight: 1.1
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.3em"
  micro:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    letterSpacing: "0.15em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  nano:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 500
    letterSpacing: "0.15em"
  fine:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  pill: "9999px"
  panel: "24px"
  card: "16px"
  chip: "12px"
spacing:
  section: "112px"
  section-tight: "80px"
  gutter: "24px"
components:
  button-primary:
    backgroundColor: "{colors.oxide-surface}"
    textColor: "{colors.bone}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.bone-muted}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  panel-glass:
    backgroundColor: "{colors.oxide-surface}"
    textColor: "{colors.bone}"
    rounded: "{rounded.panel}"
    padding: "24px"
---

# Design System: KashhCMD Portfolio

## Overview

**Creative North Star: "The Night Atelier"**

A studio at night: black walls, one lamp, work laid out on the bench. The site is quiet and dark on purpose so the work and the typography carry everything. There is no decorative colour, no illustration, no second accent competing for attention — only a near-black field, bone-white text, and a single steel blue that appears when something needs focus.

The density is editorial rather than dashboard: large serif display type, generous vertical rhythm, and surfaces that read as glass panes lit from above. Motion is slow and physical (blur, light, depth), never bouncy. The interface stays out of the work's way; when a project is open, the page should feel like the room dimmed.

**Key Characteristics:**
- Near-black monochrome field with a single functional steel accent
- Serif display voice against a neutral sans body and mono labels
- Liquid-glass surfaces: hairline borders, inset top light, slight blur
- Pill geometry for controls, soft-cornered panels for content
- Slow, ambient motion; reduced-motion honoured everywhere

## Colors

A monochrome scale with one deliberate exception: steel blue, used only where the interface must speak.

### Primary
- **Steel Blue**: the focus ring, the CTA ring and the active signal on interactive controls. It is never a background, never body text, and never decoration.

### Neutral
- **Oxide Black**: the page field. Every surface starts here.
- **Oxide Surface**: raised content — cards, pills, panels.
- **Oxide Raised**: the solid variant of a glass panel, for menus and dialogs that need opacity.
- **Oxide Stroke**: hairline separators, borders and dividers.
- **Bone**: primary text and iconography.
- **Bone Pure**: pure white for the strongest emphasis and active icons.
- **Hairline Strong**: the 15% white border used by the strong glass variant.
- **Bone Muted**: secondary text, metadata, timestamps, placeholders.

### Named Rules
**The One Blue Rule.** Steel appears on ≤2% of any screen, and only as a state signal: focus, the CTA ring, an active marker. If it starts reading as a theme colour, it has been used too much.

**The No-Fill Rule.** There is no coloured block, gradient background or tinted section. Depth comes from light and layering, not from fill.

## Typography

**Display Font:** Instrument Serif (with `serif`)
**Body Font:** Inter (with `system-ui`, `-apple-system`, `sans-serif`)
**Label/Mono Font:** JetBrains Mono (for code, dimensions and small technical labels)

**Character:** An editorial serif against a neutral grotesque: the serif supplies voice and the sans supplies clarity. The pairing is deliberately unfashionable-by-default without being decorative — no second display face, no script.

### Hierarchy
- **Display** (400, 8rem, 0.9): Hero statements only, one per page.
- **Headline** (400, 6rem, 0.95): Section openings and case-study titles.
- **Title** (500, 3rem, 1.1): Card titles, modal headings, journal titles.
- **Body** (400, 1rem, 1.6): Prose and descriptions; measure kept near 65–75ch.
- **Label** (500, 0.75rem, 0.3em tracking, uppercase): Eyebrows, metadata, nav items, buttons.
- **Micro** (500, 0.6875rem, 0.15em tracking): Dense metadata and figure captions; 10–11px is the floor.
- **Mono** (400, 0.875rem, 1.5): Code, dimensions and technical readouts; never prose.
- **Nano** (500, 0.625rem): The dense-data floor; timestamps and counters only.
- **Fine** (400, 0.8125rem, 1.5): Dense secondary copy that is not a label.

### Named Rules
**The Serif-Only-For-Voice Rule.** Instrument Serif is for display and editorial emphasis. It never sets body copy, labels, form values or navigation.

**The One Eyebrow Rule.** Uppercase tracked labels are small and sparse: at most one per section, never stacked above another label.

## Layout

A single centred column with editorial rhythm: sections breathe at roughly 112px vertical (`py-28`), tighter blocks at 80px (`py-20`), and content maxes out between 28rem and 42rem for reading-heavy sections, widening for grids and the hero. Gutters are 24px on mobile.

Controls float rather than sit in a bar: the navigation is a centred glass pill with `pt-4` offset on mobile and `pt-6` on desktop. Sections are separated by space and hairlines, never by coloured bands. The layout is one column on mobile, two at most; the site is not a dashboard and does not fill wide screens edge to edge.

## Elevation & Depth

Depth is optical, not structural. There are almost no drop shadows on content: elevation is communicated by translucent surfaces, a 1px top highlight (`inset 0 1px 1px rgba(255,255,255,0.1)`), and blur (4–10px). The strong glass variant adds one soft ambient shadow for menus and dialogs that must read as detached.

### Shadow Vocabulary
- **Lift (ambient)** (`0 8px 32px rgba(0,0,0,0.5)`): dialogs, menus, the mobile sheet — anything that must float above the page.
- **Top light (inset)** (`inset 0 1px 1px rgba(255,255,255,0.1)`): every glass surface; it is what makes the pane read as lit from above.
- **Ring** (`0 0 0 1px rgb(255 255 255 / 0.06)`): the CTA ring's outer definition.

### Named Rules
**The Light-From-Above Rule.** A glass surface always gets its inset top highlight. Without it the surface flattens into a grey box.

**The Ambient-Only Rule.** Shadows are ambient and soft. No hard, directional or coloured shadows.

## Shapes

Two shapes only. Controls are pills (`9999px`) — nav, buttons, chips, filters, avatars. Content is soft-cornered panels (`24px`), with cards at `16px` and chips at `12px`. Borders are always hairlines at 10–20% white; there are no heavy outlines and no sharp 0-radius boxes except the video letterbox.

The liquid-glass edge treatment is signature: a 1.2px gradient border, bright at top and bottom, fading through the middle, drawn with a masked pseudo-element. It is what separates this from a generic translucent card.

## Components

### Buttons
- **Shape:** pill (`9999px`), hairline border at 10% white.
- **Primary:** oxide surface fill, bone text, label-sized uppercase type, `10px 20px` padding.
- **Hover / Focus:** border lifts to 25% white on hover; focus is a 2px steel-blue ring, never a colour change.
- **Ghost:** transparent fill, bone-muted text, same pill; hover raises text to bone and border to 25%.

### Chips
- **Style:** glass pill, 12px label type, 10% white border, no fill until selected.
- **State:** selected chips raise the border and text; they do not fill with steel.

### Cards / Containers
- **Corner Style:** 16px cards, 24px panels.
- **Background:** oxide surface, or the glass treatment when the card sits over imagery.
- **Shadow Strategy:** ambient only (see Elevation & Depth).
- **Border:** 1px at 10% white; 20% for strong glass.
- **Internal Padding:** 24px, 32px on desktop panels.

### Inputs / Fields
- **Style:** glass pill or soft panel, bone text, bone-muted placeholder, 10% white border.
- **Focus:** 2px steel ring with an offset; the border does not change colour.
- **Error:** copy and icon, not a red field — the palette has no destructive colour.

### Navigation
- **Style:** centred floating glass pill, backdrop blur, hairline border; label-sized uppercase items with muted-to-bone hover.
- **Mobile:** the pill collapses to a menu button that opens the strong glass sheet.

### Signature: Liquid Glass
The recurring surface: 3% white fill, 6px blur, 1px 10% border, inset top highlight, and the masked gradient edge. The strong variant swaps in an 85%-opaque raised surface and a 10px blur for overlays.

## Do's and Don'ts

### Do:
- **Do** keep the field near-black and let type and imagery carry the page.
- **Do** use the steel accent only for focus, the CTA ring, and active state.
- **Do** apply the inset top highlight to every glass surface.
- **Do** keep controls pill-shaped and content panels at 16–24px.
- **Do** honour `prefers-reduced-motion`: no blur or parallax motion when it is set.

### Don't:
- **Don't** introduce a second accent colour, gradient text or tinted sections.
- **Don't** set body copy or UI labels in Instrument Serif.
- **Don't** use hard or coloured shadows, or stack multiple elevation levels at once.
- **Don't** fill selected chips or buttons with steel; states are borders and light.
- **Don't** add sharp-cornered containers or heavy borders.
