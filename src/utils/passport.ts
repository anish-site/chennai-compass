import { places } from '../data/places';

// The backup link encodes which places are stamped as a bitmask over the
// alphabetically-sorted curated place ids — a ~7-character code instead of
// a list of names. Format: 1-<count>-<hex bits> (versioned so the format
// can evolve without breaking old links).
const VERSION = '1';

function sortedIds(): string[] {
  return places.map((p) => p.id).sort();
}

export function encodePassport(visited: string[]): string {
  const ids = sortedIds();
  let bits = 0n;
  ids.forEach((id, i) => {
    if (visited.includes(id)) bits |= 1n << BigInt(i);
  });
  return `${VERSION}-${ids.length.toString(36)}-${bits.toString(16)}`;
}

/** Decodes a backup code; unknown/garbled codes safely yield no stamps. */
export function decodePassport(code: string): string[] {
  const match = /^1-[0-9a-z]+-([0-9a-f]+)$/i.exec(code.trim());
  if (!match) return [];
  let bits: bigint;
  try {
    bits = BigInt(`0x${match[1]}`);
  } catch {
    return [];
  }
  const ids = sortedIds();
  return ids.filter((_, i) => (bits >> BigInt(i)) & 1n);
}

export function passportUrl(visited: string[], origin: string): string {
  return `${origin}/#p=${encodePassport(visited)}`;
}
