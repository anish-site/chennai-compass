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
- **Top picks** — a gold-star toggle filters to your standout picks; combine it with a category
  for "my top cafés". Set `topPick: true` in `src/data/places.ts` (curator-only).
- **Category tags** — pick a category and the filter panel offers that category's tags
  (Cafés → rustic, luxury, study-friendly…), defined in `CATEGORY_TAGS` in `src/data/places.ts`.
- **Near me** — one tap sorts every card by straight-line distance from you (with "under 3/5/10
  km" filters). Pure Haversine math on bundled coordinates; no API, location never leaves the
  device.
- **Sunrise/sunset countdown** in the hero — computed locally for Chennai, no API.
- **My passport** — stamp places you've visited; progress lives on-device, and a tiny backup
  link (`#p=…`) restores or shares your stamps on any phone. No accounts, no backend.
- The **☰ menu** has About, all the tips, a **city roads explainer**, the **Chennai Metro map**
  and the install-as-app option. Drop `maps/city-roads.jpg` / `maps/metro-map.jpg` into
  `public/` to show your own map images in those modals.
- Use the **master filter**: search, category, category-specific tags, best time of day, and area.
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

## Friend recommendations via Google Sheets (ready to switch on)

The whole pipeline is built — it activates the moment a sheet URL is configured:

1. Create a **Google Form** with just four questions: *Place name* (short answer), *Area /
   neighbourhood* (short answer), *Category* (dropdown: Cafés, Beaches, Food, Heritage,
   Shopping, Hangouts, Day Trips), *Best time* (checkboxes: Morning, Evening, Night), and
   *Tags* (checkboxes — use the per-category options from `CATEGORY_TAGS` in `places.ts`).
2. In the form's Responses tab click **Link to Sheets**, then add an **Approved** checkbox
   column in the sheet. Only rows you tick ever appear. The card's description is auto-written
   from the tags; top picks stay curator-only (set in `places.ts`). Coordinates are
   **auto-geocoded via OpenStreetMap on each deploy**, so approved places join "near me" sorting
   after the next deploy-hook rebuild. If a pin lands wrong, add optional Latitude/Longitude
   columns to override it.
3. **File → Share → Publish to web → CSV**, copy the URL, and paste it into `SHEET_CSV_URL`
   in [`src/data/config.ts`](src/data/config.ts). Push once.

From then on: visitors see approved places on every page load (with a 🤝 *friend's pick* tag,
fully filterable/searchable like curated ones). For the **SEO** side, create a free
**Deploy Hook** in Vercel (Settings → Git → Deploy Hooks) and open its URL after approving rows
— the rebuild folds the new places into the structured data, noscript content and llms.txt too.
Bad rows can't break anything: unknown categories are skipped, weird values fall back to safe
defaults, and a dead sheet just means no community places.

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
