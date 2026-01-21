# Content Authoring Guide

## Add a new day file
Create a new markdown file in:

```
content/days/YYYY-MM-DD.md
```

Example:

```
content/days/2026-01-20.md
```

## Required frontmatter fields
```yaml
---
date: "2026-01-20"
focus: "Spot how the growth factor changes the curve and compare it to decay."
warmup: "Write one observation about how changing b affects the curve's shape."
featuredDomain: "exp-log"
featured:
  title: "Exponential Growth"
  href: "/p/exp-log/exponential-growth"
tags: ["exponentials", "growth", "decay"]
---
```

Notes:
- `date`, `focus`, `warmup`, and `featured` are required.
- `featuredDomain` and `tags` are optional.

## How the homepage chooses "today"
- The homepage reads every file in `content/days/`.
- Entries are sorted by `date` (newest first).
- The latest entry becomes the "Today" plan and featured lesson.

## Recent lessons
- The homepage shows the latest 4 entries.

## Teacher notes
You can write notes below the frontmatter. They are ignored for now and reserved for future use.

## Preview locally
```bash
npm run dev
```
Then open `http://localhost:3000`.

## Publish to production (GitHub Pages)
1) Add or update day files under `content/days/`.
2) Run the publish script:
```bash
./scripts/publish-days.sh "Update daily lesson plan"
```
3) The script will commit, push, and run `npm run deploy`.

## Publish site-wide changes
Use the full publish script when you change app code or layout.
```bash
./scripts/publish-site.sh "Publish site updates"
```

Notes:
- The site is hosted at `https://jmmcalex.github.io/mr-macs-math/`.
- If you use a different host, set `NEXT_PUBLIC_SITE_URL` for QR generation.
