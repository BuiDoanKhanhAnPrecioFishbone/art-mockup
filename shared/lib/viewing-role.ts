"use client";

import { useEffect, useState } from "react";
import {
  MODULE_GROUPS,
  type ModuleId,
  type PermissionAction,
  type SystemRole,
} from "@/entities/system-role";

/**
 * Mock-only "view-as" feature. Lets the demo flip between roles
 * (Admin / Manager / Recruiter / Standard User / Reviewer / Candidate)
 * so the same surfaces can be inspected with each role's view +
 * permissions.
 *
 * The currently-selected role id lives in localStorage so it survives
 * reloads. Components subscribe via `useViewingRoleId()` (just the id)
 * or `useViewingRole(roles)` (id + resolved role + helpers).
 */

const STORAGE_KEY = "art-mockup:viewing-role-id";
const CHANGE_EVENT = "viewing-role-changed";
const DEFAULT_ROLE_ID = "role-admin";

function readId(): string {
  if (typeof window === "undefined") return DEFAULT_ROLE_ID;
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? DEFAULT_ROLE_ID;
  } catch {
    return DEFAULT_ROLE_ID;
  }
}

function writeId(id: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // ignore quota / sandboxed storage errors
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

/** Live id of the currently-viewing role. Re-renders whenever the
 *  role is switched in this tab or another. */
export function useViewingRoleId(): [string, (next: string) => void] {
  const [id, setId] = useState<string>(() => readId());
  useEffect(() => {
    function refresh() {
      setId(readId());
    }
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return [
    id,
    (next: string) => {
      writeId(next);
      setId(next);
    },
  ];
}

/** Resolve the current viewing role against a known role list. The
 *  caller is responsible for fetching `roles` (typically once at the
 *  app shell level via /api/system-roles). Returns helpers that gate
 *  modules + actions. */
export function useViewingRole(roles: SystemRole[]) {
  const [id, setId] = useViewingRoleId();
  const role = roles.find((r) => r.id === id) ?? roles[0] ?? null;

  /** True if `action` is allowed on `moduleId` for the current role. */
  function can(moduleId: ModuleId, action: PermissionAction): boolean {
    if (!role) return false;
    return (role.permissions[moduleId] ?? []).includes(action);
  }

  /** True if the role can see the module at all (any action). */
  function canSeeModule(moduleId: ModuleId): boolean {
    if (!role) return false;
    const list = role.permissions[moduleId];
    if (!list) return false;
    return list.length > 0;
  }

  /** Special-case note shown next to a module on the role's permission
   *  matrix (e.g. "Assigned only", "Open / Published"). Falsy when no
   *  note is set. */
  function noteFor(moduleId: ModuleId): string | undefined {
    return role?.notes[moduleId];
  }

  return {
    roleId: id,
    role,
    setRoleId: setId,
    allRoles: roles,
    can,
    canSeeModule,
    noteFor,
  };
}

/** Stable list of every module in the platform, with its enclosing
 *  group label — useful for permission-matrix UIs. */
export function flatModules(): {
  id: ModuleId;
  label: string;
  group: string;
}[] {
  const out: { id: ModuleId; label: string; group: string }[] = [];
  for (const g of MODULE_GROUPS) {
    for (const m of g.modules) {
      out.push({ id: m.id, label: m.label, group: g.label });
    }
  }
  return out;
}
