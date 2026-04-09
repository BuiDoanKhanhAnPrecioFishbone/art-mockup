# Copilot Instructions

## Project Purpose

Convert Figma wireframes into interactive Next.js experiences for stakeholder UX feedback. All data is mocked — there is no real backend.

## Wireframe Pipeline (Quick Reference)

Run `/agent` → select **`implement-flow`** → provide a Figma URL, flow name, and change request.  
The orchestrator chains: Design Extraction → Plan (user confirms) → Implement → QA.  
See `.github/instructions/wireframe-workflow.instructions.md` for full details.

---

## Commands

```bash
npm run dev        # Dev server at http://localhost:3000
npm run build      # Production build
npm run lint       # ESLint
npm run type-check # TypeScript check (tsc --noEmit)
```

There are no automated tests.

## Architecture: Feature-Sliced Design (FSD)

Layers in strict import order (lower layers cannot import from higher):

```
app/        → Next.js App Router: layouts, pages, routing
widgets/    → Large composite UI blocks (currently empty — scaffold only)
features/   → User interaction slices (currently empty — scaffold only)
entities/   → Domain models (currently empty — scaffold only)
shared/     → ui/, lib/, api/, config/, types/, fixtures/
```

**Import rule**: a layer may only import from layers _below_ it. Cross-slice imports within the same layer are forbidden.

Each slice exposes a public API via `index.ts`. Import from the barrel, not internal files:
```ts
// ✅
import { Button, Card, Badge } from "@/shared/ui";
import { cn } from "@/shared/lib";
// ❌
import { Button } from "@/shared/ui/button";
```

## Adding a New Flow

1. Add fixture data in `shared/fixtures/<domain>.ts`, typed against `shared/types/<domain>.ts`.
2. Expose it via API routes under `app/api/<domain>/route.ts` — routes just `return NextResponse.json(fixture)`.
3. Register the flow in `shared/config/flows.ts` (`FLOWS` array with `FlowMeta`).
4. Build pages under `app/flows/<flow-name>/`.

## Mock API Pattern

API routes are thin wrappers over fixtures — no logic, no database:

```ts
// app/api/email-management/templates/route.ts
import { emailTemplates } from "@/shared/fixtures/email-templates";
export async function GET() {
  return NextResponse.json(emailTemplates);
}
```

For POST endpoints that simulate AI or async work, use a hardcoded response keyed by keyword-matching the request body. Simulate latency in the client with `setTimeout`, not in the route handler.

## Shared UI Components

Located in `shared/ui/`. Custom Tailwind components — no external UI library.

| Component | Variants |
|-----------|----------|
| `Button` | `primary` (blue-600), `secondary` (white border), `ghost` (transparent) · sizes: `sm`, `md`, `lg` |
| `Badge` | `default` (gray), `success` (green), `warning` (amber), `info` (blue) |
| `Card` | `Card`, `CardHeader`, `CardContent` |

`cn()` from `shared/lib` is the classname merge utility (no `clsx`/`tailwind-merge`).

## Key Conventions

**Page files are large and self-contained.** Sub-components for a page live either inline in the same file (prefixed with a banner comment like `// ─── MODAL ───`) or in a co-located `_components/` folder. The underscore prefix means the folder is not a route segment.

**Client vs Server components**: Pages with interactivity use `"use client"`. API routes and the root layout are server-side. Layouts under `app/flows/` are typically pass-through (`<>{children}</>`).

**State typing**: Use a union type for step/tab state:
```ts
type Tab = "template-library" | "settings" | "logs";
type Step = "idle" | "loading" | "result" | "error";
```

**Fixture imports in components**: It's acceptable to import fixtures directly in a client component for read-only display. Use the API route when you need fetch-based data flow (e.g., to simulate network loading states).

**TypeScript**: Strict mode on. Use `import type` for type-only imports. Use `Record<K, V>` for variant-to-class mappings. Next.js 15 dynamic route params are `Promise`-wrapped:
```ts
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

**Icons**: Use `lucide-react` exclusively. Import only what you use.

**Tailwind patterns**:
- Page backgrounds: `bg-gray-50`
- Cards/panels: `bg-white rounded-xl border border-gray-200 shadow-sm`
- Modals: `fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm`
- Focus rings: `focus:outline-none focus:ring-2 focus:ring-blue-500`
- Inputs: `rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-<color>-500`

## Path Alias

`@/` maps to the project root. Always use it for cross-directory imports.
