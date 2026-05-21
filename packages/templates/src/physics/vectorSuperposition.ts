/**
 * Vector Superposition Template
 * Graphite Physics - Task 030 Template A
 *
 * Two field vectors from a common origin plus their resultant.
 */

import {
  DiagramSpec,
  ViewMode,
  DiagramElement,
  ArrowElement,
  LabelElement,
} from '@graphite/diagram-spec';

export interface VectorSuperpositionParams {
  labelLocale?: 'zh-TW' | 'en-US';
}

export function generateVectorSuperposition(
  _params: VectorSuperpositionParams = {},
  viewMode: ViewMode = 'teacher',
): DiagramSpec {
  const canvasWidth = 600;
  const canvasHeight = 500;

  // Common origin
  const ox = 300;
  const oy = 260;
  const length = 80;

  // F1: 45° from horizontal
  const angle1 = (45 * Math.PI) / 180;
  const f1x = length * Math.cos(angle1);
  const f1y = -length * Math.sin(angle1); // SVG y-axis is flipped

  // F2: 120° from horizontal
  const angle2 = (120 * Math.PI) / 180;
  const f2x = length * Math.cos(angle2);
  const f2y = -length * Math.sin(angle2);

  // Resultant
  const rx = f1x + f2x;
  const ry = f1y + f2y;

  const vis = (viewMode === 'teacher' ? ['teacher'] : ['teacher', 'student']) as ViewMode[];

  const elements: DiagramElement[] = [];

  // F1 arrow
  const f1: ArrowElement = {
    id: 'force-f1',
    type: 'arrow',
    visibility: [...vis],
    start: { x: ox, y: oy },
    end: { x: ox + f1x, y: oy + f1y },
    headSize: 8,
    style: { stroke: '#000', strokeWidth: 2 },
  };
  elements.push(f1);

  // F2 arrow
  const f2: ArrowElement = {
    id: 'force-f2',
    type: 'arrow',
    visibility: [...vis],
    start: { x: ox, y: oy },
    end: { x: ox + f2x, y: oy + f2y },
    headSize: 8,
    style: { stroke: '#000', strokeWidth: 2 },
  };
  elements.push(f2);

  // Resultant arrow (dashed in student mode)
  const resultArrow: ArrowElement = {
    id: 'force-result',
    type: 'arrow',
    visibility: [...vis],
    start: { x: ox, y: oy },
    end: { x: ox + rx, y: oy + ry },
    headSize: 10,
    style: {
      stroke: '#000',
      strokeWidth: 2.5,
      strokeDasharray: viewMode === 'student' ? '6,4' : undefined,
    },
  };
  elements.push(resultArrow);

  // Labels (teacher only)
  if (viewMode === 'teacher') {
    const labelF1: LabelElement = {
      id: 'label-f1',
      type: 'label',
      visibility: ['teacher'],
      position: { x: ox + f1x + 10, y: oy + f1y - 5 },
      text: 'F₁',
      fontSize: 14,
      anchor: 'start',
    };
    elements.push(labelF1);

    const labelF2: LabelElement = {
      id: 'label-f2',
      type: 'label',
      visibility: ['teacher'],
      position: { x: ox + f2x - 20, y: oy + f2y - 10 },
      text: 'F₂',
      fontSize: 14,
      anchor: 'end',
    };
    elements.push(labelF2);

    const labelResult: LabelElement = {
      id: 'label-f-result',
      type: 'label',
      visibility: ['teacher'],
      position: { x: ox + rx + 10, y: oy + ry + 5 },
      text: 'F_result',
      fontSize: 14,
      anchor: 'start',
    };
    elements.push(labelResult);
  }

  return {
    metadata: {
      version: '0.1',
      title: 'Vector Superposition',
      author: 'Graphite Physics Templates',
      locale: 'en-US',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    canvas: {
      width: canvasWidth,
      height: canvasHeight,
      viewBox: [0, 0, canvasWidth, canvasHeight],
      unit: 'px',
    },
    view: {
      mode: viewMode,
      theme: 'exam-bw',
    },
    elements,
  };
}
