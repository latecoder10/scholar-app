/**
 * Bake the curriculum into static JSON so the app can be hosted with no Node
 * runtime at all — Firebase Hosting, Cloudflare Pages, GitHub Pages, S3.
 *
 * Emits, into dist/static-content/:
 *   index.json              the exact payload GET /api/content returns
 *   chapters/<id>.json      one file per chapter, matching GET /api/chapter/*
 *
 * The shapes are produced by server/contentDiscovery.ts — the same module the
 * Express server uses — so the static site and the dev server cannot disagree.
 * src/lib/contentStore.ts reads these paths when no API is present.
 */
import fs from "fs";
import path from "path";
import { discoverSubjects, collectChapterFiles } from "../server/contentDiscovery";

const CONTENT_DIR = path.join(process.cwd(), "content");
const OUT_DIR = path.join(process.cwd(), "dist", "static-content");
const CHAPTERS_DIR = path.join(OUT_DIR, "chapters");

function main(): void {
  if (!fs.existsSync(path.join(process.cwd(), "dist"))) {
    console.error("dist/ not found — run `vite build` before this script.");
    process.exit(1);
  }

  fs.mkdirSync(CHAPTERS_DIR, { recursive: true });

  // 1. The subject/chapter index, identical to /api/content.
  const subjects = discoverSubjects(CONTENT_DIR);
  fs.writeFileSync(path.join(OUT_DIR, "index.json"), JSON.stringify({ subjects }), "utf8");

  // 2. One file per chapter, copied verbatim so the payload matches the API.
  const chapterFiles = collectChapterFiles(CONTENT_DIR);
  let bytes = 0;
  for (const [chapterId, sourcePath] of chapterFiles) {
    const raw = fs.readFileSync(sourcePath, "utf8");
    // Reserialise to strip formatting whitespace; content is unchanged.
    const compact = JSON.stringify(JSON.parse(raw));
    const target = path.join(CHAPTERS_DIR, `${chapterId}.json`);
    fs.writeFileSync(target, compact, "utf8");
    bytes += Buffer.byteLength(compact);
  }

  const totalQuestions = subjects.reduce((sum, s) => sum + s.totalQuestions, 0);
  console.log(
    `Static content: ${subjects.length} subjects, ${chapterFiles.size} chapters, ` +
      `${totalQuestions} questions (${(bytes / 1024 / 1024).toFixed(2)} MB) -> dist/static-content/`,
  );
}

main();
