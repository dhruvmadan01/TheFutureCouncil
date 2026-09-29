---
trigger: glob
globs: "**/*.{tsx,jsx,css}"
description: TFC design system (colours, type, components) for all UI work
---

# TFC design system ("Builder World" from thefuturecouncil.in)

All UI must look like it belongs on thefuturecouncil.in. The tokens are already in `src/app/globals.css` (copied from `design/tokens.css`). Use the Tailwind classes they generate. **Never hardcode hex values in components.**

## Colour tokens
| Token | Hex | Use |
|---|---|---|
| `warm` | #FFF4E8 | page background |
| `warm-2` | #FBE6D4 | soft panels, hover |
| `card` | #FFFFFF | cards |
| `line` | #EAD7C6 | borders, dividers |
| `ink` | #1B1712 | main text, dark buttons, dark sections |
| `ink-soft` | #5A4E44 | secondary text |
| `mute` | #8C7D70 | captions, placeholders |
| `orange` | #E2542A | primary action, brand accent |
| `orange-deep` | #AE3D18 | hover, and orange text on cream (for contrast) |
| `orange-soft` | #FFE9DF | orange tints ("why you match" box, selected chips) |
| `forest` | #1F5A45 / `forest-soft` #E8F1ED | Verified, success, "We teamed up" |
| `ballpoint` | #2C4A9A / `ballpoint-soft` #E6EBF7 | Hiring, links, info |
| `amber` | #9A6412 / `amber-soft` #FBEFD6 | Raising |
| `plum` | #9C2F52 / `plum-soft` #F8E4EA | Needs co-founder, destructive |

Status chips always mean the same thing: Verified = forest, TFC Backed = orange, Hiring = ballpoint, Raising = amber, Needs co-founder = plum.

## Typography (load with next/font/google)
- **Bricolage Grotesque** 800 for headings, big numbers and the brand wordmark. Tracking −0.02em, line-height 1.05. Class `font-display`.
- **Instrument Sans** 400/500/600 for body, UI text and buttons. Class `font-sans` (default).
- **IBM Plex Mono** 500/600, uppercase, tracking 0.08–0.1em, 11–12px for labels, eyebrows, metadata and stamps. Class `font-mono`.
- Eyebrow pattern: a small glowing orange dot followed by a mono uppercase label in `orange-deep`.

## Shape and components
- **Buttons are pills** (`rounded-full`). Variants:
  - `solid`: orange background, white text, hover orange-deep
  - `dark`: ink background, warm text
  - `forest`: for "We teamed up"
  - `ghost`: white background, 1px line border
- **Chips/tags are pills.** Use the tint background with the matching strong text colour.
- **Cards:** white, 1px `line` border, `rounded-2xl` (16–18px), shadow `0 10px 30px -18px rgb(27 23 18 / .12)`.
- **Inputs:** white, 1px `line` border, rounded-xl. Search fields are pills. Focus: 3px orange outline with offset.
- **Logo:** `public/logo.png` (orange square, black "TFC"). Show it at 24–28px with a 6px radius next to "TFC Connect" in Bricolage 800.
- **Dark sections** (like the site's "campus at night") use an `ink` background, `warm` text, and college chips with a 1px #4A3F35 border and a glowing orange dot.
- **Dashed path motif:** a 3px dashed orange line connecting numbered pins, for onboarding steps and "how it works".

## Layout
- Mobile-first. Design at 390px first. Minimum 44px tap targets. Signed-in mobile pages use a 64px bottom tab bar.
- Desktop content max-width is 1180px with the gutter `clamp(16px, 4vw, 48px)`.
- Contrast must be at least 4.5:1. Use `orange-deep` for orange text on cream. Never use colour alone to carry meaning (chips always carry text).
