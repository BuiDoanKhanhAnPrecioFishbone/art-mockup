# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

Convert Figma wireframes into interactive Next.js web experiences so stakeholders can navigate flows and give UX feedback before real design work begins. All data is mocked — there is no real backend.

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

When adding a new screen:
1. Create fixture data in the relevant entity's `api/` segment.
2. Expose it via an API route under `src/app/api/[entity]/`.
3. Fetch it from the feature or widget using standard `fetch` or a shared API util.

## Figma Integration

This project uses the Figma MCP server. When a Figma URL is provided:
- Use `get_design_context` to extract the design and a screenshot.
- Adapt the output to the project's existing components and Tailwind tokens — do not copy raw hex colors or absolute positioning from the generated code.
- Match the wireframe's interaction flow, not its pixel-perfect visual style.
