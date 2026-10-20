import { describe, it, expect } from 'vitest';
import { renderToSVG } from '@graphite/render-svg';
import { buildBaseDiagramSpec, buildDiagramSpec, createDefaultDocument, loadDocumentFromUnknown, readSvgFromSpec, serializeDocument } from '../document';
import { applyElementEdits, listStaleEditIds, recordEditIntent, sanitizeEdits } from '../edits';
import { createWorkbenchState, workbenchReducer } from '../reducer';
import type { WorkbenchDocument } from '../types';

const incline = (angle = 37): WorkbenchDocument => ({ ...createDefaultDocument(), template: { type: 'inclined', angle, scenario: 'friction' } });
const el = (spec: ReturnType<typeof buildDiagramSpec>, id: string) => spec.elements.find((e) => e.id === id) as any;

describe('durable element edits', () => {
  it('records an absolute intent as an offset from the generated geometry', () => {
    const base = buildBaseDiagramSpec(incline());
    const target = el(base, 'force-weight');
    const edits = recordEditIntent(base, undefined, { type: 'element/endpoint', elementId: 'force-weight', endpoint: 'end', point: { x: target.end.x + 12.345, y: target.end.y - 7 } });
    expect(edits).toEqual({ 'force-weight': { end: { x: 12.35, y: -7 } } });
  });

  it('applies edits to the generated spec and leaves untouched elements identical', () => {
    const doc = { ...incline(), edits: { 'force-weight': { end: { x: 20, y: 0 } } } };
    const base = buildBaseDiagramSpec(doc);
    const spec = buildDiagramSpec(doc);
    expect(el(spec, 'force-weight').end.x).toBeCloseTo(el(base, 'force-weight').end.x + 20, 2);
    expect(el(spec, 'force-weight').start).toEqual(el(base, 'force-weight').start);
    expect(spec.elements.find((e) => e.id === 'incline')).toEqual(base.elements.find((e) => e.id === 'incline'));
  });

  it('saved document reproduces the edited SVG exactly after a JSON round trip', () => {
    let state = createWorkbenchState();
    state = workbenchReducer(state, { type: 'document/reset', document: incline() });
    const base = buildBaseDiagramSpec(state.document);
    const label = base.elements.find((e) => e.type === 'label') as any;
    state = workbenchReducer(state, { type: 'document/editIntent', intent: { type: 'element/position', elementId: label.id, point: { x: label.position.x + 30, y: label.position.y - 20 } } });
    state = workbenchReducer(state, { type: 'document/editIntent', intent: { type: 'element/endpoint', elementId: 'force-normal', endpoint: 'end', point: { x: 200, y: 100 } } });
    const json = serializeDocument(state.document);
    const reloaded = loadDocumentFromUnknown(JSON.parse(json));
    const svg = readSvgFromSpec(buildDiagramSpec(state.document));
    expect(readSvgFromSpec(buildDiagramSpec(reloaded))).toBe(svg);
    expect(serializeDocument(reloaded)).toBe(json);
    expect(svg).not.toBe(readSvgFromSpec(buildBaseDiagramSpec(state.document)));
    expect(svg).not.toMatch(/graphite-(hit|handle|selected)/);
  });

  it('documents without edits serialize exactly as before', () => {
    expect(serializeDocument(createDefaultDocument())).not.toContain('edits');
    expect(serializeDocument(loadDocumentFromUnknown(JSON.parse(serializeDocument(createDefaultDocument()))))).not.toContain('edits');
  });

  it('keeps offsets across a parameter change (angle) and renders deterministically', () => {
    const doc = { ...incline(30), edits: { 'force-weight': { end: { x: 25, y: 0 } } } };
    const next = { ...doc, template: { ...doc.template, angle: 45 } as WorkbenchDocument['template'] };
    expect(el(buildDiagramSpec(next), 'force-weight').end.x).toBeCloseTo(el(buildBaseDiagramSpec(next), 'force-weight').end.x + 25, 2);
    expect(renderToSVG(buildDiagramSpec(next))).toBe(renderToSVG(buildDiagramSpec(next)));
  });

  it('edits are cleared when the template type changes and by reset', () => {
    let state = workbenchReducer(createWorkbenchState(), { type: 'document/reset', document: { ...incline(), edits: { 'force-weight': { end: { x: 5, y: 5 } } } } });
    const sameType = workbenchReducer(state, { type: 'document/template', template: { type: 'inclined', angle: 50, scenario: 'advanced' } });
    expect(sameType.document.edits).toBeDefined();
    const other = workbenchReducer(state, { type: 'document/template', template: { type: 'circuit', preset: 'seriesFull' } });
    expect(other.document.edits).toBeUndefined();
    const reset = workbenchReducer(state, { type: 'document/resetEdits' });
    expect(reset.document.edits).toBeUndefined();
    expect(serializeDocument(reset.document)).toBe(serializeDocument(incline()));
  });

  it('stale edits (removed element, wrong type) are ignored, reported, and untrusted input is sanitized', () => {
    const base = buildBaseDiagramSpec(incline());
    const edits = { ghost: { end: { x: 1, y: 1 } }, incline: { end: { x: 1, y: 1 } }, 'force-weight': { end: { x: 3, y: 4 } } };
    expect(listStaleEditIds(base, edits).sort()).toEqual(['ghost', 'incline']);
    expect(applyElementEdits(base, { ghost: { end: { x: 1, y: 1 } } })).toBe(base);
    expect(sanitizeEdits({ a: { end: { x: NaN, y: 1 } }, b: { end: { x: 1, y: 'z' } }, c: 'x', d: { position: { x: 2, y: 3 } }, e: { end: { x: 0, y: 0 } } })).toEqual({ d: { position: { x: 2, y: 3 } } });
    expect(sanitizeEdits([1, 2])).toBeUndefined();
  });

  it('hidden labels keep their edits (toggling labels does not lose work)', () => {
    const doc = incline();
    const hidden = { ...doc, canvas: { ...doc.canvas, showLabels: false } };
    const label = buildBaseDiagramSpec(doc).elements.find((e) => e.type === 'label')!;
    const edits = { [label.id]: { position: { x: 4, y: 4 } } };
    expect(listStaleEditIds(buildBaseDiagramSpec(doc), edits)).toEqual([]);
    expect(buildDiagramSpec({ ...hidden, edits }).elements.some((e) => e.id === label.id)).toBe(false);
    expect(buildDiagramSpec({ ...doc, edits }).elements.find((e) => e.id === label.id)).toBeDefined();
  });
});
