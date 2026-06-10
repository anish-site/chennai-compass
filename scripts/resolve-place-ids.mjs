// One-time helper: looks up the Google Maps place ID for every place in
// src/data/places.ts and writes it into the file. Pinning place IDs makes
// runtime photo lookups cheaper (Place Details instead of Text Search) and
// guarantees each card shows the exact listing.
//
// Usage: GOOGLE_MAPS_API_KEY=your-key node scripts/resolve-place-ids.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!KEY) {
  console.error('Set GOOGLE_MAPS_API_KEY first, e.g.:');
  console.error('  GOOGLE_MAPS_API_KEY=AIza… node scripts/resolve-place-ids.mjs');
  process.exit(1);
}

const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'places.ts');
let source = readFileSync(file, 'utf8');

async function searchPlaceId(textQuery) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress',
    },
    body: JSON.stringify({ textQuery }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return (await res.json()).places?.[0];
}

const blocks = [...source.matchAll(/\n  \{[\s\S]*?\n  \},/g)];
let resolved = 0;
let skipped = 0;

for (const [block] of blocks) {
  const id = block.match(/id: '([^']+)'/)?.[1];
  const name = block.match(/name: (['"])(.*?)\1/)?.[2];
  if (!id || !name) continue;
  if (block.includes('placeId:')) {
    skipped++;
    continue;
  }
  const query = block.match(/googleQuery: '([^']+)'/)?.[1] ?? `${name} Chennai`;
  try {
    const top = await searchPlaceId(query);
    if (!top?.id) {
      console.warn(`✗ ${name}: no result for "${query}"`);
      continue;
    }
    console.log(`✓ ${name} → ${top.id} (${top.displayName?.text} · ${top.formattedAddress})`);
    const patched = block.replace(/(\n    id: '[^']+',)/, `$1\n    placeId: '${top.id}',`);
    source = source.replace(block, patched);
    resolved++;
  } catch (err) {
    console.warn(`✗ ${name}: ${err.message}`);
  }
}

writeFileSync(file, source);
console.log(`\nDone: ${resolved} resolved, ${skipped} already had placeId.`);
console.log('Review the diff (the address printed above tells you if a match looks wrong).');
