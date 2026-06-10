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
