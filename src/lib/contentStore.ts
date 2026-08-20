/**
 * Pluggable curriculum source, completing the adapter set alongside
 * progressStore.ts (progress) and capabilityStore.ts (authoring flags).
 *
 * Two backends, same interface:
 *   - apiStore:    the Express server's /api/content and /api/chapter routes.
 *   - staticStore: prebuilt JSON under /static-content/, emitted at build time
 *                  by scripts/build-static-content.ts.
 *
 * The static backend is what lets the app be hosted on Firebase Hosting,
 * Cloudflare Pages, GitHub Pages or any other static host with no Node
 * runtime at all. Selection is automatic and cached: probe the API once, fall
 * back to static if it is not there. Components call getContentStore() and
 * never learn which one answered.
 */
import type { Subject } from "../types";

export interface ChapterPayload {
  subject: string;
  chapter: string;
  description?: string;
  exam?: string;
  paper?: string;
  questions: unknown[];
}

export interface ContentStoreAdapter {
  id: string;
  getSubjects(): Promise<Subject[]>;
  getChapter(subjectName: string, chapterId: string): Promise<ChapterPayload>;
}

/** The server slugifies the subject into the URL; kept identical for parity. */
function subjectSlug(subjectName: string): string {
  return encodeURIComponent(subjectName.replace(/\s+/g, "-"));
}

// ---------------------------------------------------------------------------
// Backend A — the Express API
// ---------------------------------------------------------------------------

export const apiStore: ContentStoreAdapter = {
  id: "api",

  async getSubjects() {
    const res = await fetch("/api/content");
    if (!res.ok) throw new Error(`/api/content responded ${res.status}`);
    const data = await res.json();
    return (data.subjects || []) as Subject[];
  },

  async getChapter(subjectName, chapterId) {
    const res = await fetch(`/api/chapter/${subjectSlug(subjectName)}/${encodeURIComponent(chapterId)}`);
    if (!res.ok) throw new Error(`Chapter ${chapterId} responded ${res.status}`);
    return res.json();
  },
};

// ---------------------------------------------------------------------------
// Backend B — prebuilt static JSON
// ---------------------------------------------------------------------------

const STATIC_ROOT = "static-content";

export const staticStore: ContentStoreAdapter = {
  id: "static",

  async getSubjects() {
    const res = await fetch(`/${STATIC_ROOT}/index.json`);
    if (!res.ok) throw new Error(`static index responded ${res.status}`);
    const data = await res.json();
    return (data.subjects || []) as Subject[];
  },

  async getChapter(_subjectName, chapterId) {
    // Chapter ids are unique across the whole tree — the server's own lookup
    // ignores the subject segment too — so one flat folder is enough.
    const res = await fetch(`/${STATIC_ROOT}/chapters/${encodeURIComponent(chapterId)}.json`);
    if (!res.ok) throw new Error(`Chapter ${chapterId} responded ${res.status}`);
    return res.json();
  },
};

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------

/**
 * A static host typically serves index.html with a 200 for any unknown path,
 * so "did it respond" is not enough — the payload has to actually look like
 * the curriculum before we trust the API backend.
 */
function looksLikeSubjects(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { subjects?: unknown }).subjects)
  );
}

async function probe(): Promise<ContentStoreAdapter> {
  try {
    const res = await fetch("/api/content");
    if (res.ok && looksLikeSubjects(await res.clone().json())) return apiStore;
  } catch {
    /* no server here — fall through to static */
  }
  return staticStore;
}

let selected: Promise<ContentStoreAdapter> | null = null;

export function getContentStore(): Promise<ContentStoreAdapter> {
  if (!selected) selected = probe();
  return selected;
}

/** Convenience wrappers so callers need no await-of-an-await. */
export async function fetchSubjects(): Promise<Subject[]> {
  return (await getContentStore()).getSubjects();
}

export async function fetchChapter(subjectName: string, chapterId: string): Promise<ChapterPayload> {
  return (await getContentStore()).getChapter(subjectName, chapterId);
}

/** Test seam: drop the cached backend choice. */
export function resetContentStoreCache(): void {
  selected = null;
}
