# GRADIUS NEON

A browser-based Gradius anthology built with **Vite**, **TypeScript**, and **Three.js**. Fly the Vic Viper (and unlockable ships) through five story arcs, 35 stages, boss rushes, co-op, and a neon arcade hangar hub.

![GRADIUS NEON](https://img.shields.io/badge/stack-Vite%20%2B%20Three.js-00e8ff)

## Live demo

**https://gradius-neon.vercel.app**

## Features

- **Campaign** — 5 arcs, 35 stages with sector briefings and rank scoring
- **Arcade / Score Attack / Boss Rush / Co-op** — multiple mode strategies
- **Power meter** — classic Gradius capsule system (Speed, Missile, Double, Laser, Option, Mystery, Shield)
- **Force RAM** — detachable shield remote weapon
- **Options** — trail, rotate, and formation pods with return-to-core on death
- **Ripple Laser** — unlocked in Campaign from Arc II when Laser is collected
- **Vertical scroll stages** — Salamander / Life Force-style shaft levels (Arc III)
- **Destructible terrain** — laser and missile crack/crumble on organic and mechanical stages
- **Three.js rendering** — bloom post-processing, parallax backgrounds, boss core pulse, engine trails
- **Procedural audio** — Web Audio BGM themes, SFX, boss warning, continue tick, 1-up jingle
- **Hangar hub** — ship select, difficulty, edit mode, codex, high scores, rotating 3D ship preview
- **Mobile** — touch drag move + fire / missile / overdrive buttons

## Tech stack

- [Vite](https://vitejs.dev/) 6 — dev server and production build
- [TypeScript](https://www.typescriptlang.org/) 5.7
- [Three.js](https://threejs.org/) 0.184 — WebGL entities, particles, hangar preview
- Web Audio API — procedural music and SFX
- LocalStorage — hangar progress and high scores

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

### Build

```bash
npm run build
npm run preview
```

## Controls

| Action | Keyboard (P1) | Co-op P2 |
|--------|---------------|----------|
| Move | W/S or ↑/↓ | I/K |
| Strafe (vertical stages) | A/D or ←/→ | J/L |
| Fire | Space | Enter |
| Missile / Force toggle | Shift | — |
| Overdrive | Q | — |
| Pause | P | — |

On mobile, use the on-screen touch zones.

## Deploy

Static SPA — build output is `dist/`. Configured for Vercel via `vercel.json`.

```bash
npx vercel --prod
```

## License

MIT
