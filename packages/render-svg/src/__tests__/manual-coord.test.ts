import { expect, it } from 'vitest';
import { renderToSVG } from '../renderer';
import { DiagramSpec } from '@graphite/diagram-spec';

it('renders a coordinate system with a quadratic curve', () => {
  const spec: DiagramSpec = {
    metadata: { version: '0.1', title: 'Manual Test', author: 'Test', locale: 'zh-TW', createdAt: '2026-05-16', updatedAt: '2026-05-16' },
    canvas: { width: 600, height: 500, viewBox: [0, 0, 600, 500] },
    view: { mode: 'teacher', theme: 'exam-bw' },
    elements: [
      {
        id: 'grid',
        type: 'grid',
        visibility: ['teacher'],
        xMin: 0, xMax: 600, yMin: 0, yMax: 500, stepX: 50, stepY: 50,
        style: { stroke: '#ddd', strokeWidth: 1 }
      },
      {
        id: 'curve',
        type: 'function-curve',
        visibility: ['teacher'],
        samples: Array.from({ length: 51 }, (_, i) => {
          const x = i * 12; // 0..600 in steps of 12
          return { x, y: (x - 300) ** 2 / 1000 + 100 };
        }),
      }
    ]
  };

  const svg = renderToSVG(spec);
  console.log(svg); // 這會印出 SVG 代碼
  expect(svg).toContain('polyline');
});
