import type { SystemUser } from "../model/types";

const NOW = Date.now();
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const SEED: SystemUser[] = [
  {
    id: "u-alice",
    name: "Alice Johnson",
    email: "alice@company.com",
    phone: "+1 415 555 0101",
    roleId: "role-reviewer",
    status: "active",
    lastActiveISO: new Date(NOW - 2 * 60 * 1000).toISOString(),
  },
  {
    id: "u-bob",
    name: "Bob Smith",
    email: "bob@company.com",
    roleId: "role-candidate",
    status: "active",
    lastActiveISO: new Date(NOW - 2 * HOUR).toISOString(),
  },
  {
    id: "u-charlie",
    name: "Charlie Davis",
    email: "charlie@agency.com",
    roleId: "role-candidate",
    status: "active",
    lastActiveISO: new Date(NOW - 30 * DAY).toISOString(),
  },
  {
    id: "u-diana",
    name: "Diana Prince",
    email: "diana@company.com",
    phone: "+1 415 555 0148",
    roleId: "role-manager",
    status: "active",
    lastActiveISO: new Date(NOW - 14 * DAY).toISOString(),
  },
  {
    id: "u-evan",
    name: "Evan Wright",
    email: "evan@partner.com",
    roleId: "role-candidate",
    status: "deactivated",
    lastActiveISO: "2024-12-12T00:00:00Z",
  },
  {
    id: "u-grace",
    name: "Grace Le",
    email: "grace.le@company.com",
    phone: "+84 90 555 0181",
    roleId: "role-recruiter",
    status: "active",
    lastActiveISO: new Date(NOW - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "u-priya",
    name: "Priya Patel",
    email: "priya.patel@company.com",
    roleId: "role-recruiter",
    status: "active",
    lastActiveISO: new Date(NOW - 6 * HOUR).toISOString(),
  },
  {
    id: "u-tomas",
    name: "Tomas Berg",
    email: "tomas@company.com",
    roleId: "role-standard-user",
    status: "pending",
    lastActiveISO: undefined,
  },
  {
    id: "u-admin",
    name: "Admin",
    email: "admin@art.com",
    roleId: "role-admin",
    status: "active",
    lastActiveISO: new Date(NOW - 30 * 1000).toISOString(),
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __artMockSystemUsersStore: SystemUser[] | undefined;
}

function store(): SystemUser[] {
  if (!globalThis.__artMockSystemUsersStore) {
    globalThis.__artMockSystemUsersStore = [...SEED];
  }
  return globalThis.__artMockSystemUsersStore;
}

export function listSystemUsers(): SystemUser[] {
  return [...store()];
}
export function getSystemUser(id: string): SystemUser | undefined {
  return store().find((u) => u.id === id);
}
export function createSystemUser(
  input: Omit<SystemUser, "id"> & { id?: string }
): SystemUser {
  const id =
    input.id ?? `u-custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const fresh: SystemUser = { ...input, id };
  store().unshift(fresh);
  return fresh;
}
export function updateSystemUser(
  id: string,
  patch: Partial<SystemUser>
): SystemUser | undefined {
  const all = store();
  const idx = all.findIndex((u) => u.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...patch };
  return all[idx];
}
export function deleteSystemUser(id: string): boolean {
  const all = store();
  const idx = all.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  all.splice(idx, 1);
  return true;
}
export function resetSystemUsersStore(): SystemUser[] {
  globalThis.__artMockSystemUsersStore = [...SEED];
  return globalThis.__artMockSystemUsersStore;
}
