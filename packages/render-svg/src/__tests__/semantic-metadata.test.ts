import { describe, expect, it } from 'vitest';
import type { DiagramSpec } from '@graphite/diagram-spec';
import { renderToSVG } from '../renderer';

const spec: DiagramSpec = {
  metadata: { version: '0.1', title: 'semantic-types', locale: 'en-US', createdAt: '', updatedAt: '' },
  canvas: { width: 100, height: 100, viewBox: [0, 0, 100, 100] },
  view: { mode: 'teacher', theme: 'exam-bw' },
  elements: [
    { id: 'a1', type: 'arrow', visibility: ['teacher'], start: { x: 0, y: 0 }, end: { x: 10, y: 0 } },
    { id: 'f1', type: 'force-vector', visibility: ['teacher'], start: { x: 0, y: 10 }, end: { x: 10, y: 10 }, forceName: 'F', showMagnitude: false },
  ],
};

describe('semantic SVG metadata', () => {
  it('preserves arrow and force-vector element types', () => {
    const svg = renderToSVG(spec);
    expect(svg).toContain('data-element-id="a1" data-element-type="arrow"');
    expect(svg).toContain('data-element-id="f1" data-element-type="force-vector"');
  });
});
