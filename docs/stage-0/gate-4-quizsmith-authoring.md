# Stage 0 · Gate 4 — QuizSmith teacher-authoring consumer

## The real case
`QuizSmith/curriculum/physics/handouts/legacy/newton-second-law-bilingual-figures.md` lists **F03 / E04 / E05** (incline free-body figures, forces W, N, T, f) as planned SVGs, status "未生成". Today the maintained path is TikZ (`physics-figure` skill: write coordinates → compile → view PNG → repeat) or AI-generated SVG prompts. The benchmark figure is the F03 left panel: *rough incline at 37°, block, W, N, f*. (T is not in the Graphite template, see gaps.)

## Benchmark (template → exported figure)
Measured in this session, tool time only (not a human stopwatch):

| Step | Result |
|---|---|
| Pick inclined/friction, set 37° | 1 action |
| Move 3 overlapping labels (θ, N, f) by drag | 3 drags; first attempt put θ on the ground line and a drag put a label outside the canvas (clipped) — both caught visually and corrected |
| Export SVG (download) | 1 click; no `graphite-hit/handle/selected` in output |
| SVG → PDF (`rsvg-convert`) → `\includegraphics` in xelatex | works, no manual SVG edit |
| Total | ≈1 min of tool time for the first pass, ≈3 min including the θ-label correction and PDF check. A human number is **not** measured; the ≤5 min target is plausible, not proven. |

## Blockers found and fixed (only these)
1. **Label overlap** (θ crossing the incline, f label touching N label) → drag labels (`element/position` intent; renderer now tags labels with `data-element-id`).
2. **Endpoint placement** was already available from Stage 0A-2 and is now persistent.

## Durable authoring design
`WorkbenchDocument.edits?: Record<elementId, { end?: {x,y}; position?: {x,y} }>` — **offsets from the generated geometry**, omitted when empty. Document = template parameters + small overrides; the final spec is `applyElementEdits(buildBaseDiagramSpec(doc), doc.edits)`. No second scene graph; the earlier session-only override was removed.

| Concern | Behaviour (tested in `edits.test.ts`) |
|---|---|
| Stable identity | ids come from the template (`force-weight`, `label-normal`, …) |
| Regeneration (angle change) | offsets are kept and re-applied to the new geometry |
| Template type change | edits cleared (ids only mean something inside one template) |
| Stale override (element gone/wrong type) | ignored in output, counted and shown in the Inspector, never crashes |
| Hidden labels (Labels toggle off) | edits kept |
| Reset | "Reset all edits" removes `edits`; JSON returns byte-identical to an unedited document |
| Reproducible JSON | keys sorted, offsets rounded to 0.01; JSON → reload → serialize is identical |
| JSON and SVG agree | `saved-figure.test.ts` regenerates the browser-exported SVG **byte-for-byte** from the saved JSON (`docs/stage-0/evidence/`) |
| Untrusted input | non-finite / malformed edits dropped on load |

## Is it meaningfully better than the manual/TikZ path?
**Conditionally yes, for iteration; no, for completeness.**
- Better: a standard incline figure exists in seconds, label collisions are fixed by dragging instead of re-editing coordinates and recompiling, the result is a reproducible JSON+SVG pair.
- Not yet: the template has **no tension T** (F03 needs it), no angle arc, 12px labels are small at 0.5\linewidth, labels sit far from their arrows, and `θ`/`N`/`f` text is not LaTeX (mixed fonts in a LaTeX handout). Friction label text "f = mg sin θ" is a physics claim valid only in equilibrium.

## Findings
- Moving a label outside the canvas clips it silently (validation did warn, "review points need attention"); a clamp is an obvious but unbuilt need.
- `label` text is interpolated unescaped into SVG.
- Offsets are a bet: they suit label nudges; for force tips on a changed angle an offset may no longer mean what the teacher intended. Not exercised beyond the unit test.
