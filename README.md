# Pulse Logica — Landing Page

Next.js 15 (App Router) + Tailwind CSS. Brand direction: **Pulse/Logic Duality**.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy

This is set up to deploy directly to Vercel:

```bash
npx vercel
```

Or connect the repo in the Vercel dashboard for automatic deploys on push.

## Structure

```
src/
├── app/
│   ├── layout.tsx      — fonts (JetBrains Mono + Source Serif 4), metadata
│   ├── page.tsx         — assembles all sections
│   └── globals.css      — base styles, reduced-motion handling
└── components/
    ├── Nav.tsx
    ├── Hero.tsx          — heartbeat-to-circuit signature motif
    ├── Problem.tsx
    ├── Services.tsx      — two service lines
    ├── Process.tsx       — Diagnose → Document → Build → Handover
    ├── CaseStudies.tsx   — placeholder, badged as illustrative
    ├── Values.tsx
    └── CTAFooter.tsx
```

## Brand tokens (tailwind.config.ts)

| Token | Hex | Use |
|---|---|---|
| `ink` | `#16192B` | Dark backgrounds, primary text |
| `paper` | `#FAF7F2` | Light backgrounds |
| `pulse` | `#E8785A` | Coral accent — energy, CTAs |
| `logic` | `#4FB6A8` | Teal accent — structure, labels |
| `muted` | `#7A7568` | Secondary text |
| `line` | `#E4DDD0` | Hairlines, borders |

Fonts: `font-mono` (JetBrains Mono, headlines/labels) and `font-serif` (Source Serif 4, body copy).

## Open items

- Replace placeholder case studies (Metro Manila retail, Cavite manufacturing) with real client results
- Company profile section — not yet included, decide before v1 launch
- Contact form — currently a `mailto:` link; swap for Formspree or a Vercel serverless function if a proper form is wanted
- Domain: point `pulselogica.com` (Namecheap) to Vercel once registered
