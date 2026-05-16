# Graphite Teacher Workbench: UI/UX Design Specification

## Overview
Graphite is a teacher-first, vector-first STEM diagramming workbench. It emphasizes a deterministic pipeline (`Template -> IR -> Renderer -> SVG`) that enables both ease-of-use for general teachers and deep control for advanced users.

## 1. Information Architecture (Three-Column Layout)
Graphite adopts a professional workbench layout reminiscent of modern design tools (e.g., Figma) and office suites (e.g., Word).

```text
┌──────────────────────────────────────────────────────────────┐
│ Top Bar: File, Mode, Export, Localization, Theme, Help       │
├───────────────┬──────────────────────────────┬───────────────┤
│ Left Panel    │ Canvas / Preview             │ Right Panel   │
│ Templates     │ WYSIWYG Workspace            │ Properties    │
│ Elements      │ Zoom / Pan / Select / Grid   │ IR / SVG / Log│
│ Parameters    │                              │ Validation    │
└───────────────┴──────────────────────────────┴───────────────┘
```

## 2. Key Components
*   **Top Bar (Global Operations):** File management, view modes, export triggers, localization toggle, theme switching, and help resources.
*   **Left Panel (Template Library):** Hierarchical template navigation, category filtering, element libraries, and search functionality.
*   **Central Canvas (Focus Area):** Interactive preview, zoom/pan controls, grid management, and layer modes (Teacher/Student/Exam).
*   **Right Panel (Inspector):** Context-aware tabs:
    *   **Properties:** Form-based editing for selected templates or elements.
    *   **IR:** Semantic JSON representation editor with validation.
    *   **SVG:** Read-only generated code output.
    *   **Validation:** Physics semantic checks (e.g., consistency, geometric bounds).

## 3. Design Principles
*   **Modern & Silent:** Clean typography, generous whitespace (similar to Claude/ChatGPT), and a focus on diagram content.
*   **Responsive Workbench:** Desktop (three-column) vs. Mobile (single-column with bottom sheets/drawers).
*   **Teacher-Centric:** Intuitive workflows (Teacher/Student/Exam modes) to reduce the cognitive load for educators.
*   **Determinism:** Clear visual feedback on the state: `Template -> IR Valid -> SVG Rendered -> Ready`.

## 4. Visual Tokens
*   **Radius:** `sm: 6px`, `md: 10px`, `lg: 16px`
*   **Color Palette:** Slate (structure), Blue (primary/actions), Green (success), Amber (warnings).

## 5. Technical Stack Considerations
*   **RWD:** Vanilla CSS Grid/Flexbox for mobile drawer integration.
*   **I18n:** `locales/en.json`, `locales/zh-TW.json`.
*   **Command Palette:** Accessible via `⌘/`.
