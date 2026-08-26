/**
 * React Native port of the web's src/components/RichText.tsx.
 *
 * The question banks are authored in a small markdown subset — `**bold**`,
 * `*italic*`, `` `code` ``, bullet lists and numbered steps. The web renders
 * them; mobile used to push the raw string through a <Text>, so explanations
 * arrived with literal asterisks. That became very visible once the mock packs
 * gained "**Why the other options are wrong**" bullet blocks.
 *
 * Block and inline parsing are kept deliberately identical to the web version
 * so the same content renders the same way on both clients.
 */
import React, { Fragment, type ReactNode } from 'react';
import { StyleSheet, Text, View, type TextStyle } from 'react-native';
import { colors, fontSize, palette, radius, spacing } from '../theme';

type BlockKind = 'paragraph' | 'bullets' | 'numbers' | 'code';
type Tone = 'light' | 'dark';

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

  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/\s+$/, '');
    const last = blocks[blocks.length - 1];

    if (FENCE_RE.test(line)) {
      inFence = !inFence;
      if (inFence) blocks.push({ kind: 'code', lines: [] });
      continue;
    }
    if (inFence) {
      if (last?.kind === 'code') last.lines.push(rawLine);
      continue;
    }

    if (!line.trim()) {
      if (last && last.lines.length > 0) blocks.push({ kind: 'paragraph', lines: [] });
      continue;
    }

    const bullet = line.match(BULLET_RE);
    if (bullet) {
      if (last?.kind === 'bullets') last.lines.push(bullet[1]);
      else blocks.push({ kind: 'bullets', lines: [bullet[1]] });
      continue;
    }

    const numbered = line.match(NUMBER_RE);
    if (numbered) {
      if (last?.kind === 'numbers') last.lines.push(numbered[1]);
      else blocks.push({ kind: 'numbers', lines: [numbered[1]] });
      continue;
    }

    if (last?.kind === 'paragraph') last.lines.push(line);
    else blocks.push({ kind: 'paragraph', lines: [line] });
  }

  return blocks.filter((b) => b.lines.length > 0);
}

const TONE: Record<Tone, { code: TextStyle; strong: TextStyle; fence: TextStyle }> = {
  light: {
    code: { backgroundColor: palette.slate100, color: palette.slate800 },
    strong: { color: palette.slate900, fontWeight: '600' },
    fence: { backgroundColor: palette.slate900, color: palette.slate100 },
  },
  dark: {
    code: { backgroundColor: 'rgba(255,255,255,0.12)', color: palette.slate100 },
    strong: { color: palette.white, fontWeight: '600' },
    fence: { backgroundColor: 'rgba(0,0,0,0.4)', color: palette.slate100 },
  },
};

/**
 * Inline pass: `code` first (so markers inside code stay literal), then
 * **bold**, then *italic*. RN nests <Text> for styling rather than emitting
 * distinct elements, which is why this returns Text nodes, not spans.
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
        <Text key={key} style={[styles.code, TONE[tone].code]}>
          {` ${match[1]} `}
        </Text>
      );
    } else if (match[2] !== undefined) {
      out.push(
        <Text key={key} style={TONE[tone].strong}>
          {match[2]}
        </Text>
      );
    } else {
      out.push(
        <Text key={key} style={styles.italic}>
          {match[3]}
        </Text>
      );
    }
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

interface RichTextProps {
  children?: string | null;
  /** Render inline-only — no block wrappers. For headings and option labels. */
  inline?: boolean;
  /** Surface the text sits on; drives inline-code and bold contrast. */
  tone?: Tone;
  style?: TextStyle | TextStyle[];
}

export default function RichText({ children, inline = false, tone = 'light', style }: RichTextProps) {
  if (!children) return null;

  if (inline) {
    return <Text style={style}>{renderInline(children, 'i', tone)}</Text>;
  }

  const blocks = toBlocks(children);

  return (
    <View style={styles.stack}>
      {blocks.map((block, blockIndex) => {
        const key = `b${blockIndex}`;

        if (block.kind === 'code') {
          return (
            <View key={key} style={[styles.fence, { backgroundColor: TONE[tone].fence.backgroundColor }]}>
              <Text style={[styles.fenceText, { color: TONE[tone].fence.color }]}>
                {block.lines.join('\n')}
              </Text>
            </View>
          );
        }

        if (block.kind === 'bullets' || block.kind === 'numbers') {
          return (
            <View key={key} style={styles.list}>
              {block.lines.map((item, itemIndex) => (
                <View key={`${key}-${itemIndex}`} style={styles.listRow}>
                  <Text style={[styles.marker, style]}>
                    {block.kind === 'bullets' ? '•' : `${itemIndex + 1}.`}
                  </Text>
                  <Text style={[styles.listItem, style]}>
                    {renderInline(item, `${key}-${itemIndex}`, tone)}
                  </Text>
                </View>
              ))}
            </View>
          );
        }

        return (
          <Text key={key} style={[styles.paragraph, style]}>
            {block.lines.map((line, lineIndex) => (
              <Fragment key={`${key}-${lineIndex}`}>
                {lineIndex > 0 && '\n'}
                {renderInline(line, `${key}-${lineIndex}`, tone)}
              </Fragment>
            ))}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.sm + 2,
  },
  paragraph: {
    fontSize: fontSize.base,
    lineHeight: 20,
    color: colors.textBody,
  },
  list: {
    gap: spacing.xs + 2,
  },
  listRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.xs,
  },
  marker: {
    fontSize: fontSize.base,
    lineHeight: 20,
    color: colors.textMuted,
    minWidth: 14,
  },
  listItem: {
    flex: 1,
    fontSize: fontSize.base,
    lineHeight: 20,
    color: colors.textBody,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: fontSize.sm,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  italic: {
    fontStyle: 'italic',
  },
  fence: {
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  fenceText: {
    fontFamily: 'monospace',
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
});
