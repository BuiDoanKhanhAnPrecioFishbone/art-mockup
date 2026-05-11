# 12 — Viewing-Role Pattern (demo "view as")

> Index → [INDEX.md](./INDEX.md). Source of role definitions → [`/admin/users` → Roles & Permissions tab](../../app/(app)/admin/users/page.tsx) and the seed at [`entities/system-role/api/fixtures.ts`](../../entities/system-role/api/fixtures.ts).

## Why

Stakeholders want to compare what each role sees on the same screen
without juggling logins. We expose a global **Viewing as: \<Role\>**
switcher in the sidebar; every UI surface should respect the active
role's permission matrix so Admin / Manager / Recruiter / Standard
User / Reviewer / Candidate can be inspected side-by-side.

## Where the state lives

- `localStorage["art-mockup:viewing-role-id"]` — survives reloads,
  syncs across tabs.
- Hooks at [`shared/lib/viewing-role.ts`](../../shared/lib/viewing-role.ts):
  - `useViewingRoleId()` → `[id, setId]`. Use when you only need the
    raw id and don't have the role list at hand.
  - `useViewingRole(roles)` → `{ roleId, role, setRoleId, allRoles,
    can, canSeeModule, noteFor }`. Use everywhere else; pass the
    `SystemRole[]` you've fetched from `/api/system-roles`.

## How to gate a UI

### Sidebar nav (already wired)

Each `NavItem` declares its `moduleId`. The sidebar hides items the
current role can't `view`. `Items` without a `moduleId` stay visible
(use this for internal-tooling pages that aren't in the permission
matrix, e.g. Section Template).

### Page-level "Add / Edit / Delete" buttons

```tsx
"use client";
import { useEffect, useState } from "react";
import type { SystemRole } from "@/entities/system-role";
import { useViewingRole } from "@/shared/lib/viewing-role";

function MyPage() {
  const [roles, setRoles] = useState<SystemRole[]>([]);
  useEffect(() => {
    fetch("/api/system-roles").then(r => r.json()).then(d => setRoles(d.roles ?? []));
  }, []);
  const { can, canSeeModule, noteFor } = useViewingRole(roles);

  if (!canSeeModule("program")) {
    return <ForbiddenScreen />;
  }
  const note = noteFor("program"); // "Assigned only", "Open / Published", etc.

  return (
    <>
      {can("program", "add") && <AddButton />}
      {/* ... */}
    </>
  );
}
```

### Action-level gates

Use `can(moduleId, action)` for Add / Update / Delete buttons. List
+ View together imply "see the page at all" → `canSeeModule()`.

### Special notes

`noteFor(moduleId)` returns the role's free-text caveat (e.g.
`"Assigned only"`, `"Own profile only"`, `"Open / Published"`,
`"Do test"`). Surface this in headings or page subtitles so the
operator sees why the data is filtered.

## Adding a new module to the matrix

1. Extend `ModuleId` + `MODULE_GROUPS` in
   [`entities/system-role/model/types.ts`](../../entities/system-role/model/types.ts).
2. Add `permissions[<moduleId>]` (and optional `dataScope` /
   `notes`) to every seeded role in `system-role/api/fixtures.ts`.
3. If the module gets a sidebar entry, set its `moduleId` on the
   `NavItem` so the sidebar filters automatically.
