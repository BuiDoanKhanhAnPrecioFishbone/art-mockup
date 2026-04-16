"use client";

import { useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  Shield,
  HelpCircle,
  X,
  ChevronRight,
  Pencil,
  Plus,
} from "lucide-react";
import {
  systemUsers,
  roles,
  DATA_SCOPE_OPTIONS,
} from "@/shared/fixtures/users";
import type {
  SystemUser,
  Role,
  ModulePermission,
  PermAction,
  UserStatus,
} from "@/shared/fixtures/users";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "users" | "roles";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRoleName(roleId: string): string {
  return roles.find((r) => r.id === roleId)?.name ?? roleId;
}

function getRoleById(roleId: string): Role | undefined {
  return roles.find((r) => r.id === roleId);
}

function StatusBadge({ status }: { status: UserStatus }) {
  const map: Record<UserStatus, { dot: string; label: string; text: string }> = {
    active: { dot: "bg-green-500", label: "Active", text: "text-green-700" },
    pending: { dot: "bg-yellow-400", label: "Pending", text: "text-yellow-700" },
    deactivated: { dot: "bg-red-500", label: "Deactivated", text: "text-red-700" },
  };
  const { dot, label, text } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${text}`}>
      <span className={`inline-block h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-xl bg-green-600 px-5 py-3 text-white shadow-2xl">
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onDone} className="text-white/70 hover:text-white">
        <X size={16} />
      </button>
    </div>
  );
}

// ─── Slide-in Panel wrapper ───────────────────────────────────────────────────

