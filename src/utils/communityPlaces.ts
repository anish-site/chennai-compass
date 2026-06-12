import {
  BEST_TIMES,
  CATEGORIES,
  SETTINGS,
  VIBES,
  type BestTime,
  type Category,
  type Place,
  type Price,
  type Setting,
  type Vibe,
} from '../data/places';
import { SHEET_CSV_URL } from '../data/config';

const PRICES: Price[] = ['Free', '₹', '₹₹', '₹₹₹'];

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

/**
 * Maps published-sheet rows (header + data) to Places. Only approved rows
 * with a valid name/area/description/category make it through; everything
 * else degrades to safe defaults rather than breaking the app.
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
    const description = cell(row, 'desc');
    const category = oneOf<Category>(CATEGORIES, cell(row, 'categ'));
    if (!name || !area || !description || !category) continue;

    const vibes = manyOf<Vibe>(VIBES, cell(row, 'vibe'));
    const bestTime = manyOf<BestTime>(BEST_TIMES, cell(row, 'best'));
    places.push({
      id: `community-${slugify(name)}`,
      name,
      category,
      area,
      description,
      price: oneOf<Price>(PRICES, cell(row, 'price')) ?? '₹',
      vibes: vibes.length > 0 ? vibes : ['Group hangout'],
      bestTime: bestTime.length > 0 ? bestTime : ['Evening'],
      setting: oneOf<Setting>(SETTINGS, cell(row, 'setting')) ?? 'Outdoor',
      tags: splitList(cell(row, 'tag')),
      community: true,
    });
  }
  return places;
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
