import { describe, it, expect } from 'vitest';
import { applyDiagramEditIntent, type DiagramEditIntent } from '../edit-intent';
import type { DiagramSpec } from '../types';

const vis = ['teacher', 'student', 'minimal'];
const make = () =>
  ({
    metadata: { title: 't' },
    canvas: { width: 100, height: 100, viewBox: [0, 0, 100, 100] },
    view: { mode: 'teacher', theme: 'exam-bw' },
    elements: [
      { id: 'force-a', type: 'force-vector', visibility: vis, start: { x: 10, y: 20 }, end: { x: 30, y: 40 }, forceName: 'mg', magnitude: '5 N', showMagnitude: true },
      { id: 'lbl', type: 'label', visibility: vis, position: { x: 5, y: 5 }, text: 'hi' },
      { id: 'box', type: 'box', visibility: vis, position: { x: 1, y: 1 }, width: 3, height: 3 },
    ],
  }) as unknown as DiagramSpec;
const end = (elementId: string, x: number, y: number): DiagramEditIntent => ({ type: 'element/endpoint', elementId, endpoint: 'end', point: { x, y } });
const pos = (elementId: string, x: number, y: number): DiagramEditIntent => ({ type: 'element/position', elementId, point: { x, y } });

describe('applyDiagramEditIntent', () => {
  it('moves only the force-vector end, immutably', () => {
    const spec = make();
    const snapshot = JSON.parse(JSON.stringify(spec));
    const next = applyDiagramEditIntent(spec, end('force-a', 80, 90));
    expect(spec).toEqual(snapshot);
    expect(next.elements[0]).toEqual({ ...make().elements[0], end: { x: 80, y: 90 } });
    expect(next.elements[1]).toBe(spec.elements[1]);
    expect(next.elements).not.toBe(spec.elements);
  });
  it('moves a label position', () => {
    const next = applyDiagramEditIntent(make(), pos('lbl', 7, 9));
    expect((next.elements[1] as any).position).toEqual({ x: 7, y: 9 });
    expect((next.elements[1] as any).text).toBe('hi');
  });
  it('ignores unknown ids, wrong types and non-finite points', () => {
    const spec = make();
    expect(applyDiagramEditIntent(spec, end('ghost', 1, 2))).toBe(spec);
    expect(applyDiagramEditIntent(spec, end('lbl', 1, 2))).toBe(spec);
    expect(applyDiagramEditIntent(spec, pos('force-a', 1, 2))).toBe(spec);
    expect(applyDiagramEditIntent(spec, pos('box', 1, 2))).toBe(spec);
    for (const bad of [NaN, Infinity, -Infinity]) {
      expect(applyDiagramEditIntent(spec, end('force-a', bad, 1))).toBe(spec);
      expect(applyDiagramEditIntent(spec, pos('lbl', 1, bad))).toBe(spec);
    }
  });
});
