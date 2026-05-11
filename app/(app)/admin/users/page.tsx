"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Edit3,
  HelpCircle,
  Phone,
  Plus,
  Search,
  Shield,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useToast } from "@/shared/ui/toast";
import {
  FilterButton,
  FilterModal,
  countActiveFilters,
  isFieldActive,
  type FilterField,
  type FilterValues,
} from "@/shared/ui/filter";
import type {
  ModuleId,
  PermissionAction,
  RoleDataScope,
  RolePermissions,
  RoleSpecialNote,
  SystemRole,
} from "@/entities/system-role";
import {
  MODULE_GROUPS,
  PERMISSION_ACTIONS,
  PERMISSION_ACTION_LABEL,
  ROLE_OPTIONS_FOR_USERS,
} from "@/entities/system-role";
import type { SystemUser, SystemUserStatus } from "@/entities/system-user";
import { SYSTEM_USER_STATUS_LABEL } from "@/entities/system-user";

type Tab = "users" | "roles";
type Modal =
  | { kind: "user-add" }
  | { kind: "user-view"; id: string }
  | { kind: "user-edit"; id: string }
  | { kind: "role-edit"; id: string }
  | null;

const SCOPE_OPTIONS = [
  "All Company Data",
  "Business Unit",
  "Department Only",
  "Owned & Assigned Campaigns",
  "Assigned Steps Only (Interviewer Mode)",
  "Global (Public Profile Only)",
  "Global (Full History)",
  "Restricted (Assigned Campaigns Only)",
];

export default function ManageUsersPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [roles, setRoles] = useState<SystemRole[]>([]);
  const [modal, setModal] = useState<Modal>(null);

  async function refreshUsers() {
    const res = await fetch("/api/system-users");
    const data = await res.json();
    setUsers(data.users ?? []);
  }
  async function refreshRoles() {
    const res = await fetch("/api/system-roles");
    const data = await res.json();
    setRoles(data.roles ?? []);
  }
  useEffect(() => {
    void refreshUsers();
    void refreshRoles();
  }, []);

  const roleById = useMemo(
    () => new Map(roles.map((r) => [r.id, r])),
    [roles]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-8 py-5">
        <p className="text-xs text-gray-400">Administration / Users &amp; Roles</p>
        <div className="mt-1 flex items-center gap-1.5">
          <h1 className="text-xl font-bold text-gray-900">Users &amp; Roles</h1>
          <button
            className="text-gray-400 hover:text-gray-600"
            title="Manage operator accounts and the role-based permission matrix."
          >
            <HelpCircle size={14} />
          </button>
        </div>
      </header>

      <div className="px-8 py-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <nav className="flex gap-2 border-b border-gray-200 px-4">
            {(
              [
                { id: "users", label: "Users List" },
                { id: "roles", label: "Roles & Permissions" },
              ] as { id: Tab; label: string }[]
            ).map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "relative inline-flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors",
                    active
                      ? "text-violet-700"
                      : "text-gray-500 hover:text-gray-800"
                  )}
                >
                  {t.id === "roles" && <Shield size={13} />}
                  {t.label}
                  {active && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-violet-600" />
                  )}
                </button>
              );
            })}
          </nav>

          {tab === "users" ? (
            <UsersTab
              users={users}
              roleById={roleById}
              onAdd={() => setModal({ kind: "user-add" })}
              onView={(id) => setModal({ kind: "user-view", id })}
              onEdit={(id) => setModal({ kind: "user-edit", id })}
            />
          ) : (
            <RolesTab
              roles={roles}
              onEdit={(id) => setModal({ kind: "role-edit", id })}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {modal?.kind === "user-add" && (
        <AddUserModal
          roles={roles}
          onClose={() => setModal(null)}
          onSubmit={async (input) => {
            for (const draft of input.users) {
              const res = await fetch("/api/system-users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: draft.name,
                  email: draft.email,
                  roleId: input.roleId,
                  status: "pending",
                }),
              });
              if (!res.ok) {
                showToast("error", "Failed to add a user.");
                return;
              }
            }
            showToast(
              "success",
              `${input.users.length} user${input.users.length === 1 ? "" : "s"} added.`
            );
            await refreshUsers();
            setModal(null);
          }}
        />
      )}
      {modal?.kind === "user-view" &&
        (() => {
          const u = users.find((x) => x.id === modal.id);
          if (!u) return null;
          const role = roleById.get(u.roleId);
          return (
            <UserDetailPanel
              user={u}
              role={role}
              onClose={() => setModal(null)}
              onEditClick={() => setModal({ kind: "user-edit", id: u.id })}
            />
          );
        })()}
      {modal?.kind === "user-edit" &&
        (() => {
          const u = users.find((x) => x.id === modal.id);
          if (!u) return null;
          return (
            <EditUserModal
              user={u}
              roles={roles}
              onClose={() => setModal(null)}
              onSave={async (patch) => {
                const res = await fetch(`/api/system-users/${u.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(patch),
                });
                if (!res.ok) {
                  showToast("error", "Failed to update user.");
                  return;
                }
                showToast("success", `User "${patch.name ?? u.name}" updated.`);
                await refreshUsers();
                setModal(null);
              }}
            />
          );
        })()}
      {modal?.kind === "role-edit" &&
        (() => {
          const r = roles.find((x) => x.id === modal.id);
          if (!r) return null;
          return (
            <EditRoleModal
              role={r}
              onClose={() => setModal(null)}
              onSave={async (patch) => {
                const res = await fetch(`/api/system-roles/${r.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(patch),
                });
                if (!res.ok) {
                  showToast("error", "Failed to update role.");
                  return;
                }
                showToast("success", `Role "${patch.name ?? r.name}" updated.`);
                await refreshRoles();
                setModal(null);
              }}
            />
          );
        })()}
    </div>
  );
}

