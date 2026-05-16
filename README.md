# Graphite

Graphite is an open-core, vector-first STEM diagramming tool designed for educators. It transforms standard physics and math curriculum requirements into editable, exam-ready vector diagrams.

## Key Features
- **Deterministic Rendering**: Consistent SVG output based on semantically defined `DiagramSpec`.
- **Parametric Templates**: High-fidelity templates for Physics (Inclined Planes, Electromagnetism, Circuits) and Math (Functions, Coordinate Systems).
- **Exam-Ready Output**: Professional black-and-white print-ready output.
- **Export Pipeline**: High-resolution PNG and PDF generation.

## Getting Started
Graphite is a TypeScript monorepo using `npm workspaces`.

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Development**:
   ```bash
   npm run dev --workspace=@graphite/web
   ```

## Architecture
See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for technical design details.

## License
MIT
