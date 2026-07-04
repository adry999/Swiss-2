# Swiss Cars

Car dealership website for the Moldovan market — cars imported from Switzerland, sold **in stock** and **on order**. Mobile-first, SEO-strong (SSR).

## Stack

- **Nuxt 3** (SSR) + TypeScript strict
- **Tailwind CSS v4** with a custom design-token layer (`assets/css/main.css`)
- **Pinia** for client state (filters, favorites)
- **PostgreSQL + Drizzle ORM** (`server/db`)
- **Cloudflare R2** for images (thumbnails/webp via `sharp`)
- **nuxt-auth-utils** for admin session auth (`admin`, `sales_manager` roles)
- **@nuxtjs/i18n** — RO (default), RU, EN

## Getting started

```bash
cp .env.example .env        # fill in secrets
docker compose up -d        # local PostgreSQL
pnpm install
pnpm db:migrate             # apply migrations
pnpm db:seed                # lookup data + 6 sample vehicles
pnpm dev
```

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Dev server at `localhost:3000` |
| `pnpm build` | Production build |
| `pnpm db:generate` | Generate SQL migrations from `server/db/schema.ts` |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:seed` | Seed lookups, sellers, sample vehicles, settings |

## Folder structure

```
├── assets/css/main.css     # Tailwind v4 + Swiss Cars design tokens
├── components/             # Small reusable UI (VehicleCard, FilterSheet, …)
├── composables/            # Shared client logic
├── i18n/locales/           # ro.json / ru.json / en.json
├── layouts/default.vue     # Sticky header, footer, WhatsApp float
├── pages/                  # Public pages + /admin (auth-gated)
├── server/
│   ├── api/                # Nuxt server routes (modular monolith)
│   ├── db/
│   │   ├── schema.ts       # Drizzle schema (single source of truth)
│   │   ├── migrations/     # Generated SQL migrations
│   │   ├── index.ts        # DB client
│   │   └── seed.ts         # Seed script
│   └── utils/              # Server helpers (slug/product-code, R2, auth)
├── stores/                 # Pinia stores
├── docker-compose.yml      # Local dev: PostgreSQL
└── drizzle.config.ts
```

## Brand

Swiss theme — white-dominant, `#DA291C` red as accent only (buttons, prices, badges, active filters). Font: Manrope. Status badges: In Stock (red solid), On Order (red outline), Reserved (grey), Sold (muted strikethrough).
