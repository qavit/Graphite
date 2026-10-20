import type { DiagramSpec, ForceVectorElement, LabelElement } from '@graphite/diagram-spec';

/** Element types that Stage 0 allows the user to select on the canvas. */
const SELECTABLE_TYPES: ReadonlySet<string> = new Set(['force-vector', 'label']);

interface ClosestCapable {
  closest(selector: string): { getAttribute(name: string): string | null } | null;
}

function hasClosest(target: unknown): target is ClosestCapable {
  return typeof target === 'object' && target !== null && typeof (target as ClosestCapable).closest === 'function';
}

/**
 * Maps a pointer event target back to a selectable DiagramSpec element id.
 * The DOM only supplies a candidate id (hit testing); the spec decides whether
 * it is a real, selectable semantic element.
 */
export function resolveSelectableElementId(target: EventTarget | null, spec: DiagramSpec | null): string | null {
  if (!spec || !hasClosest(target)) return null;
  const id = target.closest('[data-element-id]')?.getAttribute('data-element-id');
  if (!id) return null;
  const element = spec.elements.find((el) => el.id === id);
  return element && SELECTABLE_TYPES.has(element.type) ? id : null;
}

export type SelectableElement = ForceVectorElement | LabelElement;

/** Look up the currently selected element in the spec (null if gone or not selectable). */
export function findSelectedElement(spec: DiagramSpec | null, selectedId: string | null): SelectableElement | null {
  if (!spec || !selectedId) return null;
  const el = spec.elements.find((e) => e.id === selectedId);
  return el && (el.type === 'force-vector' || el.type === 'label') ? el : null;
}
