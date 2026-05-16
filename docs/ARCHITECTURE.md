# Architecture

Graphite follows a strict `DiagramSpec-first` philosophy, prioritizing developer-friendly semantic definitions over visual-first authoring.

## The Deterministic Pipeline
The core design ensures that for a given input (parameters), the output (diagram) is always identical.

`Teacher Intent` -> `Parametric Template` -> `DiagramSpec (JSON)` -> `Validator` -> `Deterministic Renderer` -> `SVG/PDF/PNG`

## Core Modules
- **`packages/diagram-spec`**: The single source of truth. Defines the `DiagramSpec` schema and all `DiagramElement` types (Primitives: `line`, `circle`, `arrow`, `grid`, `coordinate-axis`, `function-curve`, `circuit-component`).
- **`packages/render-svg`**: The rendering engine. Maps `DiagramSpec` elements to SVG strings using stable geometry. Supports element-level `rotation` and `rotationCenter`.
- **`packages/templates`**: Domain-specific logic. Generates `DiagramSpec` based on parameters (e.g., `inclinedPlanePresets`, `chargedParticlePresets`). Uses a functional approach to preserve testability.
- **`packages/export`**: Handles rasterization (PNG) and PDF embedding of SVG diagrams.
- **`apps/web`**: The interactive editor platform built with React + Vite, providing real-time feedback and parameter adjustment.

## Design Principles

### 1. Atomic Primitives over Hardcoded Templates
While we use templates for high-frequency teaching scenarios, all templates must be composed of reusable, atomic primitives defined in `diagram-spec`. Avoid hardcoding geometry whenever possible; instead, define `LayoutPolicies`.

### 2. Physical Correctness Mandate
Physical laws take absolute precedence over aesthetic compromises.
- Vectors must reflect accurate scalar calculations (e.g., $mg \sin\theta$).
- Directionality (friction, field vectors, current flow) must be physically grounded.

### 3. Exam-Ready Aesthetic
The default output is optimized for high-school exams and worksheets.
- **Visuals**: Black-and-white, high-contrast, clean typography, standardized line weights.
- **Typography**: Optimized for Traditional Chinese (zh-TW) pedagogical terms.

### 4. Deterministic Output
The system must be testable. Every template modification must be verified by `golden tests` (visual regression) to prevent unexpected rendering shifts.
