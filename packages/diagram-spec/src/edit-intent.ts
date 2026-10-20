import type { DiagramSpec, Point } from './types.js';

/** Neutral description of a direct-manipulation edit. Stage 0: force-vector end point and label position. */
export type DiagramEditIntent =
  | { type: 'element/endpoint'; elementId: string; endpoint: 'end'; point: Point }
  | { type: 'element/position'; elementId: string; point: Point };

/** Pure, immutable edit. Unsupported or invalid intents return the input spec unchanged. */
export function applyDiagramEditIntent(spec: DiagramSpec, intent: DiagramEditIntent): DiagramSpec {
  const { x, y } = intent.point ?? ({} as Point);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return spec;

  const index = spec.elements.findIndex((el) => el.id === intent.elementId);
  const target = spec.elements[index];
  if (!target) return spec;

  const elements = spec.elements.slice();
  if (intent.type === 'element/endpoint' && intent.endpoint === 'end' && target.type === 'force-vector') {
    elements[index] = { ...target, end: { x, y } };
  } else if (intent.type === 'element/position' && target.type === 'label') {
    elements[index] = { ...target, position: { x, y } };
  } else {
    return spec;
  }
  return { ...spec, elements };
}