function SlidePanel({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />
      {/* Panel */}
      <div
        className="relative flex h-full flex-col bg-white shadow-2xl overflow-y-auto"
        style={{ width: "min(680px, 90vw)" }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Module Access display (for view panel) ───────────────────────────────────

function ModuleAccessView({ permissions }: { permissions: ModulePermission[] }) {
  // Group sub-modules by parent
  const groups = new Map<string, ModulePermission[]>();
  for (const p of permissions) {
    if (!p.parent) continue;
    const list = groups.get(p.parent) ?? [];
    list.push(p);
    groups.set(p.parent, list);
  }

  const ACTION_LABELS: PermAction[] = ["view", "create", "edit", "delete"];

  return (
    <div className="space-y-3">
      {Array.from(groups.entries()).map(([parent, mods]) => {
        // Only modules with at least one true action
        const activeMods = mods.filter((m) =>
          ACTION_LABELS.some((a) => m.actions[a])
        );
        if (activeMods.length === 0) return null;
        return (
          <div key={parent} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              {parent}
            </p>
            <div className="space-y-1">
              {activeMods.map((m) => {
                const actions = ACTION_LABELS.filter((a) => m.actions[a]);
                return (
                  <p key={m.module} className="text-sm text-gray-700">
                    <span className="font-medium">{m.module}:</span>{" "}
                    {actions.join(", ")}
                  </p>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── User View / Edit Panel ───────────────────────────────────────────────────

function UserPanel({
  user,
  mode: initialMode,
  onClose,
  onToast,
}: {
  user: SystemUser;
  mode: "view" | "edit";
  onClose: () => void;
  onToast: (msg: string) => void;
}) {
  const [mode, setMode] = useState(initialMode);
  const [editRoleId, setEditRoleId] = useState(user.roleId);
  const [editName, setEditName] = useState(user.name);
  const role = getRoleById(user.roleId);

  function handleSave() {
    onToast("User updated successfully");
    onClose();
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full text-white font-semibold text-sm ${user.avatarColor}`}
          >
            {user.avatarInitials}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {mode === "view" ? (
          <>
            {/* Assigned Role */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Assigned Role
              </p>
              <span className="inline-block rounded-md border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700">
                {getRoleName(user.roleId)}
              </span>
            </div>

            {/* Module Access */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Module Access
              </p>
              {role ? (
                <ModuleAccessView permissions={role.permissions} />
              ) : (
                <p className="text-sm text-gray-400">No role assigned.</p>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Edit Form */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                value={user.email}
                readOnly
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={editRoleId}
                onChange={(e) => setEditRoleId(e.target.value)}
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-6 flex justify-between">
        {mode === "view" ? (
          <>
            <div />
            <button
              onClick={() => setMode("edit")}
              className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
            >
              Edit
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
            >
              Save
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Add New Users Modal ──────────────────────────────────────────────────────

function AddUsersModal({
  onClose,
  onToast,
}: {
  onClose: () => void;
  onToast: (msg: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<SystemUser[]>([]);
  const [roleId, setRoleId] = useState("");

  const suggestions = search.trim()
    ? systemUsers.filter(
        (u) =>
          !selectedUsers.find((s) => s.id === u.id) &&
          (u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()))
      )
    : [];

  function addUser(u: SystemUser) {
    setSelectedUsers((prev) => [...prev, u]);
    setSearch("");
  }

  function removeUser(id: string) {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== id));
  }

  function handleConfirm() {
    onToast("Users added successfully");
    onClose();
  }

  const canConfirm = selectedUsers.length > 0 && roleId !== "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-lg mx-4 rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Add New User(s)</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Search */}
          <div className="relative">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Search <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 rounded-lg border border-gray-200 bg-white shadow-lg z-10">
                {suggestions.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => addUser(u)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white text-xs font-semibold ${u.avatarColor}`}
                    >
                      {u.avatarInitials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected chips */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((u) => (
                <span
                  key={u.id}
                  className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 pl-1 pr-2 py-0.5 text-sm"
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-white text-[10px] font-semibold ${u.avatarColor}`}
                  >
                    {u.avatarInitials}
                  </span>
                  {u.name}
                  <button
                    onClick={() => removeUser(u.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Role */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Assign Role <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
            >
              <option value="">Select a role...</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!canConfirm}
            onClick={handleConfirm}
            className={`rounded-lg px-5 py-2 text-sm font-medium text-white transition-colors ${
              canConfirm
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-purple-300 cursor-not-allowed"
            }`}
          >
            Add {selectedUsers.length > 0 ? `${selectedUsers.length} ` : ""}
            User{selectedUsers.length !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Users List Tab ───────────────────────────────────────────────────────────

function UsersListTab({ onToast }: { onToast: (msg: string) => void }) {
  const [search, setSearch] = useState("");
  const [panelUser, setPanelUser] = useState<SystemUser | null>(null);
  const [panelMode, setPanelMode] = useState<"view" | "edit">("view");
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = systemUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  function openPanel(user: SystemUser, mode: "view" | "edit") {
    setPanelUser(user);
    setPanelMode(mode);
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3 p-4">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Search by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <SlidersHorizontal size={15} />
          Filter
        </button>
        <div className="flex-1" />
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
        >
          <Plus size={16} />
          Add New Users
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <th className="py-3 pl-4 pr-2 w-10">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="py-3 px-4">Name & Contact Information</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Last Active</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 pl-4 pr-2">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white text-xs font-semibold ${user.avatarColor}`}
                    >
                      {user.avatarInitials}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-700">{getRoleName(user.roleId)}</td>
                <td className="py-4 px-4">
                  <StatusBadge status={user.status} />
                </td>
                <td className="py-4 px-4 text-gray-600">{user.lastActive}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openPanel(user, "view")}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openPanel(user, "edit")}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No users found.</div>
        )}
      </div>

      {/* User Slide Panel */}
      <SlidePanel open={!!panelUser} onClose={() => setPanelUser(null)}>
        {panelUser && (
          <UserPanel
            user={panelUser}
            mode={panelMode}
            onClose={() => setPanelUser(null)}
            onToast={onToast}
          />
        )}
      </SlidePanel>

      {/* Add Users Modal */}
      {showAddModal && (
        <AddUsersModal
          onClose={() => setShowAddModal(false)}
          onToast={onToast}
        />
      )}
    </>
  );
}

// ─── Role Edit Panel ──────────────────────────────────────────────────────────

function RoleEditPanel({
  role,
  onClose,
  onToast,
}: {
  role: Role;
  onClose: () => void;
  onToast: (msg: string) => void;
}) {
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description);

  // Local mutable permissions
  const [perms, setPerms] = useState<ModulePermission[]>(
    role.permissions.map((p) => ({ ...p, actions: { ...p.actions } }))
  );

  function toggleAction(module: string, action: PermAction) {
    setPerms((prev) =>
      prev.map((p) =>
        p.module === module
          ? { ...p, actions: { ...p.actions, [action]: !p.actions[action] } }
          : p
      )
    );
  }

  function setDataScope(module: string, scope: string) {
    setPerms((prev) =>
      prev.map((p) => (p.module === module ? { ...p, dataScope: scope } : p))
    );
  }

  const ACTIONS: PermAction[] = ["view", "create", "edit", "delete"];

  function handleSave() {
    onToast("Role updated successfully");
    onClose();
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
            <Pencil size={18} className="text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Edit Role: {role.name}</p>
            <p className="text-xs text-gray-500">
              Define permissions and data access scope.
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Role Name & Description */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
            />
          </div>
        </div>

        {/* Permission Matrix */}
        <div>
          <p className="mb-3 text-sm font-semibold text-gray-700">Permissions</p>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-48">
                    Module
                  </th>
                  {ACTIONS.map((a) => (
                    <th
                      key={a}
                      className="py-3 px-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 w-20"
                    >
                      {a.charAt(0).toUpperCase() + a.slice(1)}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Data Scope
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {perms.map((p) => {
                  const isParent = !p.parent;
                  if (isParent) {
                    return (
                      <tr key={p.module} className="bg-gray-100">
                        <td
                          colSpan={6}
                          className="py-2 px-4 text-xs font-bold uppercase tracking-wider text-gray-600"
                        >
                          {p.module}
                        </td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={p.module} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 pl-8 pr-4 text-gray-700 font-medium">
                        {p.module}
                      </td>
                      {ACTIONS.map((a) => (
                        <td key={a} className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={!!p.actions[a]}
                            onChange={() => toggleAction(p.module, a)}
                            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                        </td>
                      ))}
                      <td className="py-3 px-4">
                        <select
                          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={p.dataScope ?? ""}
                          onChange={(e) => setDataScope(p.module, e.target.value)}
                        >
                          <option value="">Select...</option>
                          {DATA_SCOPE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6">
        <button
          onClick={onClose}
          className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
}

// ─── Roles & Permissions Tab ──────────────────────────────────────────────────

function RolesTab({ onToast }: { onToast: (msg: string) => void }) {
  const [search, setSearch] = useState("");
  const [editRole, setEditRole] = useState<Role | null>(null);

  const filtered = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3 p-4">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Search roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <SlidersHorizontal size={15} />
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <th className="py-3 px-4">Role Name</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Users Assigned</th>
              <th className="py-3 px-4">Last Updated</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((role) => (
              <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 font-semibold text-gray-900">{role.name}</td>
                <td className="py-4 px-4 text-gray-500">
                  {role.description || <span className="text-gray-300">&mdash;</span>}
                </td>
                <td className="py-4 px-4 text-gray-700">{role.usersAssigned}</td>
                <td className="py-4 px-4 text-gray-600">{role.lastUpdated}</td>
                <td className="py-4 px-4">
                  <button
                    onClick={() => setEditRole(role)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No roles found.</div>
        )}
      </div>

      {/* Role Edit Panel */}
      <SlidePanel open={!!editRole} onClose={() => setEditRole(null)}>
        {editRole && (
          <RoleEditPanel
            role={editRole}
            onClose={() => setEditRole(null)}
            onToast={onToast}
          />
        )}
      </SlidePanel>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UserRoleManagementPage() {
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-400">
          <span>Administration</span>
          <ChevronRight size={12} />
          <span className="text-gray-600 font-medium">Users &amp; Roles</span>
        </div>

        {/* Page Title */}
        <div className="mb-6 flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Users &amp; Roles</h1>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <HelpCircle size={18} />
          </button>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center border-b border-gray-200 px-4">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors ${
                activeTab === "users"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Users List
            </button>
            <button
              onClick={() => setActiveTab("roles")}
              className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors ${
                activeTab === "roles"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Shield size={15} />
              Roles &amp; Permissions
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "users" ? (
            <UsersListTab onToast={showToast} />
          ) : (
            <RolesTab onToast={showToast} />
          )}
        </div>
      </div>
    </div>
  );
}
