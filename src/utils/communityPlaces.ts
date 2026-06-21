import { BEST_TIMES, CATEGORIES, type BestTime, type Category, type Place } from '../data/places';
import { SHEET_CSV_URL } from '../data/config';

const A = (w: string) => (/^[aeiou]/i.test(w) ? 'An' : 'A');

const CATEGORY_NOUN: Record<Category, string> = {
  'Cafés': 'café',
  Beaches: 'beach',
  Food: 'food spot',
  Heritage: 'heritage spot',
  Shopping: 'shopping spot',
  Hangouts: 'hangout',
  'Day Trips': 'day trip',
};

/** A small postcard line built from the tags, since the sheet has no description. */
export function autoDescription(category: Category, area: string, tags: string[]): string {
  const noun = CATEGORY_NOUN[category];
  const adjectives = tags.slice(0, 2).join(', ').replace(/-/g, ' ');
  const lead = adjectives ? `${A(adjectives)} ${adjectives} ${noun}` : `${A(noun)} ${noun}`;
  return `${lead} in ${area}.`;
}

/** Minimal RFC-4180 CSV parser: quoted fields, escaped quotes, newlines in quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function splitList(cell: string): string[] {
  return cell
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function oneOf<T extends string>(allowed: readonly T[], value: string): T | undefined {
  const needle = value.trim().toLowerCase();
  return allowed.find((a) => a.toLowerCase() === needle);
}

function manyOf<T extends string>(allowed: readonly T[], cell: string): T[] {
  return splitList(cell)
    .map((v) => oneOf(allowed, v))
    .filter((v): v is T => v !== undefined);
}

function isApproved(cell: string): boolean {
  return ['true', 'yes', 'y', '1'].includes(cell.trim().toLowerCase());
}

/** Optional sheet coords (paste from Google Maps while approving a row). */
function parseCoords(latCell: string, lngCell: string): Place['coords'] {
  const lat = Number.parseFloat(latCell);
  const lng = Number.parseFloat(lngCell);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return undefined;
  return { lat, lng };
}

/**
 * Maps published-sheet rows (header + data) to Places. The sheet is simple —
 * Name, Area, Category, Best time, Tags (+ Approved, optional Lat/Long). Only
 * approved rows with a valid name/area/category make it through; the
 * description is written from the tags. Top picks are curator-only (set in
 * places.ts), never from the sheet.
 */
export function rowsToPlaces(rows: string[][]): Place[] {
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = (key: string) => header.findIndex((h) => h.includes(key));
  const cell = (row: string[], key: string) => {
    const i = col(key);
    return i >= 0 ? (row[i] ?? '').trim() : '';
  };

  const places: Place[] = [];
  for (const row of rows.slice(1)) {
    if (!isApproved(cell(row, 'approv'))) continue;
    const name = cell(row, 'name');
    const area = cell(row, 'area');
    const category = oneOf<Category>(CATEGORIES, cell(row, 'categ'));
    if (!name || !area || !category) continue;

    const bestTime = manyOf<BestTime>(BEST_TIMES, cell(row, 'best'));
    const tags = splitList(cell(row, 'tag'));
    places.push({
      id: `community-${slugify(name)}`,
      name,
      category,
      area,
      description: autoDescription(category, area, tags),
      bestTime: bestTime.length > 0 ? bestTime : ['Evening'],
      tags,
      community: true,
      coords: parseCoords(cell(row, 'lat'), cell(row, 'lon')),
    });
  }
  return places;
}

/**
 * Combines the build-time snapshot (which has geocoded coords baked in)
 * with the live sheet (which may have newer rows). Live rows win on
 * content; rows the build already geocoded inherit their coords. If the
 * live fetch failed, the snapshot still works offline-ish.
 */
export function mergeCommunity(baked: Place[], live: Place[]): Place[] {
  if (live.length === 0) return baked;
  const bakedById = new Map(baked.map((p) => [p.id, p]));
  return live.map((p) => (p.coords ? p : { ...p, coords: bakedById.get(p.id)?.coords }));
}

/**
 * Fetches the published sheet and returns approved places. Never throws:
 * no URL, network failure or a bad response all mean "no community places".
 * Works both in the browser (runtime) and in Node during `vite build`.
 */
export async function fetchCommunityPlaces(url: string = SHEET_CSV_URL): Promise<Place[]> {
  if (!url) return [];
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    return rowsToPlaces(parseCsv(await res.text()));
  } catch {
    return [];
  }
}
