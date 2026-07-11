# JSON Studio

A single-file, feature-rich, offline JSON viewer / editor / formatter with a Playwright test suite.

**Live demo:** https://chauhan-mukesh.github.io/json-studio/

---

## Why JSON Studio?

- **Single file app:** `json-studio.html` (~250 KB, jQuery 3.7.1 inlined)
- **Fully offline:** strict CSP (`default-src 'none'`), no CDN dependency
- **Runs anywhere:** double-click it, or use `launch-server.bat` for full support
- **Zero setup to try:** open the live demo instantly

---

## Quick Start

### 1) Recommended: Run over HTTP (all features enabled)

```bash
launch-server.bat        # Windows → opens http://localhost:8765/json-studio.html
```

Or manually:

```bash
cd C:\Users\Credencys\Desktop\json-studio
python -m http.server 8765
# then open http://localhost:8765/json-studio.html
```

### 2) Fastest: Open directly (double-click)

Double-click `json-studio.html`.

The app still works, but some features are restricted by browser `file://` policies
(e.g., cross-origin URL fetch and download-name suggestions). A dismissible banner
inside the app explains this trade-off.

---

## Features

### Core

- Split-pane editor + tree view
- Line numbers and error caret
- Format / minify / validate
- Indent support: 2 / 4 / tab

### Editing

- Click values for inline edit
- Click keys to rename
- Add / remove / duplicate nodes on hover
- Type-change dropdown
- Full undo / redo (`Ctrl+Z`, `Ctrl+Y`)

### Search

- Text find (`Ctrl+F`) with match counter + next/prev navigation
- JSONPath filter support:
  `$`, `.`, `..`, `[n]`, `[n,m]`, `[*]`, `[?(@.k=="v")]`
- Results list highlights matching nodes

### Import / Export

- Open from file, paste, URL fetch, drag-and-drop
- Save to `.json`
- Copy to clipboard
- Save minified output

### Extras

- Side-by-side JSON diff
- JSON ⇄ CSV / YAML / XML conversion
- Light / dark theme persistence
- Stats panel (nodes, depth, size, type counts, longest key/string, duplicate-key warnings)

### Keyboard Shortcuts

| Action | Shortcut |
|---|---|
| Format | Ctrl+Shift+F |
| Minify | Ctrl+Shift+M |
| Undo | Ctrl+Z |
| Redo | Ctrl+Y or Ctrl+Shift+Z |
| Find | Ctrl+F |
| Find next / prev | Enter / Shift+Enter (in Find box) |
| Save | Ctrl+S |
| Open file | Ctrl+O |
| Toggle theme | Ctrl+Shift+D |
| Close dialog | Esc |

---

## Screenshots

### Main Editor + Tree View

<img src="https://github.com/user-attachments/assets/5a81b4c2-6c2d-4506-acc3-9c0feda59d9f" alt="JSON Studio main editor and tree view" />

### Additional UI Preview

<img src="https://github.com/user-attachments/assets/661506ca-b5f1-4284-9d94-618ccc46d8cf" alt="JSON Studio additional interface preview" />

---

## Deploy to GitHub Pages

Live URL: **https://chauhan-mukesh.github.io/json-studio/**

Push this folder as a repository, then enable:

**Settings → Pages → Source: GitHub Actions**

Each push to `main` will run tests and publish.

Detailed instructions:
- [DEPLOY.txt](DEPLOY.txt)
- [.github/DEPLOY.md](.github/DEPLOY.md)

---

## Running Tests

Playwright + Chromium (headless, WSL-compatible):

```bash
cd /mnt/c/Users/Credencys/Desktop/json-studio
npm install
npx playwright install chromium
npx playwright test
npx playwright test --ui
```

Reports:
- HTML report: `playwright-report/` (open with `npx playwright show-report`)
- Failed runs: screenshot + video + trace in `test-results/`

Test config starts `python http.server` on `8765` and targets:
`http://localhost:8765/json-studio.html`

---

## Project Layout

```text
json-studio/
├── json-studio.html          # self-contained app
├── launch-server.bat         # starts local python server + opens browser
├── plan.md                   # design + implementation plan
├── README.md                 # this file
├── package.json              # @playwright/test dev dependency
├── playwright.config.ts      # Chromium + webServer config
├── .gitignore
└── tests/
    ├── fixtures.ts
    ├── helpers.ts
    └── 01…15-*.spec.ts
```

---

## Test Coverage Matrix

| # | File | What it verifies |
|---|---|---|
| 01 | 01-load-and-format | App boots; format button pretty-prints minified input |
| 02 | 02-minify | Minify strips whitespace and preserves parsed value |
| 03 | 03-validate-error | Broken JSON shows line/col; valid JSON clears state |
| 04 | 04-tree-expand | Nested JSON renders as tree; toggle collapses/expands |
| 05 | 05-inline-edit | Edit value/number and confirm round-trip update |
| 06 | 06-add-remove-node | Add root key, rename it, delete an existing key |
| 07 | 07-undo-redo | Multiple changes undo/redo correctly |
| 08 | 08-find-in-editor | Ctrl+F counts and navigates matches |
| 09 | 09-jsonpath-filter | JSONPath results, predicate support, UI list |
| 10 | 10-import-paste | Paste modal loads JSON into editor |
| 11 | 11-import-file | File input populates editor |
| 12 | 12-export-download | Normal + minified download flows work |
| 13 | 13-diff | Diff modal reports add/remove/change classes |
| 14 | 14-convert-csv-yaml-xml | JSON↔CSV/YAML/XML conversion UI flow |
| 15 | 15-theme-and-stats | Theme persists; stats are accurate |

25 test cases across 15 spec files (about ~30s runtime).

---

## Notes & Trade-offs

- URL fetch depends on CORS support of the target host.
- YAML/XML converters are intentionally subset implementations.
- Undo stack is capped at 100 snapshots.
- Inlined jQuery (~90 KB) is a deliberate trade-off for single-file offline usage.
- `file://` origin restrictions in Chrome/Edge can limit URL fetch and trigger
  security-origin warnings; using `launch-server.bat` (or any local HTTP server)
  removes those restrictions.
