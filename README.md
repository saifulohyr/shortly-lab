# shortly-lab

URL Shortener & Click Analytics service for SMK Muhammadiyah Majenang (LABMUMA).

## Features
- Clean 6-character Base62 alphanumeric shortcodes via `nanoid`
- Anti-AI-slop UI (grounded slate/stone palette, quiet typography, high contrast)
- Real-time click analytics: total clicks, last clicked, referrers, and user agents
- Built-in QR code SVG generator for physical handouts / lab whiteboards
- In-memory fallback mode for local dev when PostgreSQL is not configured
- Neon PostgreSQL serverless client with pooled connections

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Neon PostgreSQL (`@neondatabase/serverless`)
- Node.js test runner (`node --test`)

## Quickstart
```bash
npm install
npm run build
npm run start
```
