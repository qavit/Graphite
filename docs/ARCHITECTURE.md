# Architecture

Graphite follows a strict `DiagramSpec-first` philosophy.

## Pipeline
`Teacher Intent` -> `Template Generator` -> `DiagramSpec (JSON)` -> `Validator` -> `Deterministic Renderer` -> `SVG/PDF/PNG`

## Core Modules
- **`packages/diagram-spec`**: The single source of truth for the data model. Defines all `DiagramElement` types.
- **`packages/render-svg`**: Deterministic engine that maps `DiagramSpec` to SVG strings.
- **`packages/templates`**: Domain-specific logic that generates `DiagramSpec` based on parameters.
- **`packages/export`**: Pipeline for rasterizing and embedding diagrams.
- **`apps/web`**: React-based interactive editor and preview platform.

## Design Principles
- **Semantic Components**: Use atomic primitives (Grid, Arrow, Vector) over fixed hardcoded templates.
- **Physical Correctness**: Physical laws (e.g., force vector scaling) take precedence over aesthetics.
- **Exam-Ready**: Default to black-and-white, high-contrast, professional typography.
