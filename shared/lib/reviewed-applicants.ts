"use client";

import { useEffect, useState } from "react";

/**
 * Per-user inbox state for applicants.
 *
 * Two signals, deliberately decoupled — they answer different
 * questions, so the numbers can diverge:
 *
 *   - **Card "+N NEW" badge** = arrivals since the user last visited
 *     this program's pipeline. Resets to 0 every time the user opens
 *     the pipeline. Driven by `lastVisitAt[programId]` below.
 *
 *   - **Pipeline row highlights** = the persistent "reviewed" set.
 *     A candidate is "unread" until the user opens their detail
 *     panel, takes any action on them (move / status / email / drag),
 *     or hits the toolbar "Mark all as reviewed" button. Lives in the
 *     `reviewed` set below.
 *
 * Persistence: localStorage. Synced across tabs via the native
 * `storage` event and within the same tab via a custom event.
 */

const STORAGE_KEY = "art-mockup:reviewed-applicants";
const VISIT_KEY = "art-mockup:program-last-visit";
const BOOTSTRAP_KEY = "art-mockup:reviewed-applicants:bootstrapped";
const CHANGE_EVENT = "reviewed-applicants-changed";
/** Anything older than this on first run is auto-marked reviewed. Keeps
 *  the demo from opening with every seeded applicant flagged. */
const BOOTSTRAP_FRESHNESS_HOURS = 48;

function readSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeSet(set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // ignore quota / sandboxed storage errors silently
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function isReviewed(id: string): boolean {
  return readSet().has(id);
}

export function markReviewed(ids: string[] | string) {
  const list = Array.isArray(ids) ? ids : [ids];
  if (list.length === 0) return;
  const set = readSet();
  let changed = false;
  for (const id of list) {
    if (!set.has(id)) {
      set.add(id);
      changed = true;
    }
  }
  if (changed) writeSet(set);
}

export function unmarkReviewed(ids: string[] | string) {
  const list = Array.isArray(ids) ? ids : [ids];
  if (list.length === 0) return;
  const set = readSet();
  let changed = false;
  for (const id of list) {
    if (set.delete(id)) changed = true;
  }
  if (changed) writeSet(set);
}

/**
 * First-run bootstrap. Should be called once with the full known
 * candidate list (id + addedAtISO). Marks anyone added more than
 * BOOTSTRAP_FRESHNESS_HOURS ago as already-reviewed so the demo opens
 * with a clean inbox; truly fresh applicants stay flagged.
 *
 * Idempotent — only runs the first time.
 */
export function bootstrapReviewedFromCandidates(
  candidates: { id: string; addedAtISO?: string }[]
) {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(BOOTSTRAP_KEY)) return;
  const cutoff =
    Date.now() - BOOTSTRAP_FRESHNESS_HOURS * 60 * 60 * 1000;
  const set = readSet();
  for (const c of candidates) {
    const t = c.addedAtISO ? Date.parse(c.addedAtISO) : NaN;
    // No timestamp OR older than cutoff → auto-reviewed.
    if (Number.isNaN(t) || t < cutoff) set.add(c.id);
  }
  writeSet(set);
  try {
    window.localStorage.setItem(BOOTSTRAP_KEY, "1");
  } catch {
    // ignore
  }
}

/** React hook that re-renders whenever the reviewed set changes (in
 *  this tab or another). Returns the live set. */
export function useReviewedSet(): Set<string> {
  const [set, setSet] = useState<Set<string>>(() => readSet());
  useEffect(() => {
    function refresh() {
      setSet(readSet());
    }
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return set;
}

/* ============================================================
 * lastVisitAt — drives the card "+N NEW" badge
 * ============================================================ */

function readVisits(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(VISIT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function writeVisits(map: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VISIT_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

/** Record that the user has opened this program's pipeline now —
 *  resets the card "+N NEW" badge to 0 for that program. */
export function markProgramVisited(programId: string) {
  const map = readVisits();
  map[programId] = new Date().toISOString();
  writeVisits(map);
}

/** Read the recorded last-visit timestamp for a program WITHOUT
 *  updating it. Used by the pipeline to capture "what was true at
 *  the moment I opened this view" so it can split unreviewed
 *  candidates into NEW (arrived since last visit) vs UNREVIEWED
 *  (older — still on the desk from a previous session). */
export function getLastVisit(programId: string): string | null {
  return readVisits()[programId] ?? null;
}

/** Live React-hook view of the visit map. */
export function useLastVisits(): Record<string, string> {
  const [map, setMap] = useState<Record<string, string>>(() => readVisits());
  useEffect(() => {
    function refresh() {
      setMap(readVisits());
    }
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return map;
}

/** Count "+N NEW" arrivals on a program since the user's last visit.
 *  No prior visit = count everyone (so a brand-new user sees the
 *  inbox). After bootstrap pre-marks the back-catalogue as reviewed,
 *  that just means the user sees the demo's seeded recent ones on
 *  first paint. */
export function countNewSinceVisit(
  candidates: { id: string; addedAtISO?: string }[],
  programId: string,
  visitMap: Record<string, string>
): number {
  const lastVisit = visitMap[programId];
  // Brand-new user (no visit recorded) — fall back to "48h ago" so the
  // card shows recent arrivals without flagging the whole back-catalog
  // as new. Once they actually visit the pipeline once, the real
  // timestamp takes over.
  const lastVisitMs = lastVisit
    ? Date.parse(lastVisit)
    : Date.now() - BOOTSTRAP_FRESHNESS_HOURS * 60 * 60 * 1000;
  let count = 0;
  for (const c of candidates) {
    if (!c.addedAtISO) continue;
    const t = Date.parse(c.addedAtISO);
    if (Number.isNaN(t)) continue;
    if (t > lastVisitMs) count++;
  }
  return count;
}

/* ============================================================
 * Demo helper — wipe everything for a fresh run
 * ============================================================ */

/** Clear all "reviewed", "last visit", and "bootstrapped" state.
 *  After this call the next /programs render re-runs bootstrap and
 *  the card "+N NEW" shows arrivals from the last 48h. */
export function resetReviewedDemoState() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(VISIT_KEY);
    window.localStorage.removeItem(BOOTSTRAP_KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}
