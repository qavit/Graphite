import { describe, it, expect } from 'vitest';
import type { DiagramSpec } from '@graphite/diagram-spec';
import { renderToSVG } from '@graphite/render-svg';
import { applyDiagramEditIntent, resolveDisplaySpec, specKey } from '../interaction';

const vis = ['teacher', 'student', 'minimal'];
const make = () =>
  ({
    version: '1.0',
    metadata: { title: 't' },
    canvas: { width: 100, height: 100, viewBox: [0, 0, 100, 100] },
    view: { mode: 'teacher', theme: 'light' },
    elements: [
      { id: 'force-a', type: 'force-vector', visibility: vis, start: { x: 10, y: 20 }, end: { x: 30, y: 40 }, forceName: 'mg', magnitude: '5 N', showMagnitude: true },
      { id: 'lbl', type: 'label', visibility: vis, position: { x: 5, y: 5 }, text: 'hi' },
      { id: 'box', type: 'box', visibility: vis, position: { x: 1, y: 1 }, width: 3, height: 3 },
    ],
  }) as unknown as DiagramSpec;

const edit = (elementId: string, x: number, y: number) =>
  ({ type: 'element/endpoint', elementId, endpoint: 'end', point: { x, y } }) as const;

describe('applyDiagramEditIntent', () => {
  it('moves only the end point', () => {
    const next = applyDiagramEditIntent(make(), edit('force-a', 80, 90));
    expect(next.elements[0]).toEqual({ ...make().elements[0], end: { x: 80, y: 90 } });
    expect((next.elements[0] as any).start).toEqual({ x: 10, y: 20 });
  });

  it('is immutable', () => {
    const spec = make();
    const snapshot = JSON.parse(JSON.stringify(spec));
    const next = applyDiagramEditIntent(spec, edit('force-a', 80, 90));
    expect(spec).toEqual(snapshot);
    expect(next).not.toBe(spec);
    expect(next.elements).not.toBe(spec.elements);
    expect(next.elements[0]).not.toBe(spec.elements[0]);
    expect(next.elements[1]).toBe(spec.elements[1]);
  });

  it('ignores unknown ids', () => {
    const spec = make();
    expect(applyDiagramEditIntent(spec, edit('ghost-force', 1, 2))).toEqual(make());
  });

  it('ignores unsupported element types', () => {
    expect(applyDiagramEditIntent(make(), edit('lbl', 1, 2))).toEqual(make());
    expect(applyDiagramEditIntent(make(), edit('box', 1, 2))).toEqual(make());
  });

  it('ignores non-finite coordinates', () => {
    for (const bad of [NaN, Infinity, -Infinity]) {
      expect(applyDiagramEditIntent(make(), edit('force-a', bad, 5))).toEqual(make());
      expect(applyDiagramEditIntent(make(), edit('force-a', 5, bad))).toEqual(make());
    }
  });

  it('edited spec renders the new endpoint deterministically', () => {
    const next = applyDiagramEditIntent(make(), edit('force-a', 80, 90));
    expect(renderToSVG(next)).toContain('x2="80" y2="90"');
    expect(renderToSVG(next)).toBe(renderToSVG(next));
  });
});

describe('resolveDisplaySpec', () => {
  it('uses the override only while the generated source is unchanged', () => {
    const generated = make();
    const override = { baseKey: specKey(generated), spec: applyDiagramEditIntent(generated, edit('force-a', 80, 90)) };
    expect(resolveDisplaySpec(make(), override)).toBe(override.spec);
    const changed = make();
    (changed.elements[0] as any).end = { x: 99, y: 99 };
    expect(resolveDisplaySpec(changed, override)).toBe(changed);
    expect(resolveDisplaySpec(null, override)).toBeNull();
  });
});