/* ============================================================
 * Users tab
 * ============================================================ */

function UsersTab({
  users,
  roleById,
  onAdd,
  onView,
  onEdit,
}: {
  users: SystemUser[];
  roleById: Map<string, SystemRole>;
  onAdd: () => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  const fields: FilterField[] = useMemo(
    () => [
      {
        id: "role",
        label: "Role",
        kind: "multi-select",
        options: ROLE_OPTIONS_FOR_USERS.map((r) => ({
          value: r.id,
          label: r.label,
        })),
      },
      {
        id: "status",
        label: "Status",
        kind: "multi-select",
        options: (
          ["active", "deactivated", "pending"] as SystemUserStatus[]
        ).map((s) => ({ value: s, label: SYSTEM_USER_STATUS_LABEL[s] })),
      },
    ],
    []
  );

  const filtered = users.filter((u) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !u.name.toLowerCase().includes(q) &&
        !u.email.toLowerCase().includes(q)
      )
        return false;
    }
    const r = filterValues.role;
    if (isFieldActive(r) && r?.kind === "multi-select") {
      if (!r.values.includes(u.roleId)) return false;
    }
    const s = filterValues.status;
    if (isFieldActive(s) && s?.kind === "multi-select") {
      if (!s.values.includes(u.status)) return false;
    }
    return true;
  });

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <div className="relative max-w-md flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email…"
            className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm focus:border-violet-500 focus:outline-none"
          />
        </div>
        <FilterButton
          activeCount={countActiveFilters(filterValues)}
          onClick={() => setFilterOpen(true)}
        />
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          <Plus size={14} />
          Add New Users
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="w-10 p-3">
                <input type="checkbox" className="accent-violet-600" disabled />
              </th>
              <th className="p-3">Name &amp; Contact Information</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Last Active</th>
              <th className="w-32 p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const role = roleById.get(u.roleId);
              return (
                <tr key={u.id} className="border-t border-gray-100">
                  <td className="p-3">
                    <input type="checkbox" className="accent-violet-600" />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={u.name} />
                      <div>
                        <p className="font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-700">
                    {role?.name ?? "—"}
                  </td>
                  <td className="p-3">
                    <UserStatusBadge status={u.status} />
                  </td>
                  <td className="p-3 text-xs text-gray-500">
                    {formatRelative(u.lastActiveISO)}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3 text-xs font-medium">
                      <button
                        onClick={() => onView(u.id)}
                        className="text-violet-600 hover:text-violet-800"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onEdit(u.id)}
                        className="text-violet-600 hover:text-violet-800"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-sm text-gray-400">
                  No users match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <FilterModal
        open={filterOpen}
        fields={fields}
        initialValues={filterValues}
        onApply={(v) => {
          setFilterValues(v);
          setFilterOpen(false);
        }}
        onCancel={() => setFilterOpen(false)}
      />
    </>
  );
}

