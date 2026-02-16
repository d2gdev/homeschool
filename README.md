# Garden Friends Learning Dashboard

A React + TypeScript learning dashboard for a 12-week garden-based homeschool curriculum.

## What this app does

- Displays weekly and daily lesson schedules for Weeks 1-12.
- Tracks activity completion, streaks, and achievements.
- Shows class materials by week.
- Links lesson assets (HTML/PDF/image/text) to specific week/day/time blocks.
- Opens assets in an in-app modal preview.

## Tech stack

- React 19
- TypeScript
- Vite 6
- CSS (custom theme + accessibility/focus styling)

## Project structure

```txt
.
|-- 12-Week-Garden-Learning-Plan.md
|-- materials/
|   |-- week-1/
|   |-- week-2/
|   |-- ...
|   `-- week-12/
|-- public/
|   |-- garden-background.png
|   `-- garden-reading.png
|-- src/
|   |-- App.tsx
|   |-- App.css
|   |-- index.tsx
|   `-- utils/persistence.ts
|-- package.json
`-- tsconfig.json
```

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Run locally

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

### 4. Preview production build

```bash
npm run preview
```

## Key implementation notes

### Curriculum and schedule data

- Weekly/day schedule content is defined in `src/App.tsx` (`CURRICULUM`).
- Each day includes 6 activity blocks:
  - `literacyHabit`
  - `gardenObservation`
  - `scienceLab`
  - `mathBlock`
  - `readingWriting`
  - `oralReflection`

### Lesson assets and modal previews

- Asset mappings are defined in `src/App.tsx` (`LESSON_ASSETS`).
- Each mapping binds an asset to:
  - week
  - day(s)
  - block
  - lesson time
  - lesson label
  - file path
- Supported modal preview types:
  - HTML/HTM (iframe)
  - PDF (iframe)
  - image formats (`png`, `jpg`, `jpeg`, `gif`, `webp`, `svg`, `bmp`)
  - text formats (`txt`, `md`, `json`, `csv`)
- Fallback message appears for unsupported file types.

### Progress persistence

- Progress is saved under key `gardenProgress`.
- Persistence is accessed via `src/utils/persistence.ts` using `window.persistentStorage`.
- The app expects a host/runtime that provides `window.persistentStorage`.

## Background and visual theme

- Main background image is controlled in `src/App.css` with:

```css
--site-bg-image: url('/garden-background.png');
```

- Current background positioning is intentionally set to:

```css
background-position: center 70%;
```

- To switch images, either:
  - replace `public/garden-background.png`, or
  - point `--site-bg-image` to `'/garden-reading.png'` (or another file in `public/`).

## Adding or updating lesson assets

1. Add the file under the appropriate `materials/week-X/` folder.
2. Add/update the entry in `LESSON_ASSETS` in `src/App.tsx`.
3. Ensure `file` path uses the repository-relative path format, e.g.:
   - `materials/week-4/week4_reading_strips.html`
4. Run `npm run build` to verify there are no parse/runtime issues.

## Troubleshooting

### HTML parse errors during build

If Vite reports parse5 HTML errors, check malformed tags in `materials/**.html`.

Common issue example:

```html
<meta name="viewport"="width=device-width, initial-scale=1.0">
```

Correct form:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### Missing asset previews

- Confirm file path exists exactly as referenced in `LESSON_ASSETS`.
- Confirm extension is one of the supported types.
- Verify URL resolves under Vite as `/<file-path>`.

## Accessibility notes

- Focus-visible ring styles are enabled for keyboard navigation.
- Interactive states include default/hover/active/focus styling.
- Reduced-motion handling is included for users who prefer less animation.
