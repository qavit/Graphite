import { renderToSVG } from '@graphite/render-svg';
import { generateInclinedPlane, inclinedPlanePresets } from '@graphite/templates';
import { generateChargedParticleMotion, chargedParticlePresets } from '@graphite/templates';
import { DiagramSpec } from '@graphite/diagram-spec';
import fs from 'fs';
import path from 'path';

// 1. Inclined Plane (Friction variant)
const spec1 = generateInclinedPlane(inclinedPlanePresets.teacherWithFriction(30), 'teacher');
fs.writeFileSync('demo-inclined-friction.svg', renderToSVG(spec1));

// 2. Charged Particle (Magnetic, into-page, detailed)
const spec2 = generateChargedParticleMotion(chargedParticlePresets.magneticDetailed(), 'teacher');
fs.writeFileSync('demo-magnetic-motion.svg', renderToSVG(spec2));

// 3. Quadratic Function (using our Grid/Axis framework)
const spec3: DiagramSpec = {
  metadata: { version: '0.1', title: 'Secondary Function', author: 'Test', locale: 'zh-TW', createdAt: '2026-05-16', updatedAt: '2026-05-16' },
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
      fn: (x: number) => 500 - ((x - 300) ** 2 / 100 + 100),
      domain: [100, 500],
      points: 50
    }
  ]
};
fs.writeFileSync('demo-quadratic.svg', renderToSVG(spec3));

console.log('Demos generated: demo-inclined-friction.svg, demo-magnetic-motion.svg, demo-quadratic.svg');
