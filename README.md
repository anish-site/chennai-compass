# 🧭 Chennai Compass

**Chennai, from my lens** — a curated guide to the cafés, beaches, food spots, heritage and
hangouts I'd actually take my friends to. Built for my college peers.

**Live app:** https://anish-site.github.io/chennai-compass/ *(after Pages is enabled — see below)*

## How it works

- Tap any card → opens the **Google search page** for that place (ratings, photos, timings).
- Tap the **➤ arrow** on a card → opens **Google Maps directions** straight away.
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
  image: 'https://images.unsplash.com/…',
  googleQuery: 'My Favourite Spot Adyar Chennai', // optional, if the name alone is ambiguous
}
```

## Real photos from Google Maps (optional)

Out of the box the cards use bundled images. Add a Google Maps API key and every card
shows the **real photo from that place's Google Maps listing** (Google puts owner /
representative photos first), with the photographer credited on the image.

1. Create a project at [console.cloud.google.com](https://console.cloud.google.com), enable
   billing (the free monthly tier comfortably covers a friends-scale app) and enable only the
   **Places API (New)**.
2. Create an API key and restrict it: *Application restrictions → Websites* — add
   `http://localhost:5173/*` and your deployed domain (e.g. `https://chennai-compass.vercel.app/*`);
   *API restrictions* — Places API (New) only. This keeps the key safe to ship in a frontend.
3. Locally: `cp .env.example .env.local` and paste the key. On Vercel: Project → Settings →
   Environment Variables → add `VITE_GOOGLE_MAPS_API_KEY`, then redeploy.
4. (Recommended) Pin exact listings and halve API usage:
   `GOOGLE_MAPS_API_KEY=your-key node scripts/resolve-place-ids.mjs` — fills in `placeId` for
   every place in `src/data/places.ts`; review the printed matches and commit.

Photos are cached in the visitor's browser for 7 days, so repeat visits make no API calls.
If a lookup fails, the card silently falls back to the bundled image.

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
