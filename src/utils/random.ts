/** Picks a random item, avoiding `exclude` when the list has alternatives. */
export function pickRandom<T>(items: T[], exclude?: T): T | undefined {
  if (items.length === 0) return undefined;
  const pool = exclude && items.length > 1 ? items.filter((i) => i !== exclude) : items;
  return pool[Math.floor(Math.random() * pool.length)];
}
