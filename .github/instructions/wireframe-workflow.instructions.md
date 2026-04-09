---
applyTo: "**"
---

# Wireframe Implementation Workflow

## Available Agents

Use `/agent` to browse and select any of these:

| Agent | Purpose |
|-------|---------|
| `implement-flow` | **Full pipeline orchestrator** — use this to build or update a flow from a Figma URL |
| `flow-implementation-planner` | Phase 2 only — create an implementation plan from a wireframe |
| `implementation-builder` | Phase 3 only — write code from a confirmed plan |
| `flow-qa-validator` | Phase 4 only — validate implementation against wireframe |

## Running the Full Pipeline

Invoke `implement-flow` via `/agent` and provide:

```
Figma URL:        https://figma.com/design/<key>/<name>?node-id=<id>
Flow name:        kebab-case-name        (used as route: /flows/<name>)
Change request:   What to build/update
Flow title:       Human-readable label   (optional, for home page card)
Description:      One-line description   (optional, for home page card)
```

The orchestrator runs **4 phases** automatically:
1. **Design extraction** — Figma MCP pulls layout, screenshot, and component hierarchy
2. **Planning** — planner agent outputs a file-level implementation plan (user confirms before proceeding)
3. **Implementation** — builder agent writes code, runs `type-check` + `lint`, fixes errors
4. **QA validation** — QA agent validates screens, navigation, and FSD constraints

## Running Individual Phases

If you only need one phase (e.g., re-running QA after a manual fix):

```
# Re-plan only
"Plan the changes needed for the [flow-name] flow based on this Figma URL: [url]"

# Re-implement only  
"Implement this plan: [paste plan]"

# Re-run QA only
"QA the [flow-name] flow at http://localhost:3000/flows/[flow-name] against this wireframe: [url]"
```

## Adding a New Flow (Manual Path)

If building without Figma:

1. Add types to `shared/types/<domain>.ts`
2. Add fixture data to `shared/fixtures/<domain>.ts`
3. Expose via `app/api/<domain>/route.ts`
4. Register in `shared/config/flows.ts` (`FLOWS` array)
5. Build pages under `app/flows/<flow-name>/`
