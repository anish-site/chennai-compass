# 🧭 Chennai Compass

**Chennai, from my lens** — a curated guide to the cafés, beaches, food spots, heritage and
hangouts I'd actually take my friends to. Built for my college peers.

**Live app:** https://anish-site.github.io/chennai-compass/ *(after Pages is enabled — see below)*

## How it works

- Every place is a **postcard/ticket**: a category stamp, a Chennai postmark, the description
  scribbled like a note, the price as the *fare* — no photos, all personality.
- Tap a card (or **Google it**) → opens the **Google search page** for that place (ratings,
  photos, timings live there).
- Tap the **➤ arrow** → opens **Google Maps directions** straight away.
- Each postcard lists the **nearest Metro / suburban–MRTS station and bus stop**.
- A **Tips for Chennai** carousel rotates survival tips every 5 seconds (swipe or use the arrows).
- **Share** any postcard as a branded image (Instagram, WhatsApp…) via the share button.
- **Surprise me** picks a random spot with a little magic — from the hero button or the menu.
- **Dark mode** (a warm Chennai-night palette, not a black inversion) via the header toggle.
- **Talk like a local** — a starter Tamil phrasebook (vanakkam, nandri, anna, evlo, eppo…) for
  newcomers, editable in `src/data/phrasebook.ts`.
- The **☰ menu** has About, all the tips, a **city roads explainer**, the **Chennai Metro map**
  and the install-as-app option. Drop `maps/city-roads.jpg` / `maps/metro-map.jpg` into
  `public/` to show your own map images in those modals.
- Use the **master filter**: search, category, free/paid & price level, vibe (date spot, group
  hangout, solo/study, family), best time of day, area, and indoor/outdoor.
- The **About** button (top right) has a bit about me and about Chennai.
- The **Install** button adds it to your phone's home screen as an app (PWA).

## Add your own places

Everything lives in [`src/data/places.ts`](src/data/places.ts). Add an entry to the `places`
array and the app picks it up automatically — filters, areas and all:

```ts
{
  id: 'my-spot',
  name: 'My Favourite Spot',
  category: 'Cafés',          // Cafés | Beaches | Food | Heritage | Shopping | Hangouts | Day Trips
  area: 'Adyar',
  description: 'Why I love it, in my own words.',
  price: '₹₹',                // Free | ₹ | ₹₹ | ₹₹₹
  vibes: ['Date spot'],       // Date spot | Group hangout | Solo / study | Family
  bestTime: ['Evening'],      // Morning | Evening | Night
  setting: 'Indoor',          // Indoor | Outdoor
  tags: ['coffee', 'quiet'],
  googleQuery: 'My Favourite Spot Adyar Chennai', // optional, if the name alone is ambiguous
}
```

## SEO / AEO (all invisible)

The build generates crawler-facing content automatically from the place data — nothing shows on
the page:

- **JSON-LD structured data** (schema.org `WebApplication` + an `ItemList` of every place, typed
  as café/restaurant/attraction) injected into `index.html`
- A **`<noscript>` summary** of all places, so AI crawlers that don't run JavaScript still see
  real content
- **`sitemap.xml`** and **`llms.txt`** emitted on build; **`robots.txt`** welcomes Google and AI
  crawlers (GPTBot, ClaudeBot, PerplexityBot)
- Canonical URL, Open Graph and Twitter-card tags for rich link previews

Everything derives from `src/data/places.ts` via `src/utils/seo.ts` — add a place and the SEO
updates itself. If the domain ever changes, update `SITE.url` in `src/utils/seo.ts` (and the
canonical/OG tags in `index.html`).

## Develop

```bash
npm install
npm run dev        # local dev server
npm test           # unit tests (Vitest + Testing Library)
npm run build      # type-check + production build
```

## Deploy

### Vercel (recommended)

1. Sign in at [vercel.com](https://vercel.com) with GitHub and import this repo.
2. Vercel auto-detects Vite (build `npm run build`, output `dist`) — no settings needed.
3. Every push to `main` deploys to production; every branch/PR gets a preview URL.

### GitHub Pages (alternative)

1. In the repo settings → **Pages**, set the source to **GitHub Actions**.
2. The [deploy workflow](.github/workflows/deploy.yml) runs the tests, builds with
   `--base=/chennai-compass/`, and publishes to
   `https://anish-site.github.io/chennai-compass/` on every push to `main`.

Made with 🧡 in Chennai.
