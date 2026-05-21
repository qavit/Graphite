/**
 * Induction Waveform Template
 * Graphite Physics - Task 030 Template C
 *
 * Sinusoidal Φ(t) flux curve and EMF (cosine) curve with axes.
 */

import {
  DiagramSpec,
  ViewMode,
  DiagramElement,
  LineElement,
  ArrowElement,
  LabelElement,
  FunctionCurveElement,
  Point,
} from '@graphite/diagram-spec';

export interface InductionWaveformParams {
  showEMF: boolean;
  labelLocale?: 'zh-TW' | 'en-US';
}

export function generateInductionWaveform(
  params: InductionWaveformParams,
  viewMode: ViewMode = 'teacher',
): DiagramSpec {
  const { showEMF } = params;
  const canvasWidth = 600;
  const canvasHeight = 500;

  // Axes
  const xAxisY = 250;
  const yAxisX = 80;
  const xStart = 80;
  const xEnd = 520;
  const fluxAmplitude = 120;
  const emfAmplitude = 80;
  const period = xEnd - xStart; // one full cycle over the x range

  // Sample curves at 60 points
  const nSamples = 60;
  const fluxSamples: Point[] = [];
  const emfSamples: Point[] = [];

  for (let i = 0; i <= nSamples; i++) {
    const t = i / nSamples;
    const x = xStart + t * (xEnd - xStart);
    const phase = t * 2 * Math.PI;
    fluxSamples.push({ x, y: xAxisY - fluxAmplitude * Math.sin(phase) });
    emfSamples.push({ x, y: xAxisY - emfAmplitude * Math.cos(phase) });
  }

  const elements: DiagramElement[] = [];

  // X axis
  const xAxis: LineElement = {
    id: 'axis-x',
    type: 'line',
    visibility: ['teacher', 'student', 'minimal'],
    start: { x: yAxisX - 5, y: xAxisY },
    end: { x: xEnd + 20, y: xAxisY },
    style: { stroke: '#000', strokeWidth: 1.5 },
  };
  elements.push(xAxis);

  // X axis arrowhead
  const xAxisArrow: ArrowElement = {
    id: 'axis-x-arrow',
    type: 'arrow',
    visibility: ['teacher', 'student', 'minimal'],
    start: { x: xEnd + 10, y: xAxisY },
    end: { x: xEnd + 22, y: xAxisY },
    headSize: 7,
    style: { stroke: '#000', strokeWidth: 1.5 },
  };
  elements.push(xAxisArrow);

  // Y axis
  const yAxis: LineElement = {
    id: 'axis-y',
    type: 'line',
    visibility: ['teacher', 'student', 'minimal'],
    start: { x: yAxisX, y: xAxisY + fluxAmplitude + 20 },
    end: { x: yAxisX, y: xAxisY - fluxAmplitude - 20 },
    style: { stroke: '#000', strokeWidth: 1.5 },
  };
  elements.push(yAxis);

  // Y axis arrowhead
  const yAxisArrow: ArrowElement = {
    id: 'axis-y-arrow',
    type: 'arrow',
    visibility: ['teacher', 'student', 'minimal'],
    start: { x: yAxisX, y: xAxisY - fluxAmplitude - 10 },
    end: { x: yAxisX, y: xAxisY - fluxAmplitude - 22 },
    headSize: 7,
    style: { stroke: '#000', strokeWidth: 1.5 },
  };
  elements.push(yAxisArrow);

  // Flux curve (Φ) — always visible in teacher/student, always in minimal
  const fluxCurve: FunctionCurveElement = {
    id: 'curve-flux',
    type: 'function-curve',
    visibility: ['teacher', 'student', 'minimal'],
    samples: fluxSamples,
    style: { stroke: '#000', strokeWidth: 2 },
  };
  elements.push(fluxCurve);

  // EMF curve (ε) — teacher only unless showEMF param is false; student mode: hidden
  if (showEMF && viewMode !== 'student' && viewMode !== 'minimal') {
    const emfCurve: FunctionCurveElement = {
      id: 'curve-emf',
      type: 'function-curve',
      visibility: ['teacher'],
      samples: emfSamples,
      style: { stroke: '#000', strokeWidth: 1.5, strokeDasharray: '5,3' },
    };
    elements.push(emfCurve);
  }

  // Labels (teacher mode only)
  if (viewMode === 'teacher') {
    // Φ label on flux curve
    const fluxLabel: LabelElement = {
      id: 'label-flux',
      type: 'label',
      visibility: ['teacher'],
      position: { x: xEnd + 5, y: xAxisY - fluxAmplitude + 10 },
      text: 'Φ',
      fontSize: 14,
      anchor: 'start',
    };
    elements.push(fluxLabel);

    // ε label on EMF curve
    if (showEMF) {
      const emfLabel: LabelElement = {
        id: 'label-emf',
        type: 'label',
        visibility: ['teacher'],
        position: { x: xEnd + 5, y: xAxisY - emfAmplitude - 5 },
        text: 'ε',
        fontSize: 14,
        anchor: 'start',
      };
      elements.push(emfLabel);
    }

    // t label on x axis
    const tLabel: LabelElement = {
      id: 'label-t',
      type: 'label',
      visibility: ['teacher'],
      position: { x: xEnd + 28, y: xAxisY + 4 },
      text: 't',
      fontSize: 14,
      anchor: 'middle',
    };
    elements.push(tLabel);

    // Quarter-period tick marks (T/4, T/2, 3T/4, T)
    const quarters = [0.25, 0.5, 0.75, 1.0];
    const tickLabels = ['T/4', 'T/2', '3T/4', 'T'];
    for (let i = 0; i < quarters.length; i++) {
      const tx = xStart + quarters[i] * (xEnd - xStart);
      const tickLine: LineElement = {
        id: `tick-x-${i}`,
        type: 'line',
        visibility: ['teacher'],
        start: { x: tx, y: xAxisY - 5 },
        end: { x: tx, y: xAxisY + 5 },
        style: { stroke: '#000', strokeWidth: 1 },
      };
      elements.push(tickLine);

      const tickLabel: LabelElement = {
        id: `tick-label-x-${i}`,
        type: 'label',
        visibility: ['teacher'],
        position: { x: tx, y: xAxisY + 18 },
        text: tickLabels[i],
        fontSize: 11,
        anchor: 'middle',
      };
      elements.push(tickLabel);
    }
  }

  return {
    metadata: {
      version: '0.1',
      title: 'Induction Waveform',
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
