# Stage 0 · Gate 5 — Cross-consumer closeout

Evidence base: Graphite PRs #2–#5, `qavit/kakau-lab#20` (draft), the Gate 2 and Gate 4 notes. Nothing here involved a real teacher or learner session; "works" means engineering evidence, not pedagogical validation.

## Capability matrix

| Capability | Kakau Lab FBD | QuizSmith (incline figure) |
|---|---|---|
| Stable semantic id | Lab's own force ids become element ids (`force-1`); stable by construction | Template ids (`force-weight`, `label-normal`); stable within a template type, cleared on type change |
| Selection | Works; Lab validates the clicked id against **its own** state, not Graphite's spec | Works for force-vector and label; validated against the generated spec |
| Endpoint manipulation | Works, reinterpreted by Lab as **direction only** (length/anchor fixed, y-up normalisation) | Works as a literal move of the tip; label move added |
| Consumer-specific semantics | Entire physics layer (normalise, zero-length, magnitude, interaction identity, reference isolation) lives in Lab's adapter | Persistence (offset overrides), stale handling, export pipeline |
| Persistence need | None (state is Lab's `FbdLabState`; Graphite output is derived each render) | Required; solved with optional per-element offsets in the document |
| Export | Not needed for learning flow | SVG → PDF → LaTeX works; reproduced byte-for-byte from saved JSON |
| Accessibility | Handle has an aria-label; slider/buttons kept as fallback (tested); no keyboard dragging | None added beyond handle aria-label; no keyboard editing |

## What is genuinely shared
- `DiagramSpec` types (geometry-only vocabulary) and the deterministic `renderToSVG` — both consumers rendered through them with no change to the renderer.
- Semantic identity via `data-element-id/type` and "validate the DOM candidate against a semantic source".
- Neutral edit intent + pure immutable `applyDiagramEditIntent` (now in `@graphite/diagram-spec`).
- Pointer → spec coordinate via `getScreenCTM` (identical in both; **Lab re-implemented it**, ~60 lines, because it is still in the Workbench app).

## Consumer-specific (must stay out of Graphite)
- FBD: direction normalisation, fixed length, magnitude, interaction/agent identity, commit/compare/revise, canonical-answer isolation.
- QuizSmith: durable override schema, label placement, the authoring/export workflow, template content (no tension T yet).

## Rejected abstractions
- A generic scene graph / second canonical document (both consumers have a better source of truth already).
- A generic constraint engine (FBD's "fixed length" is two lines in the adapter).
- Importing the Workbench UI into Lab (Lab only needed render + intent + pointer mapping).
- Git-dependency or source-copy consumption (Gate 2).
- Storing absolute edited geometry (offsets chosen; absolute would rot on regeneration).

## Costs and risks
- Packaging: two packages need publishing, a registry/scope decision, a licence change and a version policy before Lab can merge (Lab PR is a draft with local tarballs).
- Renderer rough edges seen by consumers: literal black/white (Lab needed CSS overrides), marker size scales with stroke width, unescaped `label` text, no canvas clamp (a dragged label can be clipped).
- Interaction primitives are duplicated until extracted; extraction is small but unscheduled.
- Offsets for force tips under large angle changes are unproven.
- Lab's FBD has only the horizontal-table scenario; the "incline FBD" learner case is untested.
- Value for FBD is plausible (one gesture instead of a slider) but unmeasured with learners; the QuizSmith ≤5 min target is unmeasured with a human.

## Recommendation: **NARROW**

Keep Graphite as (1) the QuizSmith teacher-authoring tool (templates + Workbench + durable edits), where it already beats the TikZ iteration loop for standard figures, and (2) a **small published core**: `diagram-spec` types, `render-svg`, the neutral edit intent and a pointer→spec helper, so Lab and other consumers can render and edit through one spec. Do **not** position it as a general drawing or FBD platform: Lab's value came from its own domain layer, and Graphite contributed rendering, identity and a gesture primitive.

Suggested next scope (owner's call, not started): decide registry/scope/licence; extract the pointer helper; add tension T to the incline template; measure one real teacher timing; fix renderer theming/escaping.
