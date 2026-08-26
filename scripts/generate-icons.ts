/**
 * Render the Exam Scholar app mark into every icon asset the web app needs.
 *
 * The mark is defined once, as geometry on a 512x512 canvas (see SHAPES), and
 * emitted two ways so the vector and the bitmaps cannot drift apart:
 *   - public/favicon.svg          the shapes written out as SVG elements
 *   - public/*.png, favicon.ico   the same shapes rasterised here
 *
 * Rasterising happens in-process (supersampled coverage plus a small PNG writer
 * on node:zlib) so the build needs no native image dependency.
 *
 * Run with `npm run build:icons` after editing the geometry.
 */
import fs from "fs";
import path from "path";
import zlib from "zlib";

const CANVAS = 512;
const OUT_DIR = path.join(process.cwd(), "public");

// ---------------------------------------------------------------------------
// Palette — the indigo brand used across the app shell (src/lib/examTheme.ts)
// with the amber tassel that ties the web mark to the existing mobile icon.
// ---------------------------------------------------------------------------
const INDIGO_LIGHT = "#6366F1"; // indigo-500
const INDIGO_DARK = "#4338CA"; // indigo-700
const BOARD = "#FFFFFF";
const BAND = "#C7D2FE"; // indigo-200
const TASSEL = "#FBBF24"; // amber-400

type Fill = { type: "solid"; color: string } | { type: "linear"; from: string; to: string };

type Shape =
  | { kind: "roundRect"; x: number; y: number; w: number; h: number; r: number; fill: Fill }
  | { kind: "polygon"; points: Array<[number, number]>; fill: Fill }
  | { kind: "capsule"; x1: number; y1: number; x2: number; y2: number; w: number; fill: Fill }
  | { kind: "circle"; cx: number; cy: number; r: number; fill: Fill };

const solid = (color: string): Fill => ({ type: "solid", color });

/** Sample a quadratic Bezier so curves survive the trip into polygon form. */
function quad(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  steps = 24,
): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    out.push([
      u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
      u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
    ]);
  }
  return out;
}

// The cap band: straight sides whose top edge tucks under the mortarboard, and
// a shallow curved bottom so the silhouette reads as a head, not a box.
const BAND_POINTS: Array<[number, number]> = [
  [156, 226],
  [356, 226],
  [356, 296],
  ...quad([356, 296], [256, 368], [156, 296]),
];

const SHAPES: Shape[] = [
  // Squircle backdrop.
  {
    kind: "roundRect",
    x: 0,
    y: 0,
    w: CANVAS,
    h: CANVAS,
    r: 114,
    fill: { type: "linear", from: INDIGO_LIGHT, to: INDIGO_DARK },
  },
  { kind: "polygon", points: BAND_POINTS, fill: solid(BAND) },
  // Mortarboard, drawn over the band.
  {
    kind: "polygon",
    points: [
      [256, 134],
      [432, 208],
      [256, 282],
      [80, 208],
    ],
    fill: solid(BOARD),
  },
  // Tassel: button at the crown, cord across the board and down the right side,
  // then the knot and tail.
  { kind: "circle", cx: 256, cy: 208, r: 20, fill: solid(TASSEL) },
  { kind: "capsule", x1: 256, y1: 208, x2: 398, y2: 214, w: 14, fill: solid(TASSEL) },
  { kind: "capsule", x1: 398, y1: 214, x2: 398, y2: 300, w: 14, fill: solid(TASSEL) },
  { kind: "circle", cx: 398, cy: 302, r: 17, fill: solid(TASSEL) },
  {
    kind: "polygon",
    points: [
      [382, 302],
      [414, 302],
      [408, 356],
      [388, 356],
    ],
    fill: solid(TASSEL),
  },
];

const round = (n: number) => Math.round(n * 100) / 100;

