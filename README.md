# JSON Studio

A single-file, feature-rich, offline JSON viewer / editor / formatter with a Playwright test suite.

- **One file:** `json-studio.html` (~250 KB, includes jQuery 3.7.1 inlined).
- **No network:** default-src `none` CSP; no CDN.
- **Runs anywhere:** double-click, or `launch-server.bat` for the full experience.

---

## Quick start

Two ways to open:

### 1. Recommended — via HTTP (all features work)

```
launch-server.bat        (Windows)   →   opens http://localhost:8765/json-studio.html
```

or manually:

```
cd C:\Users\Credencys\Desktop\json-studio
python -m http.server 8765
# then open http://localhost:8765/json-studio.html
```

### 2. Fastest — double-click

Double-click `json-studio.html`. The app runs but a few features are restricted by the browser's `file://` policy (cross-origin URL fetch, download-name suggestions). A dismissable banner explains the trade-off.

---

## Features

**Core** — split-pane editor + tree, line numbers, error caret, format / minify / validate,
indent 2 / 4 / tab.

**Editing** — click values to inline-edit; click keys to rename; add / remove / duplicate
node buttons on hover; type-change dropdown; full undo / redo (Ctrl+Z, Ctrl+Y).

**Search** — text find (Ctrl+F) with match counter and navigation; JSONPath filter
supporting `$ . .. [n] [n,m] [*] [?(@.k==\"v\")]` with results list that flashes the
matching node.

**I/O** — Open from file, paste, URL fetch, and drag-and-drop. Save to `.json` file,
copy to clipboard, save minified.

**Extras** — Diff two JSONs side-by-side; convert between JSON / CSV / YAML / XML;
light / dark theme persisted; stats panel (nodes, depth, size, per-type counts,
longest key / string, duplicate-key warnings).

**Keyboard**

| Action        | Shortcut |
|---------------|----------|
| Format        | Ctrl+Shift+F |
| Minify        | Ctrl+Shift+M |
| Undo          | Ctrl+Z |
| Redo          | Ctrl+Y or Ctrl+Shift+Z |
| Find          | Ctrl+F |
| Find next / prev | Enter / Shift+Enter (in Find box) |
| Save          | Ctrl+S |
| Open file     | Ctrl+O |
| Toggle theme  | Ctrl+Shift+D |
| Close dialog  | Esc |

---

## Deploy to GitHub Pages

Push the folder as a repo, enable **Settings → Pages → Source: GitHub Actions**,
and every push to `main` will test and publish. Full instructions in
[.github/DEPLOY.md](.github/DEPLOY.md).

## Running the tests

Tests use Playwright with Chromium. Everything runs headless from WSL.

```
cd /mnt/c/Users/Credencys/Desktop/json-studio     # WSL path
npm install                                       # first time only
npx playwright install chromium                   # first time only (if not cached)
npx playwright test                               # run all 15 spec files
npx playwright test --ui                          # interactive UI mode
```

Reports land in `playwright-report/` (`npx playwright show-report` to view).
Failures capture screenshot + video + trace under `test-results/`.

The Playwright config launches a python http.server on port 8765 and points tests at
`http://localhost:8765/json-studio.html`.

---

## Project layout

```
json-studio/
├── json-studio.html          ← the app (self-contained)
├── launch-server.bat         ← starts python http.server + opens browser
├── plan.md                   ← design + implementation plan
├── README.md                 ← this file
├── package.json              ← @playwright/test dev dep
├── playwright.config.ts      ← Chromium + webServer config
├── .gitignore
└── tests/
    ├── fixtures.ts           ← sample JSONs
    ├── helpers.ts            ← page.goto helper + editor accessors
    └── 01…15-*.spec.ts       ← one spec file per feature area
```

---

## Test coverage matrix

| # | File | What it verifies |
|---|------|------------------|
| 01 | 01-load-and-format | App boots; format button pretty-prints minified input |
| 02 | 02-minify | Minify strips whitespace and preserves parsed value |
| 03 | 03-validate-error | Broken JSON surfaces line/col; valid JSON clears state |
| 04 | 04-tree-expand | Nested JSON renders as tree; toggle collapses/expands |
| 05 | 05-inline-edit | Click value/number → edit → editor updates round-trip |
| 06 | 06-add-remove-node | Add key on root, rename it, delete an existing key |
| 07 | 07-undo-redo | 3 changes; undo restores; redo one step |
| 08 | 08-find-in-editor | Ctrl+F counts and navigates matches |
| 09 | 09-jsonpath-filter | JSONPath returns children, filter predicate, UI list |
| 10 | 10-import-paste | Paste modal loads JSON into editor |
| 11 | 11-import-file | `<input type=file>` load populates editor |
| 12 | 12-export-download | Download `.json` and minified download both work |
| 13 | 13-diff | Diff modal reports add / remove / change classes |
| 14 | 14-convert-csv-yaml-xml | JSON→CSV, CSV→JSON, JSON→YAML, JSON→XML, UI flow |
| 15 | 15-theme-and-stats | Theme toggle persists over reload; stats correct |

25 test cases total across 15 files. Run time ~30 s.

---

## Notes and trade-offs

- **URL fetch** requires CORS support on the target host.
- **YAML/XML converters** are subset implementations, not full spec parsers.
- **Undo stack** capped at 100 snapshots.
- **jQuery** inlined at ~90 KB — accepted for full-offline single-file delivery.
- **file:// origin** — Chrome/Edge treat each file:// URL as a unique origin, which
  restricts URL fetch and shows the console warning "'file:' URLs are treated as
  unique security origins". Using `launch-server.bat` (or any http server) removes
  this restriction.
