# Graphite Teacher Workbench: UI/UX Design Specification

> **Target**: v0.3 IDE-shell direction. Updated 2026-05-17 after Task 014 review.

---

## 0. Positioning

Graphite is a **domain-specific diagram IDE for STEM teaching diagrams**.

It is:
- Template-first, vector-first, diagram-semantics-first
- Aimed at STEM teachers who need exam-ready, editable, validated diagrams
- Built around the `Template → IR → Renderer → SVG` deterministic pipeline

It is **not**:
- A general SVG editor
- A form-based diagram generator
- A design tool like Figma or a full IDE like VS Code

The UI should feel like **CircuitLab meets VS Code meets Obsidian**: disciplined information hierarchy, keyboard-first, resizable panels, command palette, status bar.

---

## 1. Information Architecture (v0.3 Target)

```text
┌──────────────────────────── Top App Bar ────────────────────────────────┐
│ Brand │ [File] [Export] │ filename · mode · validation │ [View] [Settings] │
├──── Left Explorer ────┬────────── Canvas Workspace ──────────┬── Right Inspector ──┤
│ Template Library      │ Canvas Header (title · meta)         │ [Properties]        │
│  Search               │ ┌─ Tool ─┐ ┌─ View ─────┐ ┌─ Overlay ─┐  │ [IR]            │
│  Categories           │ │ Sel Pan│ │ + - Fit 100%│ │ Grid Lbl V│  │ [SVG]           │
│  Template cards       │ └────────┘ └────────────┘ └──────────┘  │ [Validation]    │
│                       │ Diagram canvas (SVG)                     │ [Export]        │
│  [collapse ←]         │                              [→ collapse] │  [collapse →]  │
├───────────────────────┴──────────────────────────────────────────┴─────────────────┤
│ Status Bar: Ready | Select | 100% | 600×500 | ✓ OK | zh-TW | light               │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Layer Hierarchy (the key design principle)

Every control belongs to exactly one layer. Mixing layers is the root cause of the current "cluttered inspector" problem.

| Layer | Question it answers | Location |
|---|---|---|
| **App** | Preferences that persist across documents | Settings modal |
| **Document** | State of this open file | Top App Bar (center) |
| **Canvas view** | How I'm looking at the canvas right now | Canvas toolbar |
| **Diagram / selection** | Properties of the current diagram or element | Inspector → Properties tab |
| **Developer / advanced** | IR source, SVG source, validation log | Inspector → IR / SVG / Validation tabs |

---

## 3. Top App Bar

### Layout

```
[ Brand ]  [ File group ]  [ Export group ]  |  [ filename · mode badge · validation badge ]  |  [ View group ]  [ Settings ]
```

### File group
- New · Open JSON · Save JSON

### Export group
- Copy SVG · Download SVG

### View group
- Toggle left panel
- Toggle right panel
- Command palette (`⌘K` / `⌘/`)

### Center (document metadata, read-only display)
- Current filename
- Output mode badge (Teacher / Student / Minimal)
- Validation status badge (OK / WARN / ERROR)

### Right edge
- Settings icon (opens Settings modal)
- Theme quick-toggle (shortcut to Settings → General; keep for discoverability)
- Language quick-toggle (same)

### Behaviour
- All buttons are **icon-only** with tooltip (label + shortcut).
- Groups are separated by visible dividers.
- On narrow viewports the center metadata collapses to filename only.

---

## 4. Left Panel — Template Explorer

Analogous to VS Code's Explorer sidebar.

### Responsibility
"What diagram do I want to draw?"

### Content
- Search bar (templates, tags, description)
- Category tree (Physics → Mechanics / Electromagnetism, Circuits, …)
- Template cards (title, description, tag chips)

### Does NOT contain
- App settings
- Export actions
- Inspector properties

### Collapse
- Collapses leftward; canvas fills the space.
- Toggle via View group in Top Bar or keyboard shortcut.

---

## 5. Canvas Workspace

### Canvas Header
- Diagram title
- Canvas metadata: width × height · element count · zoom %

### Canvas Toolbar

Three visually distinct groups separated by gaps:

#### Tool group (mutually exclusive mode, use segmented control)
- Select (`S`)
- Pan (`Space` hold / `H`)

#### View group
- Zoom in (`+`)
- Zoom out (`-`)
- Fit (`0`)
- Zoom % display (click to reset to 100%)

#### Overlay group (independent toggles)
- Grid (`G`)
- Labels (`L`)
- Vectors (`V`)

**All toolbar buttons are icon-only with tooltip.**

### Placeholder / disabled state
Buttons for features not yet implemented (Zoom, Fit, Grid) must be either:
- **Disabled** with `Coming soon` tooltip, or
- **Implemented** at minimum viable level (preferred)

False affordance (clickable but no effect) is worse than disabled.

### Summary cards (below toolbar)
Three info cards in a row:
- Template: name + hint
- Mode: current interaction mode
- Validation: OK / errors summary

---

## 6. Right Panel — Inspector

### Responsibility
"What are the properties of the current document / selection?"

### Tabs
| Tab | Contents |
|---|---|
| **Properties** | Diagram parameters (field type, charge, analysis scenario, etc.) and output mode (Teacher/Student/Minimal) |
| **IR** | Editable IR JSON with syntax highlighting, line numbers, Format / Apply / Reset actions |
| **SVG** | Read-only SVG source (with optional "Edit (advanced)" toggle); monospace, syntax highlighted |
| **Validation** | Validation result cards with severity (SUCCESS / WARN / ERROR) and descriptions |
| **Export** | Export actions; future: filename template, format options |

### Does NOT contain
- App language preference
- App theme preference

### IR / SVG Editor requirements
Minimum viable code-editor experience:
- Monospace font
- Syntax highlighting (JSON for IR, XML for SVG)
- Line numbers
- Scrollable independently
- IR: editable; SVG: read-only by default

Recommended library: **CodeMirror 6** (lighter) or **Monaco** (VS Code parity).

### Collapse
- Collapses rightward; canvas fills the space.

---

## 7. Status Bar

Fixed to the bottom of the viewport. Always visible.

```
[ Ready ]  [ Select ]  [ 100% ]  [ 600×500 ]  [ ✓ OK ]  [ zh-TW ]  [ light ]
```

Fields (left to right):
- App status (Ready / Error)
- Active tool
- Zoom level
- Canvas dimensions
- Validation summary
- Current locale
- Current theme

---

## 8. Settings Modal

All app-level preferences live here. Accessible via the Settings icon in Top Bar.

### Sections
| Section | Contents |
|---|---|
| **General** | Language, Theme, UI density (comfortable / compact) |
| **Editor** | Default inspector tab, show tooltips, show shortcuts in tooltips |
| **Canvas** | Default grid on/off, snap, default zoom behavior |
| **Export** | Default SVG filename template, SVG formatting |
| **Shortcuts** | Viewable shortcut reference (future: customizable) |

---

## 9. Keyboard Shortcuts Strategy

### Layers
- **Global** (`Cmd+Shift+…`): File ops, palette, settings
- **Canvas-focused** (single key when canvas has focus): Tool modes, overlays, zoom
- **Inspector-focused** (`Enter`, `Escape`, `Cmd+S`): Apply IR, reset

### High-conflict keys to avoid
`Cmd+N`, `Cmd+O` conflict with browser new-tab / open-file on most platforms. Prefer:
- `Cmd+Shift+N` for New
- `Cmd+Shift+O` for Open
- Or route through Command Palette as primary entry

### Canvas single-key shortcuts (canvas focused)
| Key | Action |
|---|---|
| `S` | Select mode |
| `H` | Pan mode |
| `+` / `-` | Zoom in / out |
| `0` | Fit canvas |
| `G` | Toggle grid |
| `L` | Toggle labels |
| `V` | Toggle vectors |

### Shortcut matrix
Each shortcut should be documented with: scope, browser conflict risk, mobile relevance.

---

## 10. Command Palette

Entry: `⌘K` or `⌘/` (both should work).

### Spec
- Overlay with backdrop blur
- Search input pinned at top
- Result list scrolls independently
- Keyboard navigation: `↑` `↓` `Enter` `Esc`
- Results grouped: File · Export · View · Panels · Diagram · Templates
- Each result: label + detail + group + optional shortcut badge

### Future sigils
- `>` filter to commands only
- `@` filter to templates
- `#` filter to panels / tabs

