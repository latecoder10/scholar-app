/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared PDF text helpers for the export scripts.
 *
 * Both exporters need the same two things: fold content down to the WinAnsi
 * range pdfkit's built-in fonts can actually draw, and render the small
 * markdown subset the question banks are authored in (**bold**, `code`,
 * bullet and numbered lists).
 */

/**
 * pdfkit's built-in Helvetica is WinAnsi-encoded, so anything outside that
 * range draws as garbage. Fold the symbols the content packs actually use
 * down to ASCII rather than embedding a Unicode font.
 */
export function toAscii(s: unknown): string {
  return String(s ?? "")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/→/g, "->")
    .replace(/≤/g, "<=")
    .replace(/≥/g, ">=")
    .replace(/≠/g, "!=")
    .replace(/×/g, "x")
    .replace(/·/g, "-")
    .replace(/…/g, "...")
    .replace(/α/g, "alpha")
    .replace(/β/g, "beta")
    .replace(/θ/g, "theta")
    .replace(/λ/g, "lambda")
    .replace(/μ/g, "mu")
    .replace(/Ω/g, "Omega")
    .replace(/∞/g, "infinity")
    .replace(/∑/g, "sum")
    .replace(/[^\x20-\x7E\n]/g, "");
}

export interface Run {
  text: string;
  style: "normal" | "bold" | "code";
}

/**
 * Split one line into styled runs. Code spans are matched first so markers
 * inside them stay literal, then bold.
 *
 * The bold delimiters carry a glob guard. The content legitimately contains
 * shell globs (double-star slash patterns such as a recursive TypeScript or
 * docs match) and reading those as emphasis would silently swallow real
 * characters. A bold run therefore may not open with, or close on, a slash or
 * a star. Unpaired markers are left in place for the same reason: deleting
 * them would corrupt a glob.
 */
export function inlineRuns(line: string): Run[] {
  const runs: Run[] = [];
  const pattern = /`([^`]+)`|\*\*(?![/*])(.+?)(?<![/*])\*\*/g;
  let cursor = 0;
  let m: RegExpExecArray | null;

  const pushPlain = (text: string) => {
    if (text) runs.push({ text, style: "normal" });
  };

  while ((m = pattern.exec(line)) !== null) {
    if (m.index > cursor) pushPlain(line.slice(cursor, m.index));
    if (m[1] !== undefined) runs.push({ text: m[1], style: "code" });
    else runs.push({ text: m[2], style: "bold" });
    cursor = m.index + m[0].length;
  }
  if (cursor < line.length) pushPlain(line.slice(cursor));

  return runs.length ? runs : [{ text: "", style: "normal" }];
}

const FONT_FOR: Record<Run["style"], string> = {
  normal: "Helvetica",
  bold: "Helvetica-Bold",
  code: "Courier",
};

export interface RichOptions {
  size: number;
  color: string;
  /** Left offset from the page margin, in points. */
  indent?: number;
  /** Called before each line so the caller can break the page. */
  beforeLine?: () => void;
}

/**
 * Render markdown text into the document at the current cursor.
 *
 * The important detail is the pdfkit idiom for a run of mixed styles on one
 * line: only the FIRST text call may take explicit x/y — every continued call
 * must pass options as the second argument, or pdfkit restarts positioning and
 * each run lands on its own line.
 */
export function writeRich(doc: any, raw: string, opts: RichOptions): void {
  const indent = opts.indent ?? 0;
  const left = doc.page.margins.left + indent;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right - indent;

  for (const rawLine of toAscii(raw).split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      doc.moveDown(0.3);
      continue;
    }

    opts.beforeLine?.();

    const bullet = line.match(/^[-*•]\s+(.*)$/);
    const numbered = line.match(/^(\d+[.)])\s+(.*)$/);
    const body = bullet ? bullet[1] : numbered ? numbered[2] : line;
    const marker = bullet ? "- " : numbered ? `${numbered[1]} ` : "";

    const runs = inlineRuns(body);
    // Fold the list marker into the first run so the line flows as one
    // paragraph with a hanging indent, instead of being drawn separately.
    if (marker) runs[0] = { ...runs[0], text: marker + runs[0].text, style: runs[0].style };

    runs.forEach((run, i) => {
      doc.font(FONT_FOR[run.style]).fontSize(opts.size).fillColor(opts.color);
      const textOpts = {
        continued: i < runs.length - 1,
        width,
        align: "left" as const,
        indent: marker && i === 0 ? 0 : undefined,
      };
      if (i === 0) doc.text(run.text, left, doc.y, textOpts);
      else doc.text(run.text, textOpts);
    });
  }
}
