/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Fisher-Yates shuffle, returning a new array so callers never mutate the
 * content pack they were handed.
 *
 * Deliberately not `sort(() => Math.random() - 0.5)`: that comparator is
 * inconsistent, so engines produce a noticeably biased order (early items tend
 * to stay early). This is O(n) and uniform — a 500-question chapter costs
 * well under a millisecond, once per session start.
 */
export function shuffled<T>(items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
