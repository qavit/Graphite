# Graphite v0.2 Task Planning: Workbench Implementation

This document outlines the roadmap to refactor Graphite from v0.1 (simple preview) to v0.2 (professional teacher workbench).

## Phase 1: Workbench Scaffold (Infrastructure)
1. **App Shell Refactor**: Replace the single-page layout with a 3-column CSS Grid layout (TopBar, LeftSidebar, Workspace, RightInspector, StatusBar).
2. **Global State Management**: Introduce a robust state management approach to handle:
    - Active template & parameters
    - Current ViewMode (Teacher/Student/Exam)
    - Active Right Panel Tab
    - UI Theme & Locale.
3. **I18n & Theme Injection**: Implement dual-locale and dark/light theme support using CSS variables.

## Phase 2: Core Workbench Features
4. **Template Library (Left Sidebar)**:
    - Implement hierarchical template navigation (Physics, Chemistry, Math, Circuit).
    - Add search functionality with debounce.
    - Style as interactive cards with thumbnails.
5. **Right Inspector Panel**:
    - Build tabbed interface: Properties, IR (JSON), SVG, Validation, Export.
    - Integrate `Properties` with existing template parameters.
    - Implement `IR` editor using a basic code-friendly component with validation.
    - Implement `SVG` read-only preview.
6. **Canvas Toolbar (Central Area)**:
    - Add toolset: Select, Pan, Zoom (+/-), Fit, Grid toggle, Label/Vector overlays.

## Phase 3: Semantic & UX Refinements
7. **Semantic Validation Engine**:
    - Define validation rule structure in `packages/diagram-spec`.
    - Implement physics-aware checks (e.g., bounds, label overlaps).
    - Display results in the Validation tab.
8. **Command Palette**:
    - Implement `⌘/` overlay.
    - Map basic actions (Export, Toggle Mode, Change Theme).
9. **Responsive Polish (RWD)**:
    - Adapt layout for mobile devices (Bottom sheets for sidebars).

## Phase 4: Verification & Release
10. **Visual Regression**: Update golden tests to match new workbench components.
11. **Production Build**: Verify minified build size and absence of development-only dependencies.
12. **Final Polish**: Refine spacing and transitions for a "Modern & Silent" feel.

---
*Task Priority: Follow the order above, unless specified otherwise by the human architect.*
