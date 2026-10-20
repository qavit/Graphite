import type { DiagramEditIntent, DiagramSpec, Point } from '@graphite/diagram-spec';
import { applyDiagramEditIntent } from '@graphite/diagram-spec';
import type { ElementEdit, ElementEdits } from './types';

/**
 * Durable per-element visual overrides, stored as offsets from the *generated* geometry so
 * they stay meaningful when the template regenerates (e.g. the angle changes). The document
 * keeps template parameters + these small edits; there is no second full scene.
 */

const round = (n: number) => Math.round(n * 100) / 100;
const isZero = (p: Point | undefined) => !p || (p.x === 0 && p.y === 0);

/** Applies edits on top of a generated spec. Edits whose element is missing or of the wrong type are ignored. */
export function applyElementEdits(spec: DiagramSpec, edits: ElementEdits | undefined): DiagramSpec {
  if (!edits) return spec;
  let changed = false;
  const elements = spec.elements.map((el) => {
    const edit = edits[el.id];
    if (!edit) return el;
    if (el.type === 'force-vector' && edit.end) {
      changed = true;
      return { ...el, end: { x: round(el.end.x + edit.end.x), y: round(el.end.y + edit.end.y) } };
    }
    if (el.type === 'label' && edit.position) {
      changed = true;
      return { ...el, position: { x: round(el.position.x + edit.position.x), y: round(el.position.y + edit.position.y) } };
    }
    return el;
  });
  return changed ? { ...spec, elements } : spec;
}

/** Turns an absolute-point intent into an updated offset record, measured against the generated spec. */
export function recordEditIntent(base: DiagramSpec, edits: ElementEdits | undefined, intent: DiagramEditIntent): ElementEdits | undefined {
  const edited = applyDiagramEditIntent(base, intent);
  if (edited === base) return edits;
  const before = base.elements.find((el) => el.id === intent.elementId);
  const after = edited.elements.find((el) => el.id === intent.elementId);
  if (!before || !after) return edits;
  const next: ElementEdit = { ...(edits?.[intent.elementId] ?? {}) };
  if (before.type === 'force-vector' && after.type === 'force-vector') {
    next.end = { x: round(after.end.x - before.end.x), y: round(after.end.y - before.end.y) };
    if (isZero(next.end)) delete next.end;
  } else if (before.type === 'label' && after.type === 'label') {
    next.position = { x: round(after.position.x - before.position.x), y: round(after.position.y - before.position.y) };
    if (isZero(next.position)) delete next.position;
  }
  const merged = { ...(edits ?? {}) };
  if (Object.keys(next).length === 0) delete merged[intent.elementId];
  else merged[intent.elementId] = next;
  // Sorted keys keep the saved JSON canonical (byte-identical after a reload).
  const record: ElementEdits = {};
  for (const id of Object.keys(merged).sort()) record[id] = merged[id];
  return Object.keys(record).length === 0 ? undefined : record;
}

/** Ids of stored edits that no longer match an element of the matching type in the generated spec. */
export function listStaleEditIds(base: DiagramSpec, edits: ElementEdits | undefined): string[] {
  if (!edits) return [];
  return Object.keys(edits).filter((id) => {
    const el = base.elements.find((e) => e.id === id);
    const edit = edits[id];
    if (!el) return true;
    return !((el.type === 'force-vector' && edit.end) || (el.type === 'label' && edit.position));
  });
}

/** Parses untrusted JSON into a clean edits record (finite offsets only). */
export function sanitizeEdits(raw: unknown): ElementEdits | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const point = (value: unknown): Point | undefined => {
    if (!value || typeof value !== 'object') return undefined;
    const { x, y } = value as Record<string, unknown>;
    return typeof x === 'number' && Number.isFinite(x) && typeof y === 'number' && Number.isFinite(y) ? { x, y } : undefined;
  };
  const out: ElementEdits = {};
  for (const id of Object.keys(raw as object).sort()) {
    const value = (raw as Record<string, unknown>)[id] as Record<string, unknown> | null;
    if (!value || typeof value !== 'object') continue;
    const edit: ElementEdit = {};
    const end = point(value.end);
    const position = point(value.position);
    if (end && !isZero(end)) edit.end = end;
    if (position && !isZero(position)) edit.position = position;
    if (edit.end || edit.position) out[id] = edit;
  }
  return Object.keys(out).length ? out : undefined;
}
