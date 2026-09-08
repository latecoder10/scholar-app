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

// ---------------------------------------------------------------------------
// Answer-position bias
//
// Authored banks skew hard towards the first option — in the CCAF tree the
// correct answer sits at A for 66% of questions, and 88% in one module. That
// teaches position instead of content: always picking A scores a pass mark.
// Options are therefore permuted per question at load time (see
// fetchChapter in contentStore.ts), which also means a chapter revisited later
// presents a different order.
//
// This is safe because a question stores its `answer` as the option *text*,
// never an index, and the components compare by text too — the A/B/C/D label
// is derived from render position. So there is no index to remap.
// ---------------------------------------------------------------------------

/**
 * Options whose meaning depends on where they sit: "All of the above" is wrong
 * anywhere but last, and "Both B and C" names its siblings by position.
 */
// "them" is deliberately not in the anchor set: "Move all of them to managed
// settings" is ordinary prose, not a back-reference to the other options.
const POSITIONAL_OPTION =
  /\b(?:all|none|both|any|either)\s+of\s+(?:the\s+)?(?:above|below|these|those)\b|\bboth\s+\(?[a-d]\)?\s+and\s+\(?[a-d]\)?\b/i;

/**
 * Prose that points at an option by its position — a dozen CIL MT explanations
 * say things like "Option 2 is wrong because…", which reordering would falsify.
 */
const POSITIONAL_PROSE =
  /\b(?:option|choice)s?\s+(?:\d|one|two|three|four|first|second|third|fourth|last)\b|\b(?:first|second|third|fourth|last)\s+(?:option|choice)\b/i;

/**
 * The CCAF bank's "Why distractors fail: **A** — …" convention names options
 * by their authored A/B/C/D letter rather than by text. Shuffling silently
 * detaches the bullet from the option it was written about — this is checked
 * for separately from POSITIONAL_PROSE because it has no "option"/"choice"
 * word for that pattern to key on. Requires the bold markers so it doesn't
 * fire on an unrelated bolded single letter (there are none in this corpus,
 * but the guard costs nothing).
 */
const LETTER_DISTRACTOR_REFERENCE = /\*\*[A-D]\*\*/;

/** The shape option-shuffling needs; the real Question type is a superset. */
interface OptionBearing {
  options?: unknown;
  answer?: unknown;
  question?: unknown;
  explanation?: unknown;
  examTrick?: unknown;
}

/** True when reordering this question's options would break it. */
export function optionsAreOrderDependent(question: OptionBearing): boolean {
  const options = question.options;
  if (!Array.isArray(options)) return true;
  if (options.some((o) => typeof o === "string" && POSITIONAL_OPTION.test(o))) return true;

  // An answer that matches no option is already inconsistent — leave the
  // question exactly as authored rather than shuffling on top of the problem.
  if (typeof question.answer !== "string" || !options.includes(question.answer)) return true;

  return [question.question, question.explanation, question.examTrick].some(
    (text) =>
      typeof text === "string" &&
      (POSITIONAL_PROSE.test(text) || LETTER_DISTRACTOR_REFERENCE.test(text)),
  );
}

/**
 * A copy of the question with its options permuted, or the question untouched
 * when its order carries meaning. Never mutates the input.
 */
export function withShuffledOptions<T extends OptionBearing>(question: T): T {
  if (!question || typeof question !== "object") return question;
  const options = question.options;
  if (!Array.isArray(options) || options.length < 2) return question;
  if (optionsAreOrderDependent(question)) return question;
  return { ...question, options: shuffled(options) };
}
