/**
 * Fisher-Yates shuffle, returning a new array so callers never mutate the
 * bundled content.
 *
 * Mirrors src/lib/shuffle.ts on the web, and for the same reason: the previous
 * `sort(() => Math.random() - 0.5)` uses an inconsistent comparator, so engines
 * produce a noticeably biased order. Since session pools are also sliced to a
 * limit, that bias changed which questions were served, not just their order.
 */
export function shuffled<T>(items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