// ---------------------------------------------------------------------------
// SVG
// ---------------------------------------------------------------------------
function renderSvg(): string {
  const defs: string[] = [];
  const body: string[] = [];

  SHAPES.forEach((shape, i) => {
    const id = `g${i}`;
    if (shape.fill.type === "linear") {
      defs.push(
        `    <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">\n` +
          `      <stop offset="0" stop-color="${shape.fill.from}"/>\n` +
          `      <stop offset="1" stop-color="${shape.fill.to}"/>\n` +
          `    </linearGradient>`,
      );
    }
    const f = shape.fill.type === "solid" ? shape.fill.color : `url(#${id})`;

    switch (shape.kind) {
      case "roundRect":
        body.push(
          `  <rect x="${shape.x}" y="${shape.y}" width="${shape.w}" height="${shape.h}" rx="${shape.r}" fill="${f}"/>`,
        );
        break;
      case "polygon":
        body.push(
          `  <polygon points="${shape.points
            .map(([x, y]) => `${round(x)},${round(y)}`)
            .join(" ")}" fill="${f}"/>`,
        );
        break;
      case "capsule":
        body.push(
          `  <line x1="${shape.x1}" y1="${shape.y1}" x2="${shape.x2}" y2="${shape.y2}" ` +
            `stroke="${f}" stroke-width="${shape.w}" stroke-linecap="round"/>`,
        );
        break;
      case "circle":
        body.push(`  <circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}" fill="${f}"/>`);
        break;
    }
  });

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS} ${CANVAS}" ` +
    `width="${CANVAS}" height="${CANVAS}" role="img" aria-label="Exam Scholar">\n` +
    (defs.length ? `  <defs>\n${defs.join("\n")}\n  </defs>\n` : "") +
    body.join("\n") +
    `\n</svg>\n`
  );
}

// ---------------------------------------------------------------------------
// Rasteriser — supersampled coverage per pixel, shapes tested front to back.
// ---------------------------------------------------------------------------
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function inRoundRect(s: Extract<Shape, { kind: "roundRect" }>, x: number, y: number): boolean {
  if (x < s.x || x > s.x + s.w || y < s.y || y > s.y + s.h) return false;
  const cx = Math.min(Math.max(x, s.x + s.r), s.x + s.w - s.r);
  const cy = Math.min(Math.max(y, s.y + s.r), s.y + s.h - s.r);
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= s.r * s.r;
}

function inPolygon(points: Array<[number, number]>, x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function inCapsule(s: Extract<Shape, { kind: "capsule" }>, x: number, y: number): boolean {
  const dx = s.x2 - s.x1;
  const dy = s.y2 - s.y1;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((x - s.x1) * dx + (y - s.y1) * dy) / len2;
  t = Math.min(1, Math.max(0, t));
  const px = s.x1 + t * dx - x;
  const py = s.y1 + t * dy - y;
  const half = s.w / 2;
  return px * px + py * py <= half * half;
}

function hit(shape: Shape, x: number, y: number): boolean {
  switch (shape.kind) {
    case "roundRect":
      return inRoundRect(shape, x, y);
    case "polygon":
      return inPolygon(shape.points, x, y);
    case "capsule":
      return inCapsule(shape, x, y);
    case "circle": {
      const dx = x - shape.cx;
      const dy = y - shape.cy;
      return dx * dx + dy * dy <= shape.r * shape.r;
    }
  }
}

/** Colour of a fill at canvas-space y — gradients run top to bottom. */
function fillColorAt(fill: Fill, y: number): [number, number, number] {
  if (fill.type === "solid") return hexToRgb(fill.color);
  const t = Math.min(1, Math.max(0, y / CANVAS));
  const a = hexToRgb(fill.from);
  const b = hexToRgb(fill.to);
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

const SAMPLES = 4; // per axis, so 16 samples per pixel

/**
 * Full-bleed variant for platforms that apply their own mask (iOS home screen,
 * Android maskable icons) — they clip the corners themselves, so pre-rounding
 * here would leave a transparent fringe inside their mask. All of the artwork
 * sits within the maskable safe circle, so nothing is lost to the crop.
 */
function squareCorners(shapes: Shape[]): Shape[] {
  return shapes.map((s) => (s.kind === "roundRect" ? { ...s, r: 0 } : s));
}

function rasterize(size: number, shapes: Shape[] = SHAPES): Buffer {
  const scale = CANVAS / size;
  const rgba = Buffer.alloc(size * size * 4);
  const total = SAMPLES * SAMPLES;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let covered = 0;

      for (let sy = 0; sy < SAMPLES; sy++) {
        for (let sx = 0; sx < SAMPLES; sx++) {
          const x = (px + (sx + 0.5) / SAMPLES) * scale;
          const y = (py + (sy + 0.5) / SAMPLES) * scale;
          // Every fill is opaque, so the topmost shape covering this sample wins.
          for (let i = shapes.length - 1; i >= 0; i--) {
            if (!hit(shapes[i], x, y)) continue;
            const [cr, cg, cb] = fillColorAt(shapes[i].fill, y);
            r += cr;
            g += cg;
            b += cb;
            covered++;
            break;
          }
        }
      }

      if (covered === 0) continue; // leave the pixel fully transparent
      const o = (py * size + px) * 4;
      rgba[o] = Math.round(r / covered);
      rgba[o + 1] = Math.round(g / covered);
      rgba[o + 2] = Math.round(b / covered);
      rgba[o + 3] = Math.round((covered / total) * 255);
    }
  }

  return rgba;
}