---

## 11. Responsive / Mobile

Mobile gets a single-column layout with a bottom dock:

```
[ Templates ]  [ Inspector ]  [ Commands ]
```

Tapping a dock button opens a bottom sheet. The canvas occupies the full screen with the dock overlaid.

---

## 12. Resizable Panels (implementation phases)

### Phase 1 (near-term)
- Left panel: drag-to-resize width
- Right panel: drag-to-resize width
- Both: collapse / expand toggle

### Phase 2
- Persist panel widths in localStorage
- Collapse via keyboard shortcut

### Phase 3 (future)
- Undock panels as floating windows
- Full-screen canvas / focus mode (hide all panels and top bar)

---

## 13. Icon Library

Replace hand-crafted SVG icons with **Lucide React**.

Reasons: clean line style, mature React package, natural fit for modern IDE aesthetic, consistent sizing.

---

## 14. Design Tokens

| Token | Value |
|---|---|
| Radius sm | 6px |
| Radius md | 10px |
| Radius lg | 16px |
| Colour: structure | Slate |
| Colour: primary / action | Blue |
| Colour: success | Green |
| Colour: warning | Amber |
| Colour: error | Red |
| Font (code editors) | Monospace (system-ui-monospace / JetBrains Mono) |

---

## 15. v0.3 Implementation Priority

### P0 — Fix false affordance and information layer violations (do first)
1. Move language and theme out of Inspector → Settings modal
2. Toolbar: split into Tool / View / Overlay groups with visual gaps
3. Select / Pan → segmented control (mutually exclusive)
4. Zoom / Fit / Grid: implement minimum viable OR mark disabled
5. Fix status bar visibility (must be fixed at bottom, always visible)
6. Switch icon library to Lucide
7. Command palette: fix scroll, add keyboard navigation

### P1 — IDE shell completeness
1. Left panel resize + collapse
2. Right panel resize + collapse
3. IR / SVG: integrate CodeMirror 6 (syntax highlight, line numbers)
4. Settings modal (General + Editor sections minimum)
5. Top App Bar grouping and dividers
6. Toolbar tooltip with shortcut display

### P2 — Polish and power features
1. UI density toggle (comfortable / compact)
2. Full-screen canvas / focus mode
3. Panel width persistence
4. Command palette sigil filtering
5. Editable SVG advanced mode toggle
6. Shortcut conflict resolution and matrix
