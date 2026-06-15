/**
 * Community recommendations via Google Sheets.
 *
 * Once your Google Form is linked to a Sheet and the sheet is published as
 * CSV (File → Share → Publish to web → CSV), paste the published CSV URL
 * here and push. That's the only switch — runtime and build-time SEO both
 * pick it up.
 *
 * Expected columns (header row, order doesn't matter, extra columns fine):
 *   Name | Area | Category | Description | Price | Vibes | Best time |
 *   Setting | Tags | Approved
 * - Coordinates are found automatically: each deploy geocodes new places
 *   via OpenStreetMap so they join "near me" sorting. If a pin ever lands
 *   wrong, add optional Latitude/Longitude columns — values there override
 *   the auto lookup.
 * - Add an optional "Top pick" column (TRUE/yes) to flag your standout
 *   picks — they get a gold star and show under the "Top picks" filter.
 * - Category: one of the app's categories (Cafés, Beaches, Food, Heritage,
 *   Shopping, Hangouts, Day Trips)
 * - Price: Free, ₹, ₹₹ or ₹₹₹
 * - Vibes / Best time / Tags: comma-separated (Forms checkboxes do this)
 * - Approved: TRUE — only rows you approve appear anywhere.
 *
 * Keeping SEO fresh: in Vercel → Project → Settings → Git → Deploy Hooks,
 * create a hook and bookmark its URL. After approving rows, open that URL
 * once — Vercel rebuilds and the new places enter the JSON-LD/llms.txt too.
 * (Visitors already see approved rows on page load without a rebuild.)
 */
export const SHEET_CSV_URL = '';