function UserStatusBadge({ status }: { status: SystemUserStatus }) {
  const map: Record<SystemUserStatus, { dot: string; text: string }> = {
    active: { dot: "bg-emerald-500", text: "text-emerald-700" },
    deactivated: { dot: "bg-rose-500", text: "text-rose-700" },
    pending: { dot: "bg-amber-500", text: "text-amber-700" },
  };
  const tone = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", tone.text)}>
      <span className={cn("inline-block h-2 w-2 rounded-full", tone.dot)} />
      {SYSTEM_USER_STATUS_LABEL[status]}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[11px] font-semibold text-violet-700">
      {initials}
    </span>
  );
}

/* ============================================================
 * Roles tab
 * ============================================================ */

function RolesTab({
  roles,
  onEdit,
}: {
  roles: SystemRole[];
  onEdit: (id: string) => void;
}) {
  return (
    <>
      <p className="border-b border-gray-100 px-4 py-3 text-xs text-gray-500">
        Default roles ship with the platform. Click <strong>Edit</strong> on a
        role to fine-tune its permission matrix and per-module data scope.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="p-3">Role Name</th>
              <th className="p-3">Description</th>
              <th className="p-3">Users Assigned</th>
              <th className="p-3">Last Updated</th>
              <th className="w-24 p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.id} className="border-t border-gray-100">
                <td className="p-3 font-medium text-gray-900">{r.name}</td>
                <td className="p-3 text-xs text-gray-600">
                  {r.description || (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="p-3 text-sm text-gray-700">
                  {r.usersAssigned}
                </td>
                <td className="p-3 text-xs text-gray-500">
                  {formatExact(r.updatedAtISO)}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => onEdit(r.id)}
                    className="inline-flex items-center gap-1 rounded border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 hover:bg-violet-100"
                  >
                    <Edit3 size={11} />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ============================================================
 * Add new user modal
 * ============================================================ */

interface UserDraft {
  id: string;
  name: string;
  email: string;
}

function AddUserModal({
  roles,
  onClose,
  onSubmit,
}: {
  roles: SystemRole[];
  onClose: () => void;
  onSubmit: (input: { users: UserDraft[]; roleId: string }) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<UserDraft[]>([]);
  const [roleId, setRoleId] = useState(
    roles.find((r) => r.id === "role-reviewer")?.id ?? roles[0]?.id ?? ""
  );

  function addByText() {
    const t = search.trim();
    if (!t) return;
    const isEmail = t.includes("@");
    const draft: UserDraft = {
      id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: isEmail ? t.split("@")[0] : t,
      email: isEmail ? t : "",
    };
    setPicked((prev) => [...prev, draft]);
    setSearch("");
  }
  function remove(id: string) {
    setPicked((prev) => prev.filter((u) => u.id !== id));
  }
  function update(id: string, patch: Partial<UserDraft>) {
    setPicked((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  const ready =
    picked.length > 0 &&
    picked.every((u) => u.name.trim() && u.email.includes("@")) &&
    Boolean(roleId);

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/40 p-6 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Add New User(s)
            </h3>
            <p className="mt-0.5 text-[11px] text-gray-500">
              Type a name or email and press Enter to add to the batch.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="space-y-4 px-5 py-4">
          <FormField label="Search" required>
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2 py-1.5">
              {picked.map((u) => (
                <span
                  key={u.id}
                  className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700"
                >
                  {u.email || u.name}
                  <button
                    type="button"
                    onClick={() => remove(u.id)}
                    className="opacity-60 hover:opacity-100"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addByText();
                  }
                }}
                placeholder="Search by name or email…"
                className="min-w-[160px] flex-1 border-0 bg-transparent text-xs focus:outline-none"
              />
            </div>
          </FormField>

          {picked.length > 0 && (
            <div className="space-y-1.5 rounded-md border border-gray-200 bg-gray-50/50 p-2">
              {picked.map((u) => (
                <div
                  key={u.id}
                  className="grid grid-cols-2 items-center gap-2 rounded border border-gray-200 bg-white px-2 py-1.5"
                >
                  <input
                    value={u.name}
                    onChange={(e) => update(u.id, { name: e.target.value })}
                    placeholder="Full name"
                    className="rounded border border-gray-200 px-2 py-1 text-xs focus:border-violet-500 focus:outline-none"
                  />
                  <input
                    type="email"
                    value={u.email}
                    onChange={(e) => update(u.id, { email: e.target.value })}
                    placeholder="email@example.com"
                    className="rounded border border-gray-200 px-2 py-1 text-xs focus:border-violet-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          )}

          <FormField label="Assign Role" required>
            <Select
              value={roleId}
              onChange={setRoleId}
              options={roles.map((r) => ({ value: r.id, label: r.name }))}
            />
          </FormField>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => ready && onSubmit({ users: picked, roleId })}
            disabled={!ready}
            className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add {picked.length || ""} User{picked.length === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * View / Edit user side panel
 * ============================================================ */

function UserDetailPanel({
  user,
  role,
  onClose,
  onEditClick,
}: {
  user: SystemUser;
  role?: SystemRole;
  onClose: () => void;
  onEditClick: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-end bg-black/30 backdrop-blur-sm">
      <div
        className="flex h-full w-full max-w-lg flex-col overflow-hidden bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {user.name}
              </h3>
              <p className="text-xs text-gray-500">{user.email}</p>
              {user.phone && (
                <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-gray-500">
                  <Phone size={10} /> {user.phone}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <section>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Assigned Role
            </p>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800">
              {role?.name ?? "—"}
              {role?.description && (
                <p className="mt-1 text-xs font-normal text-gray-500">
                  {role.description}
                </p>
              )}
            </div>
          </section>

          <section>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Module Access
            </p>
            {role ? (
              <ModuleAccessSummary role={role} />
            ) : (
              <p className="text-sm text-gray-400">
                Role data is not loaded yet.
              </p>
            )}
          </section>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={onEditClick}
            className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
          >
            <Edit3 size={13} /> Edit
          </button>
        </div>
      </div>
    </div>
  );
}

function ModuleAccessSummary({ role }: { role: SystemRole }) {
  return (
    <div className="space-y-2">
      {MODULE_GROUPS.map((g) => {
        const rows = g.modules
          .map((m) => {
            const actions = role.permissions[m.id];
            const note = role.notes[m.id];
            if (!actions && !note) return null;
            return { module: m, actions: actions ?? [], note };
          })
          .filter(Boolean) as {
          module: (typeof g.modules)[number];
          actions: PermissionAction[];
          note?: string;
        }[];
        if (rows.length === 0) return null;
        return (
          <div
            key={g.id}
            className="rounded-md border border-gray-200 bg-white p-3"
          >
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              {g.label}
            </p>
            <ul className="space-y-1">
              {rows.map((r) => (
                <li
                  key={r.module.id}
                  className="flex items-start justify-between gap-3 text-xs"
                >
                  <span className="font-medium text-gray-800">
                    {r.module.label}
                  </span>
                  <span className="flex flex-wrap items-center gap-1 text-right">
                    {r.note ? (
                      <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                        {r.note}
                      </span>
                    ) : null}
                    {r.actions.map((a) => (
                      <ActionChip key={a} action={a} />
                    ))}
                    {r.actions.length === 0 && !r.note && (
                      <span className="text-gray-300">—</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function ActionChip({ action }: { action: PermissionAction }) {
  const tone: Record<PermissionAction, string> = {
    list: "bg-sky-100 text-sky-700",
    view: "bg-emerald-100 text-emerald-700",
    add: "bg-indigo-100 text-indigo-700",
    update: "bg-amber-100 text-amber-700",
    delete: "bg-rose-100 text-rose-700",
  };
  return (
    <span
      className={cn(
        "inline-flex h-4 w-4 items-center justify-center rounded text-[10px] font-bold",
        tone[action]
      )}
      title={PERMISSION_ACTION_LABEL[action]}
    >
      {action[0].toUpperCase()}
    </span>
  );
}

function EditUserModal({
  user,
  roles,
  onClose,
  onSave,
}: {
  user: SystemUser;
  roles: SystemRole[];
  onClose: () => void;
  onSave: (patch: Partial<SystemUser>) => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [roleId, setRoleId] = useState(user.roleId);
  const [status, setStatus] = useState<SystemUserStatus>(user.status);

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/40 p-6 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h3 className="text-base font-semibold text-gray-900">Edit User</h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="space-y-4 px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Full name" required>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
              />
            </FormField>
            <FormField label="Email" required>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </FormField>
            <FormField label="Phone">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input"
              />
            </FormField>
            <FormField label="Status">
              <Select
                value={status}
                onChange={(v) => setStatus(v as SystemUserStatus)}
                options={(
                  ["active", "pending", "deactivated"] as SystemUserStatus[]
                ).map((s) => ({ value: s, label: SYSTEM_USER_STATUS_LABEL[s] }))}
              />
            </FormField>
          </div>
          <FormField label="Role" required>
            <Select
              value={roleId}
              onChange={setRoleId}
              options={roles.map((r) => ({ value: r.id, label: r.name }))}
            />
          </FormField>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim() || undefined,
                roleId,
                status,
              })
            }
            disabled={!name.trim() || !email.trim() || !roleId}
            className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(209 213 219);
          background: white;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: rgb(17 24 39);
        }
        :global(.input:focus) {
          border-color: rgb(139 92 246);
          outline: none;
        }
      `}</style>
    </div>
  );
}

/* ============================================================
 * Edit role modal — full permission matrix
 * ============================================================ */

function EditRoleModal({
  role,
  onClose,
  onSave,
}: {
  role: SystemRole;
  onClose: () => void;
  onSave: (patch: Partial<SystemRole>) => void;
}) {
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description);
  const [permissions, setPermissions] = useState<RolePermissions>(() =>
    deepClonePermissions(role.permissions)
  );
  const [dataScope, setDataScope] = useState<RoleDataScope>(() => ({
    ...role.dataScope,
  }));
  const [notes] = useState<RoleSpecialNote>(() => ({ ...role.notes }));

  function toggle(moduleId: ModuleId, action: PermissionAction) {
    setPermissions((prev) => {
      const list = prev[moduleId] ?? [];
      const has = list.includes(action);
      const next = has
        ? list.filter((a) => a !== action)
        : [...list, action];
      return { ...prev, [moduleId]: next };
    });
  }
  function setScope(moduleId: ModuleId, scope: string) {
    setDataScope((prev) => ({ ...prev, [moduleId]: scope }));
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/40 p-6 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Edit Role: {role.name}
            </h3>
            <p className="mt-0.5 text-[11px] text-gray-500">
              Define permissions and data access scope.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-5 px-5 py-4">
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Role Name" required>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={role.isSystem}
                className="input"
              />
            </FormField>
            <div className="col-span-2">
              <FormField label="Description">
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input"
                />
              </FormField>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="p-3">Module</th>
                  {PERMISSION_ACTIONS.map((a) => (
                    <th key={a} className="w-[60px] p-3 text-center">
                      {PERMISSION_ACTION_LABEL[a]}
                    </th>
                  ))}
                  <th className="p-3">Data Scope</th>
                </tr>
              </thead>
              <tbody>
                {MODULE_GROUPS.map((g) => (
                  <FragmentGroup
                    key={g.id}
                    group={g}
                    permissions={permissions}
                    dataScope={dataScope}
                    notes={notes}
                    onToggle={toggle}
                    onScope={setScope}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({
                name: name.trim(),
                description,
                permissions,
                dataScope,
              })
            }
            disabled={!name.trim()}
            className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(209 213 219);
          background: white;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: rgb(17 24 39);
        }
        :global(.input:focus) {
          border-color: rgb(139 92 246);
          outline: none;
        }
      `}</style>
    </div>
  );
}

function FragmentGroup({
  group,
  permissions,
  dataScope,
  notes,
  onToggle,
  onScope,
}: {
  group: (typeof MODULE_GROUPS)[number];
  permissions: RolePermissions;
  dataScope: RoleDataScope;
  notes: RoleSpecialNote;
  onToggle: (m: ModuleId, a: PermissionAction) => void;
  onScope: (m: ModuleId, scope: string) => void;
}) {
  return (
    <>
      <tr className="bg-gray-50/60">
        <td
          colSpan={2 + PERMISSION_ACTIONS.length + 1}
          className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-700"
        >
          {group.label}
        </td>
      </tr>
      {group.modules.map((m) => {
        const actions = permissions[m.id] ?? [];
        const note = notes[m.id];
        return (
          <tr key={m.id} className="border-t border-gray-100">
            <td className="p-3 text-sm text-gray-800">
              <span className="ml-3">{m.label}</span>
              {note && (
                <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                  {note}
                </span>
              )}
            </td>
            {PERMISSION_ACTIONS.map((a) => {
              const on = actions.includes(a);
              return (
                <td key={a} className="p-3 text-center">
                  <button
                    type="button"
                    onClick={() => onToggle(m.id, a)}
                    className={cn(
                      "inline-flex h-5 w-5 items-center justify-center rounded border transition-colors",
                      on
                        ? "border-violet-600 bg-violet-600 text-white"
                        : "border-gray-300 bg-white text-transparent hover:border-violet-300"
                    )}
                    aria-label={`${PERMISSION_ACTION_LABEL[a]} ${m.label}`}
                  >
                    <Check size={11} />
                  </button>
                </td>
              );
            })}
            <td className="p-3">
              {m.scopeable ? (
                <Select
                  value={dataScope[m.id] ?? ""}
                  onChange={(v) => onScope(m.id, v)}
                  options={[
                    { value: "", label: "—" },
                    ...SCOPE_OPTIONS.map((s) => ({ value: s, label: s })),
                  ]}
                />
              ) : (
                <span className="text-[11px] text-gray-300">—</span>
              )}
            </td>
          </tr>
        );
      })}
    </>
  );
}

/* ============================================================
 * Bits
 * ============================================================ */

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:border-violet-500 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
      />
    </div>
  );
}

function deepClonePermissions(p: RolePermissions): RolePermissions {
  const out: RolePermissions = {};
  for (const key of Object.keys(p) as ModuleId[]) {
    out[key] = [...(p[key] ?? [])];
  }
  return out;
}

function formatRelative(iso?: string): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  const diff = Date.now() - t;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return "Just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  if (diff < 30 * day) return `${Math.floor(diff / (7 * day))}w ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatExact(iso?: string): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${m} ${ampm}, ${day}/${month}/${year}`;
}
