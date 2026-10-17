# RecallGuardian — web

Canada's safety recalls in one ranked, plain-language feed. Food and medicine
first, with the official Government of Canada source on every item.

Live concept: **recallguardian.ca**

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind v4** (tokens live in `src/app/globals.css`)
- Static generation + ISR — built for SEO

## Data

Single source of truth: the Government of Canada
[Recalls and Safety Alerts](https://recalls-rappels.canada.ca) open-data feed,
which bundles the CFIA, Health Canada, and Transport Canada.

- Feed URL and all logic live in [`src/lib/recalls.ts`](src/lib/recalls.ts).
- The raw feed has **no barcode / UPC / VIN** — matching and search are
  text-based.
- Grouping (7 household categories), severity tier, and the ranking score are
  **ours**, kept in one file so the website and the iOS app rank identically.

### Ranking

```
score = category (Critical 3 · High 2 · Standard 1)
      × class    (Type I 1.5 · Type II 1.2 · Type III 1.0 · none 1.1)
      × recency  (≤30d 1.4 · ≤90d 1.2 · ≤1y 1.0 · older 0.7)
```

## Routes

| Route             | Rendering        | Purpose                                   |
| ----------------- | ---------------- | ----------------------------------------- |
| `/`               | SSR (daily memo) | Ranked feed + category filters            |
| `/recall/[slug]`  | SSG + ISR        | One indexable page per recall (~34k)      |
| `/sitemap.xml`    | dynamic          | Every recall, for crawlers                |
| `/robots.txt`     | static           | Points crawlers at the sitemap            |

The 500 most recent recalls are pre-rendered at build; the rest render on first
visit and are then cached. Pages revalidate once a day.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build (fetches the live feed)
npm run start   # serve the production build
```

## Roadmap

- **V1 (now):** free public ranked feed + SEO recall pages.
- **V2:** optional accounts, a household "Guardian" watchlist, email digests.
- **V3:** scan-to-add capture, province/store filters, bilingual (EN/FR) parity.

---

Recall data © Government of Canada, used under the Open Government Licence.
RecallGuardian re-ranks and rewords; the official notice is authoritative.
