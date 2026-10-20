import type { DiagramSpec, Point } from './types.js';

/** Neutral description of a direct-manipulation edit. Stage 0: force-vector end point only. */
export type DiagramEditIntent = {
  type: 'element/endpoint';
  elementId: string;
  endpoint: 'end';
  point: Point;
};

/** Pure, immutable edit. Unsupported or invalid intents return the input spec unchanged. */
export function applyDiagramEditIntent(spec: DiagramSpec, intent: DiagramEditIntent): DiagramSpec {
  if (intent.type !== 'element/endpoint' || intent.endpoint !== 'end') return spec;
  const { x, y } = intent.point ?? ({} as Point);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return spec;

  const index = spec.elements.findIndex((el) => el.id === intent.elementId);
  const target = spec.elements[index];
  if (!target || target.type !== 'force-vector') return spec;

  const elements = spec.elements.slice();
  elements[index] = { ...target, end: { x, y } };
  return { ...spec, elements };
}