// ---------------------------------------------------------------------------
// PNG / ICO writers
// ---------------------------------------------------------------------------
function crc32(buf: Buffer): number {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typed = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typed));
  return Buffer.concat([len, typed, crc]);
}

function encodePng(size: number, rgba: Buffer): Buffer {
  const stride = size * 4 + 1; // one filter byte (0 = none) per scanline
  const raw = Buffer.alloc(size * stride);
  for (let y = 0; y < size; y++) {
    rgba.copy(raw, y * stride + 1, y * size * 4, (y + 1) * size * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** ICO container holding PNG-compressed entries. */
function encodeIco(entries: Array<{ size: number; png: Buffer }>): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);

  const dir = Buffer.alloc(16 * entries.length);
  let offset = header.length + dir.length;
  entries.forEach((entry, i) => {
    const o = i * 16;
    dir[o] = entry.size >= 256 ? 0 : entry.size; // width  (0 means 256)
    dir[o + 1] = entry.size >= 256 ? 0 : entry.size; // height
    dir.writeUInt16LE(1, o + 4); // colour planes
    dir.writeUInt16LE(32, o + 6); // bits per pixel
    dir.writeUInt32LE(entry.png.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += entry.png.length;
  });

  return Buffer.concat([header, dir, ...entries.map((e) => e.png)]);
}

// ---------------------------------------------------------------------------
function main(): void {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const write = (name: string, data: string | Buffer) => {
    fs.writeFileSync(path.join(OUT_DIR, name), data);
    const bytes = typeof data === "string" ? Buffer.byteLength(data) : data.length;
    console.log(`  ${name.padEnd(22)} ${(bytes / 1024).toFixed(1)} KB`);
  };

  const png = (size: number) => encodePng(size, rasterize(size));
  const fullBleedPng = (size: number) => encodePng(size, rasterize(size, squareCorners(SHAPES)));

  console.log("Exam Scholar icons -> public/");
  write("favicon.svg", renderSvg());
  write("favicon.ico", encodeIco([16, 32, 48].map((size) => ({ size, png: png(size) }))));
  write("icon-192.png", png(192));
  write("icon-512.png", png(512));
  write("apple-touch-icon.png", fullBleedPng(180));
  write("icon-192-maskable.png", fullBleedPng(192));
  write("icon-512-maskable.png", fullBleedPng(512));
}

main();
