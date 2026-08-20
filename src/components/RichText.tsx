/**
 * Renders the small markdown subset the question banks are authored in.
 *
 * Content packs are written by hand (and by the AI Teacher expansion route),
 * so explanations routinely contain `**bold**`, `*italic*`, `` `code` ``,
 * bullet lists and numbered steps. Nothing in the app used to parse those, so
 * they reached the screen as literal asterisks and backticks.
 *
 * Deliberately not a full markdown engine and deliberately not
 * dangerouslySetInnerHTML: it walks the text and emits React elements, so
 * content packs — which anyone can upload — can never inject markup.
 */
import { Fragment, type ReactNode } from "react";

type BlockKind = "paragraph" | "bullets" | "numbers" | "code";

interface Block {
  kind: BlockKind;
  lines: string[];
}

const BULLET_RE = /^\s*[-*•]\s+(.*)$/;
const NUMBER_RE = /^\s*\d+[.)]\s+(.*)$/;
const FENCE_RE = /^\s*```/;

/** Split raw text into paragraph / list / code blocks. */
function toBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  let inFence = false;

  for (const rawLine of text.split("\n")) {
    const line = rawLine.replace(/\s+$/, "");
    const last = blocks[blocks.length - 1];

    if (FENCE_RE.test(line)) {
      inFence = !inFence;
      if (inFence) blocks.push({ kind: "code", lines: [] });
      continue;
    }
    if (inFence) {
      if (last?.kind === "code") last.lines.push(rawLine);
      continue;
    }

    if (!line.trim()) {
      // Blank line closes the current block so the next one starts fresh.
      if (last && last.lines.length > 0) blocks.push({ kind: "paragraph", lines: [] });
      continue;
    }

    const bullet = line.match(BULLET_RE);
    if (bullet) {
      if (last?.kind === "bullets") last.lines.push(bullet[1]);
      else blocks.push({ kind: "bullets", lines: [bullet[1]] });
      continue;
    }

    const numbered = line.match(NUMBER_RE);
    if (numbered) {
      if (last?.kind === "numbers") last.lines.push(numbered[1]);
      else blocks.push({ kind: "numbers", lines: [numbered[1]] });
      continue;
    }

    if (last?.kind === "paragraph") last.lines.push(line);
    else blocks.push({ kind: "paragraph", lines: [line] });
  }

  return blocks.filter((b) => b.lines.length > 0);
}

/**
 * Inline code and code fences need a background, so they can't simply inherit
 * their surroundings — the dark phone simulator in MobileAppHub needs the
 * opposite treatment from the light study screens.
 */
type Tone = "light" | "dark";

const TONE_CLASSES: Record<Tone, { code: string; strong: string; fence: string }> = {
  light: {
    code: "bg-slate-100 text-slate-800 border-slate-200",
    strong: "text-slate-900",
    fence: "bg-slate-900 text-slate-100",
  },
  dark: {
    code: "bg-white/10 text-slate-100 border-white/15",
    strong: "text-white",
    fence: "bg-black/40 text-slate-100",
  },
};

/**
 * Inline pass: `code` first (so markers inside code stay literal), then
 * **bold**, then *italic*.
 */
function renderInline(text: string, keyPrefix: string, tone: Tone): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /`([^`]+)`|\*\*([^*]+)\*\*|(?<!\*)\*(?!\s)([^*\n]+?)\*(?!\*)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) out.push(text.slice(cursor, match.index));
    const key = `${keyPrefix}-${index++}`;

    if (match[1] !== undefined) {
      out.push(
        <code
          key={key}
          className={`font-mono text-[0.92em] border rounded px-1 py-px ${TONE_CLASSES[tone].code}`}
        >
          {match[1]}
        </code>,
      );
    } else if (match[2] !== undefined) {
      out.push(
        <strong key={key} className={`font-semibold ${TONE_CLASSES[tone].strong}`}>
          {match[2]}
        </strong>,
      );
    } else {
      out.push(
        <em key={key} className="italic">
          {match[3]}
        </em>,
      );
    }
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

interface RichTextProps {
  children?: string | null;
  /** Extra classes for the wrapper (spacing between blocks is handled here). */
  className?: string;
  /** Render inline-only — no block wrappers. For headings and option labels. */
  inline?: boolean;
  /** Surface the text sits on; drives inline-code and bold contrast. */
  tone?: Tone;
}

export default function RichText({ children, className = "", inline = false, tone = "light" }: RichTextProps) {
  if (!children) return null;

  if (inline) {
    return <span className={className}>{renderInline(children, "i", tone)}</span>;
  }

  const blocks = toBlocks(children);

  return (
    <div className={`space-y-2.5 ${className}`.trim()}>
      {blocks.map((block, blockIndex) => {
        const key = `b${blockIndex}`;

        if (block.kind === "code") {
          return (
            <pre
              key={key}
              className={`font-mono text-[0.85em] rounded-lg p-3 overflow-x-auto ${TONE_CLASSES[tone].fence}`}
            >
              {block.lines.join("\n")}
            </pre>
          );
        }

        if (block.kind === "bullets" || block.kind === "numbers") {
          const ListTag = block.kind === "bullets" ? "ul" : "ol";
          return (
            <ListTag
              key={key}
              className={`space-y-1.5 pl-5 ${block.kind === "bullets" ? "list-disc" : "list-decimal"} marker:text-slate-400`}
            >
              {block.lines.map((item, itemIndex) => (
                <li key={`${key}-${itemIndex}`} className="pl-0.5">
                  {renderInline(item, `${key}-${itemIndex}`, tone)}
                </li>
              ))}
            </ListTag>
          );
        }

        return (
          <p key={key}>
            {block.lines.map((line, lineIndex) => (
              <Fragment key={`${key}-${lineIndex}`}>
                {lineIndex > 0 && <br />}
                {renderInline(line, `${key}-${lineIndex}`, tone)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
