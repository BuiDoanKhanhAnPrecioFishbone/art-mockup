# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Business requirements (read first)

The full business rules are organised at **[`docs/requirements/INDEX.md`](docs/requirements/INDEX.md)**. Before building or changing any flow, open the index, find the row that matches the domain you're touching, and read the linked doc. Cross-references inside each doc point at related rules. The mockup must follow these rules — they are the source of truth for hierarchy, status transitions, validation, and auto-assignment behaviour.

## Project Purpose

Build a **whole interactive mockup site** in Next.js that behaves like a real web app — navigation, forms, state changes, business rules — but is entirely backed by mock data. The goal is the same as a designer's wireframe: let customers and stakeholders click through the full product end-to-end, experience the flows and UX, validate business rules, and give feedback before any real backend or production design work begins.

This is **not** a collection of isolated flow demos. Treat it as one cohesive site:
- Pages link to each other naturally; state persists across the session where a real app would persist it.
- Business rules (validation, permissions, conditional flows, status transitions) are enforced against mock data so customers see realistic behavior.
- Fidelity target is wireframe-level UX, not pixel-perfect visual design — interaction correctness matters more than polish.

All data is mocked — there is no real backend.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Production build
npm run lint       # ESLint check
npm run type-check # TypeScript check (tsc --noEmit)
```

## Architecture: Feature Slices Design (FSD)

This project follows [Feature Slices Design](https://feature-sliced.design/). The layer hierarchy (top = most abstracted, bottom = most shared) is:

```
src/
  app/          # Next.js App Router — layouts, pages, routing
  pages/        # (if using Pages Router instead)
  widgets/      # Large composite UI blocks assembled from features/entities
  features/     # User interactions and business logic slices (e.g. auth, navigation)
  entities/     # Business domain models (e.g. user, product, artwork)
  shared/       # Reusable primitives: ui/, lib/, api/, config/, types/
```

**Key FSD rules:**
- A layer may only import from layers **below** it (e.g. `features` can import from `entities` and `shared`, never from `widgets` or `app`).
- Each slice is self-contained with its own `ui/`, `model/`, `api/`, and `index.ts` public API.
- Cross-slice imports within the same layer are forbidden — use a higher layer to compose them.

## Fake Server Pattern

Mock API endpoints live in `src/app/api/` (Next.js API routes). They return static or generated fixture data — no real database. Fixtures and seed data live in `src/shared/fixtures/` or co-located in each entity's `api/` segment.

Because the mockup is a **whole site**, the fake server should behave consistently across the app:
- Use a single shared in-memory store (or seeded fixtures) per entity so writes from one screen are visible on another within the session.
- Enforce business rules in the API layer (validation, status transitions, permission checks) — not just in the UI — so flows feel real.
- Mock auth/session state should be shared site-wide (e.g. via cookie, context, or a single mock session module).

When adding a new screen:
1. Create or extend fixture data in the relevant entity's `api/` segment.
2. Expose it via an API route under `src/app/api/[entity]/`, including any business-rule logic the customer needs to see.
3. Fetch it from the feature or widget using standard `fetch` or a shared API util.
4. Wire the screen into the site's navigation so it's reachable from the natural entry points — never leave it as an orphan route.

## System Patterns (must follow)

### Filter pattern — single source of truth

Every filter icon button anywhere in this app MUST open the same shared Filter modal at `shared/ui/filter.tsx`. Do not build a one-off filter popover, drawer, or inline row for a specific page.

- Pass per-screen filter field config (id, label, type, options) into the shared component; do not fork it.
- Below the search/filter row, render currently-applied filters as removable chips so users can clear individual filters without reopening the modal.

The filter modal contract (from the customer's master component library):

- Header: "Filters" title with filter icon + close X.
- Body, two columns: left rail (~224px) lists filterable fields with the selected one highlighted purple and active fields showing a filled indicator; right pane (~476px) shows the control for the selected field.
- Footer: `Clear All` link (left), `Cancel` + purple `Apply` buttons (right).

Supported field control types (`type` prop on field config):
- `single-select` — radio list (≤10 options) or dropdown (>10).
- `multi-select` — checkbox list (≤10 options) or chip-picker for "choose objects/people".
- `range` — operator radios (between/greater than/less than) + slider with min/max inputs.
- `number-unit` — single number input + unit + operator.
- `date` — single date picker.
- `date-range` — from/to date pickers.

## Figma Integration

This project uses the Figma MCP server. When a Figma URL is provided:
- Use `get_design_context` to extract the design and a screenshot.
- Adapt the output to the project's existing components and Tailwind tokens — do not copy raw hex colors or absolute positioning from the generated code.
- Match the wireframe's interaction flow, not its pixel-perfect visual style.
- Treat each Figma frame as one screen of the larger site — connect it to surrounding screens, shared layout (nav, header, auth), and the shared mock data model rather than building it as a standalone page.
