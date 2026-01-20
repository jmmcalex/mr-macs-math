# Mr Mac's Math Class

## Project purpose
Mr Mac's Math Class is a student-facing, mobile-first math playground site.
The goal is to help learners explore big ideas through guardrailed interaction.
It is not a full graphing calculator or an LMS.

## Core design principles
- Playgrounds are guardrailed: students use sliders, toggles, and constrained drag, not free typing.
- Each playground focuses on one mathematical structure.
- Multiple representations (graph, equation, table, diagram) are lenses on the same object.
- Reset behavior is consistent and intentional.
- Mobile-first UX is a requirement, not a nice-to-have.

## Conceptual organization model
- `/domains` are high-level categories (Numbers, Ratios, Trig, etc.).
- `/p/[domain]/[playground]` routes correspond to concept clusters, not lessons.
- A single domain may contain multiple concept clusters.
- Concept clusters map to curriculum concept cards (external system).

## Component philosophy
- `PlaygroundShell`: structural wrapper for a playground page, owning layout, readout areas, and actions.
- `TopNav`: compact back-navigation pattern used across domain and playground pages.
- Control panels are implemented per-playground inside `PlaygroundShell` (no standalone ControlDrawer component yet).
- Representation tabs live inside each playground page until a shared pattern is extracted.

## Development
```bash
npm run dev
```

## Build
```bash
npm run build
```
