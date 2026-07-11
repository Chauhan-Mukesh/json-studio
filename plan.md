# JSON Studio — Design & Implementation Plan

**Deliverable:** A single, feature-rich, self-contained, offline HTML JSON tool (viewer/editor/formatter/converter/differ) at `C:\Users\Credencys\Desktop\json-studio\json-studio.html`.

**Testing:** Playwright test suite (~15 specs), one per feature area, run from WSL.

---

## 1. Requirements (confirmed with user)

- **Stack**: HTML + CSS + JavaScript + jQuery. **Fully offline** — jQuery source inlined; no CDN, no network calls.
- **Delivery**: Single `.html` file that opens directly in a browser (double-click).
- **Input modes**: File picker, paste, URL fetch, drag-and-drop — all first class.
- **Layout**: Split-pane. Left = text editor with line numbers. Right = interactive tree. Toolbar on top. Both panes stay in sync.
- **Testing**: Playwright, ~15 tests (one per feature area). Runs against the file via `file://` protocol from WSL Chromium.
- **Location**: `C:\Users\Credencys\Desktop\json-studio\` (= `/mnt/c/Users/Credencys/Desktop/json-studio/` in WSL).

---

## 2. Feature list

Grouped by capability (all four groups confirmed):

**Core** — viewer, editor, formatter
1. Split-pane layout with resizable divider.
2. Text editor: line numbers, tab-to-indent, bracket-match highlight, error line marker.
3. Tree view: collapsible, coloured by type, `{n}`/`[n]` node counts, JSON pointer path on hover.
4. Format (beautify) with configurable indent (2 / 4 / tab).
5. Minify to single line.
6. Validate — reports first error's line/column with a caret; ok banner on success.
7. Live sync — typing in editor updates tree; every 300 ms with debounce.

**Editing**
8. Click a value in the tree to inline-edit; Enter to commit, Esc to cancel.
9. Click a key to rename; Enter to commit.
10. `+` and `−` buttons per node to add child / remove self / duplicate.
11. Change type via a small type-badge dropdown (string ↔ number ↔ boolean ↔ null ↔ object ↔ array).
12. Undo / Redo — global stack, Ctrl+Z / Ctrl+Y, works for both editor edits and tree edits.

**Search**
13. Ctrl+F — find in editor with highlight, next/prev, match counter.
14. JSONPath filter box — supports `$.a.b`, `$..key`, `$.arr[*].x`, `$.arr[0,2]`, `$..[?(@.k==\"v\")]` (subset). Results panel lists matches; click to jump.
15. Click any tree node → copies dotted path + JSON pointer to clipboard, shows toast.

**I/O**
16. Open file — file picker; accepts `.json`, `.txt`.
17. Paste — modal with textarea, "Load" button.
18. URL fetch — modal with URL input, tries `fetch()` (subject to CORS).
19. Drag-and-drop — overlay appears on dragover, drops load the file.
20. Save as — download current JSON as `.json`.
21. Copy — copy current JSON to clipboard.
22. Export subtree — right-click on a tree node → export just that node.

**Extras**
23. Diff — modal / secondary view with left+right editors; runs a structural diff and highlights added/removed/changed keys.
24. Convert — JSON ⇄ CSV (flatten one level), JSON ⇄ YAML (basic subset), JSON ⇄ XML (element per key).
25. Theme — light / dark toggle in toolbar, persisted to localStorage.
26. Stats panel — total nodes, max depth, size in bytes, count by type, longest key, longest string, arrays/objects count, duplicate-key warning per parent.
27. Recent files — last 5 loads kept in localStorage (file name + timestamp + snippet).

---

## 3. UI layout

```
┌─────────────────────────────────────────────── JSON Studio ─────────────────────────────────────────┐
│ [Open ▾]  [Save ▾]  [Format]  [Minify]  [Validate]  [Undo]  [Redo]  │  [Diff] [Convert] [Stats]  🌙│
├────────────────────────────────┬────────────────────────────────────────────────────────────────────┤
│  Find: [____________]  ▲ ▼    │  JSONPath: [$.____________]                            [0 matches]  │
├────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
│  1  {                          │  ▾ root {8}                                                        │
│  2    "name": "acme",          │    name  : "acme"          [str]                                   │
│  3    "count": 42,             │    count : 42               [num]                                  │
│  4    "tags": [                │  ▾ tags [3]                 [arr]                                  │
│  5      "a", "b", "c"          │      0 : "a"                                                       │
│  6    ]                        │      1 : "b"                                                       │
│  7  }                          │      2 : "c"                                                       │
├────────────────────────────────┴────────────────────────────────────────────────────────────────────┤
│  status: ok   |   nodes: 8   |   size: 62 B   |   depth: 2                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

- Editor pane: monospace, line-numbered, error caret in gutter.
- Tree pane: virtualised for large trees (>2000 nodes) to keep scroll smooth.
- Divider between panes is draggable (5 px hit area).
- Toolbar collapses to a hamburger menu below 900 px width.
- Modals: Paste, URL, Diff, Convert, Stats. All escape-closable, click-outside-closable.

---

## 4. Architecture

Single-file HTML. Sections in this order:

1. `<head>` — meta, favicon (SVG emoji), inline CSS.
2. `<body>` — DOM skeleton (toolbar, panes, status bar, modals, hidden file input).
3. `<script>` — inlined jQuery source (~90 KB).
4. `<script>` — application code, organised as an IIFE with modules:
   - `state` — current AST, cursor, undo stack, dirty flag, theme, indent, recent files.
   - `parser` — safe JSON.parse wrapper returning `{ok, value, error:{line,col,msg}}`.
   - `formatter` — beautify, minify.
   - `editor` — textarea + gutter + bracket match + error caret.
   - `tree` — renderer; row per node; virtualised beyond N=2000.
   - `sync` — one direction at a time (editor→tree on debounced type, tree→editor on tree edit).
   - `edit` — inline edit widgets, add/remove/duplicate, type change.
   - `history` — undo/redo stack of full JSON snapshots (capped at 100).
   - `search` — text find, JSONPath compile + evaluate.
   - `io` — file / paste / url / dnd / save / copy.
   - `diff` — recursive structural diff, colour-coded output.
   - `convert` — JSON⇄CSV/YAML/XML pure functions.
   - `stats` — walk AST once, gather metrics.
   - `theme` — CSS variables swap; persisted.
   - `toast` — small transient message helper.

Rationale for a single file: user asked for `.html` on Desktop, fully offline, jQuery-based. No build step keeps it hackable.

---

## 5. Data flow

- Source of truth: the **text** in the editor. The tree is a *view* rebuilt from parsed text.
- On every debounced editor change: parse → if ok, rebuild tree; if error, keep last-good tree greyed and show error line.
- Tree edits (inline, add, remove, type change) mutate a copy of the parsed value, then serialise back to formatted text and push into the editor.
- Undo/redo pushes the whole editor text snapshot (bounded stack, capped at 100 entries or 5 MB total).

---

## 6. Error handling

- Every parse routes through `parser.tryParse()`. Failure sets the status bar red with `Line X, Col Y: <message>` and puts a caret in the gutter.
- File > 20 MB shows a confirm dialog before loading.
- Tree > 2000 nodes triggers virtualisation.
- Circular refs are impossible in JSON; the type-change UI forbids introducing them.
- URL fetch failure (CORS or 4xx/5xx) shows a toast with the error, does not touch current state.

---

## 7. File structure on Desktop

```
C:\Users\Credencys\Desktop\json-studio\
├── json-studio.html              ← the app (single, self-contained)
├── plan.md                       ← this file
├── README.md                     ← usage + how to run tests
├── package.json                  ← @playwright/test devDependency
├── playwright.config.ts          ← file:// launch + Chromium
├── .gitignore                    ← node_modules, test-results
└── tests\
    ├── fixtures.ts               ← sample JSON payloads
    ├── 01-load-and-format.spec.ts
    ├── 02-minify.spec.ts
    ├── 03-validate-error.spec.ts
    ├── 04-tree-expand.spec.ts
    ├── 05-inline-edit.spec.ts
    ├── 06-add-remove-node.spec.ts
    ├── 07-undo-redo.spec.ts
    ├── 08-find-in-editor.spec.ts
    ├── 09-jsonpath-filter.spec.ts
    ├── 10-import-paste.spec.ts
    ├── 11-import-file.spec.ts
    ├── 12-export-download.spec.ts
    ├── 13-diff.spec.ts
    ├── 14-convert-csv-yaml-xml.spec.ts
    └── 15-theme-and-stats.spec.ts
```

---

## 8. Implementation phases

Each phase ends with the corresponding tests green.

### Phase 0 — Scaffold (Task #2)
- Create folder tree above.
- `package.json` with `@playwright/test` devDep and `test` script.
- `playwright.config.ts` — Chromium only, launches at `file://` path of `json-studio.html`.
- `.gitignore` for `node_modules`, `test-results`, `playwright-report`.
- `README.md` skeleton (fill at the end).

### Phase 1 — Core shell (Task #3)
- HTML skeleton, split-pane CSS, toolbar buttons.
- Editor: `<textarea>` with a paired `<div>` gutter for line numbers + error caret. jQuery syncs scroll positions.
- Tree renderer: recursive DOM build from parsed value; expand/collapse via click on the `▸` marker.
- Format / Minify / Validate buttons wired.
- Debounced editor→tree sync.
- **Tests**: 01, 02, 03, 04.

### Phase 2 — Editing (Task #4)
- Inline-edit: on tree row click, replace value with `<input>`, Enter commits (rebuild JSON → push to editor), Esc cancels.
- Key rename: same pattern on key cell.
- Row buttons: `＋` (add sibling below), `−` (delete this), `⧉` (duplicate).
- Type-badge dropdown (small chip): switches between primitives; object/array creates empty container.
- History: push full editor text before each mutation. `undo()` / `redo()` restore. Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z bound.
- **Tests**: 05, 06, 07.

### Phase 3 — Search + JSONPath (Task #5)
- Find bar (Ctrl+F): mark matches in editor with an overlay `<div>` behind the textarea (mirror trick); ▲ / ▼ / Esc to close.
- JSONPath: small hand-rolled evaluator supporting `$`, `.`, `..`, `[n]`, `[n,m]`, `[*]`, `[?(@.k==\"v\")]`, `[?(@.k>N)]`. Results panel lists match paths; click to expand tree to that node and flash it.
- Click a tree node → clipboard gets JSON pointer + dotted path; toast.
- **Tests**: 08, 09.

### Phase 4 — I/O (Task #6)
- Open ▾ menu: File, Paste, URL. Modals for Paste and URL.
- Drag-drop: full-window overlay on `dragenter`, load file on `drop`.
- Save ▾ menu: Download as .json, Copy to clipboard.
- Right-click on tree row → export subtree.
- Recent files list in localStorage; shown at top of Open menu.
- **Tests**: 10, 11, 12.

### Phase 5 — Extras (Task #7)
- Diff modal: two editors side-by-side; recursive diff walks both trees, produces coloured HTML output (green add, red remove, yellow change).
- Convert modal: source-format select, target-format select, textarea, Convert button.
- Theme toggle in toolbar: CSS variables `--bg`, `--fg`, `--accent`, `--muted`, `--danger`, `--ok`; persisted.
- Stats modal: single walk fills a table (nodes, depth, bytes, counts by type, longest key, longest string, dup-key warnings).
- **Tests**: 13, 14, 15.

### Phase 6 — Playwright suite (Task #8)
- Write all 15 specs (see test matrix below).
- Fixtures file with 3 sample JSONs (small, nested, broken).

### Phase 7 — Run + fix + docs (Task #9)
- `npx playwright test` from `/mnt/c/Users/Credencys/Desktop/json-studio`.
- Fix failures; iterate.
- Fill in `README.md` with quick start, keyboard shortcuts, how to run tests.

---

## 9. Test matrix

| # | File | What it verifies |
|---|------|------------------|
| 01 | 01-load-and-format.spec.ts | Loads app; setEditor(minified sample); click Format; editor content equals expected pretty output. |
| 02 | 02-minify.spec.ts | setEditor(pretty); click Minify; editor content has no newlines and equals expected minified. |
| 03 | 03-validate-error.spec.ts | setEditor(broken); status bar shows error with line and column; gutter has `.error-caret` on that line. |
| 04 | 04-tree-expand.spec.ts | setEditor(nested); tree renders root; click ▸ on `books` array; three child rows visible. |
| 05 | 05-inline-edit.spec.ts | Load sample; click value `"acme"` in tree; type `"foo"`; Enter; editor text updated; tree row shows `"foo"`. |
| 06 | 06-add-remove-node.spec.ts | Click `＋` on root; new key `key1` appears; edit key to `city`, value to `"Ahmedabad"`; delete another key; editor reflects both. |
| 07 | 07-undo-redo.spec.ts | Perform 3 edits; Ctrl+Z three times returns to original; Ctrl+Y once redoes one step. |
| 08 | 08-find-in-editor.spec.ts | Ctrl+F; type `count`; match counter shows `2 of 2` on a sample with 2 occurrences; ▲/▼ navigate. |
| 09 | 09-jsonpath-filter.spec.ts | Enter `$.store.book[*].title`; results list shows 4 titles; click first; tree scrolls to that node. |
| 10 | 10-import-paste.spec.ts | Open ▾ → Paste; paste JSON; Load; editor+tree populated. |
| 11 | 11-import-file.spec.ts | Programmatically dispatch file input change with fixture JSON; editor loaded. |
| 12 | 12-export-download.spec.ts | Load sample; click Save ▾ → Download; capture download; downloaded content equals current editor. |
| 13 | 13-diff.spec.ts | Open Diff; put A and B; click Diff; result HTML has one `.diff-add`, one `.diff-remove`, one `.diff-change`. |
| 14 | 14-convert-csv-yaml-xml.spec.ts | Open Convert; JSON→CSV of small object array produces expected CSV; JSON→YAML expected; JSON→XML expected. |
| 15 | 15-theme-and-stats.spec.ts | Click theme toggle; `html[data-theme=dark]`; reload; still dark. Open Stats; sees expected node count. |

All tests share a `helpers.ts` with `setEditor(page, json)`, `getEditor(page)`, `openPaste(page, json)`.

---

## 10. Known trade-offs

- **URL fetch** — subject to browser CORS on remote hosts. Local files under Desktop won't work via `fetch(file://...)` in Chromium unless launched with `--allow-file-access-from-files`. Documented in README.
- **YAML/CSV/XML converters** are subset implementations (round-trip guarantees only for shallow, non-anchored inputs). Documented.
- **Undo stack** capped to 100 or 5 MB — beyond that, oldest snapshot dropped.
- **Very large files** (>20 MB) trigger confirm prompt; tree virtualises above 2000 nodes.
- **jQuery inline** adds ~90 KB — accepted for full offline.

---

## 11. Success criteria

- Double-clicking `json-studio.html` opens the app in a browser with no network requests (verified by DevTools → Network tab empty).
- All 15 Playwright tests pass on a fresh checkout: `cd /mnt/c/Users/Credencys/Desktop/json-studio && npm install && npx playwright test`.
- No console errors on load.
- Works in Chrome/Edge/Firefox (target: Chromium via Playwright; manual spot-check on Firefox if available).

---

## 12. Out of scope

- Cloud sync, accounts, sharing to a server.
- JSON Schema validation (only structural validate; documented).
- Real-time collaboration.
- Mobile-first UI (responsive to ~700 px but designed for desktop).
