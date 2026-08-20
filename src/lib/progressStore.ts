/**
 * Pluggable progress persistence, mirroring the exam registry's adapter
 * pattern (shared/exams.ts). App.tsx talks only to getProgressStore() and
 * never knows which backend is active.
 *
 * Default: browser-native IndexedDB — instant, offline, zero dependency.
 * Fallback: the existing server-side file store (data/progress.json via
 * server.ts), kept working unchanged for anyone who wants a shared,
 * server-persisted backend instead.
 */
import type { UserProgress, UserAnswerSubmission } from "../types";
import {
  EMPTY_PROGRESS,
  recordAnswer as recordAnswerLogic,
  clearAllProgress as clearAllProgressLogic,
  clearMistakes as clearMistakesLogic,
} from "../../shared/progress";

export interface ProgressStorageAdapter {
  id: string;
  getProgress(): Promise<UserProgress>;
  submitAnswer(submission: UserAnswerSubmission): Promise<UserProgress>;
  clearProgress(): Promise<UserProgress>;
  clearMistakes(examFilter?: string): Promise<UserProgress>;
}

// ---------------------------------------------------------------------------
// IndexedDB store (default)
// ---------------------------------------------------------------------------

const DB_NAME = "exam-scholar-hub";
const DB_VERSION = 1;
const STORE_NAME = "progress";
const RECORD_KEY = "current";
const MIGRATION_FLAG_KEY = "exam_scholar_idb_migrated_v1";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function readRaw(): Promise<UserProgress | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(RECORD_KEY);
    req.onsuccess = () => resolve((req.result as UserProgress) ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function writeRaw(progress: UserProgress): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(progress, RECORD_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * One-time migration: if IndexedDB is empty and this browser hasn't been
 * migrated yet, pull whatever's in the server's data/progress.json once so
 * existing progress doesn't appear to vanish when the default backend
 * switches. Fails silently (offline, no server, fresh install) and just
 * starts from an empty record.
 */
async function ensureSeeded(): Promise<UserProgress> {
  const existing = await readRaw();
  if (existing) return existing;

  let seed: UserProgress = EMPTY_PROGRESS;
  try {
    if (!localStorage.getItem(MIGRATION_FLAG_KEY)) {
      const res = await fetch("/api/progress");
      if (res.ok) {
        const serverData = await res.json();
        const hasData =
          serverData &&
          (Object.keys(serverData.answeredQuestions || {}).length > 0 || (serverData.mistakes || []).length > 0);
        if (hasData) seed = serverData;
      }
    }
  } catch {
    // Offline or no server reachable — start fresh, that's fine.
  } finally {
    try {
      localStorage.setItem(MIGRATION_FLAG_KEY, "1");
    } catch {
      // Private-mode storage restrictions — non-fatal, migration just retries next load.
    }
  }

  await writeRaw(seed);
  return seed;
}

export const indexedDbStore: ProgressStorageAdapter = {
  id: "indexeddb",
  async getProgress() {
    return ensureSeeded();
  },
  async submitAnswer(submission) {
    const current = (await readRaw()) ?? EMPTY_PROGRESS;
    const updated = recordAnswerLogic(current, submission);
    await writeRaw(updated);
    return updated;
  },
  async clearProgress() {
    const updated = clearAllProgressLogic();
    await writeRaw(updated);
    return updated;
  },
  async clearMistakes(examFilter) {
    const current = (await readRaw()) ?? EMPTY_PROGRESS;
    const updated = clearMistakesLogic(current, examFilter);
    await writeRaw(updated);
    return updated;
  },
};

// ---------------------------------------------------------------------------
// Server-file store (existing behavior, kept available as an alternate)
// ---------------------------------------------------------------------------

export const serverFileStore: ProgressStorageAdapter = {
  id: "server-file",
  async getProgress() {
    const res = await fetch("/api/progress");
    if (!res.ok) throw new Error("Failed to fetch progress");
    return res.json();
  },
  async submitAnswer(submission) {
    const res = await fetch("/api/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    });
    if (!res.ok) throw new Error("Failed to submit answer");
    return res.json();
  },
  async clearProgress() {
    const res = await fetch("/api/progress/clear", { method: "POST" });
    if (!res.ok) throw new Error("Failed to clear progress");
    return res.json();
  },
  async clearMistakes(examFilter) {
    const res = await fetch("/api/mistakes/clear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(examFilter ? { exam: examFilter } : {}),
    });
    if (!res.ok) throw new Error("Failed to clear mistakes");
    return res.json();
  },
};

const ACTIVE_BACKEND: ProgressStorageAdapter =
  typeof window !== "undefined" && "indexedDB" in window ? indexedDbStore : serverFileStore;

export function getProgressStore(): ProgressStorageAdapter {
  return ACTIVE_BACKEND;
}
