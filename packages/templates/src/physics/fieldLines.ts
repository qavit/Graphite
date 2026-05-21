/**
 * Electric Field Lines Template
 * Graphite Physics - Task 030 Template B
 *
 * 8 radial lines from a central point charge, with charge sign control.
 */

import {
  DiagramSpec,
  ViewMode,
  DiagramElement,
  ArrowElement,
  CircleElement,
  LabelElement,
} from '@graphite/diagram-spec';

export interface FieldLinesParams {
  chargeSign: 'positive' | 'negative';
  labelLocale?: 'zh-TW' | 'en-US';
}

export function generateFieldLines(
  params: FieldLinesParams,
  viewMode: ViewMode = 'teacher',
): DiagramSpec {
  const { chargeSign } = params;
  const canvasWidth = 600;
  const canvasHeight = 500;

  const cx = 300;
  const cy = 250;
  const lineRadius = 180;
  const circleRadius = 18;
  const numLines = 8;

  const elements: DiagramElement[] = [];

  // Central charge circle
  const chargeCircle: CircleElement = {
    id: 'charge-circle',
    type: 'circle',
    visibility: ['teacher', 'student', 'minimal'],
    center: { x: cx, y: cy },
    radius: circleRadius,
    label: chargeSign === 'positive' ? '+' : '−',
    style: { stroke: '#000', strokeWidth: 2, fill: '#fff' },
  };
  elements.push(chargeCircle);

  // 8 radial field lines
  for (let i = 0; i < numLines; i++) {
    const angleDeg = i * (360 / numLines);
    const angleRad = (angleDeg * Math.PI) / 180;

    const innerR = circleRadius + 4;
    const fromX = cx + innerR * Math.cos(angleRad);
    const fromY = cy + innerR * Math.sin(angleRad);
    const toX = cx + lineRadius * Math.cos(angleRad);
    const toY = cy + lineRadius * Math.sin(angleRad);

    const arrow: ArrowElement = {
      id: `field-line-${i}`,
      type: 'arrow',
      visibility: ['teacher', 'student', 'minimal'],
      start: chargeSign === 'positive' ? { x: fromX, y: fromY } : { x: toX, y: toY },
      end: chargeSign === 'positive' ? { x: toX, y: toY } : { x: fromX, y: fromY },
      headSize: 7,
      style: { stroke: '#000', strokeWidth: 1.5 },
    };
    elements.push(arrow);
  }

  // Label for charge (teacher only, unless minimal)
  if (viewMode !== 'minimal' && viewMode !== 'student') {
    const chargeLabel: LabelElement = {
      id: 'label-charge',
      type: 'label',
      visibility: ['teacher'],
      position: { x: cx, y: cy + circleRadius + 22 },
      text: chargeSign === 'positive' ? '+q' : '−q',
      fontSize: 13,
      anchor: 'middle',
    };
    elements.push(chargeLabel);
  }

  return {
    metadata: {
      version: '0.1',
      title: 'Electric Field Lines',
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
