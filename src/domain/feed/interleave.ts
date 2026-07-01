/**
 * Deterministic review/new interleaving (PDR §7.4 step 3): weave `ratio`
 * review cards between each new-material card — desirable difficulty,
 * mixing concepts rather than blocking them.
 */
export function interleave<T>(reviews: T[], fresh: T[], ratio = 2): T[] {
  const out: T[] = [];
  let r = 0;
  let f = 0;
  while (r < reviews.length || f < fresh.length) {
    for (let k = 0; k < ratio && r < reviews.length; k++) out.push(reviews[r++]!);
    if (f < fresh.length) out.push(fresh[f++]!);
  }
  return out;
}
