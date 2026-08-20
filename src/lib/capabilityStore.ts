/**
 * Client-side reader for the server's authoring capabilities, mirroring the
 * adapter shape of progressStore.ts — components ask this module and never
 * fetch /api/capabilities themselves.
 *
 * The important behaviour is the failure path: if the endpoint 404s, the
 * network call fails, or there is no server at all (a fully static deploy of
 * dist/), this resolves to NO_CAPABILITIES instead of throwing. That is what
 * lets the same bundle work both behind the Express server and as static
 * files, with no build-time switch.
 */
import { NO_CAPABILITIES, type AppCapabilities } from "../../shared/capabilities";

let inflight: Promise<AppCapabilities> | null = null;

function isCapabilities(value: unknown): value is AppCapabilities {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as AppCapabilities).contentUpload === "boolean" &&
    typeof (value as AppCapabilities).aiExpand === "boolean"
  );
}

async function fetchCapabilities(): Promise<AppCapabilities> {
  try {
    const res = await fetch("/api/capabilities");
    if (!res.ok) return NO_CAPABILITIES;

    // A static host answering an unknown /api/* path typically serves
    // index.html with a 200, so a shape check is required, not just res.ok.
    const data: unknown = await res.json();
    return isCapabilities(data) ? data : NO_CAPABILITIES;
  } catch {
    return NO_CAPABILITIES;
  }
}

/**
 * Resolved once per page load and cached — capabilities are fixed for the
 * lifetime of the server process, so re-asking gains nothing.
 */
export function getCapabilities(): Promise<AppCapabilities> {
  if (!inflight) inflight = fetchCapabilities();
  return inflight;
}

/** Test seam: drop the cache so the next call re-fetches. */
export function resetCapabilitiesCache(): void {
  inflight = null;
}
