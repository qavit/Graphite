/**
 * Simple Circuit Diagram Template
 * Graphite Physics - Task 011
 *
 * Supports:
 *   - Series circuit  (battery + optional switch, resistor, bulb)
 *   - Parallel circuit (battery + two parallel branches)
 *
 * Layout convention:
 *   All components are centered on the circuit wire.
 *   Wires (LineElements) connect components at center ± CIRCUIT_HALF_WIDTH.
 *   Component order in a series circuit: battery → switch → resistor → bulb.
 */

import {
  DiagramSpec,
  ViewMode,
  Locale,
  DiagramElement,
  LineElement,
  LabelElement,
  CircuitComponentElement,
  CircuitComponentType,
  Point,
} from '@graphite/diagram-spec';

export const CIRCUIT_HALF_WIDTH = 25; // must match render-svg/extra-renderers

// ── Param types ──────────────────────────────────────────────────────────────

export interface SeriesCircuitParams {
  circuitType: 'series';
  hasSwitch: boolean;
  switchClosed: boolean;
  hasResistor: boolean;
  hasBulb: boolean;
  batteryValue?: string;   // e.g. '6 V'
  resistorValue?: string;  // e.g. '10 Ω'
  showCurrentArrow: boolean;
  showLabels: boolean;
  analysisScenario: 'simple' | 'detailed';
  labelLocale: Locale;
}

export interface ParallelCircuitParams {
  circuitType: 'parallel';
  branch1Type: 'resistor' | 'bulb';
  branch2Type: 'resistor' | 'bulb';
  batteryValue?: string;
  branch1Value?: string;
  branch2Value?: string;
  showLabels: boolean;
  analysisScenario: 'simple' | 'detailed';
  labelLocale: Locale;
}

export type SimpleCircuitParams = SeriesCircuitParams | ParallelCircuitParams;

// ── Helpers ───────────────────────────────────────────────────────────────────

const CANVAS_W = 600;
const CANVAS_H = 500;
const SW = 2;

function vis(modes: ViewMode[]): ViewMode[] { return modes; }
function visAll(): ViewMode[] { return ['teacher', 'student', 'minimal']; }
function visTeacher(): ViewMode[] { return ['teacher']; }

function wire(id: string, x1: number, y1: number, x2: number, y2: number): LineElement {
  return {
    id,
    type: 'line',
    visibility: visAll(),
    start: { x: x1, y: y1 },
    end: { x: x2, y: y2 },
    style: { stroke: '#000', strokeWidth: SW },
  };
}

function component(
  id: string,
  componentType: CircuitComponentType,
  center: Point,
  orientation: 'horizontal' | 'vertical',
  value?: string,
  visMode: ViewMode[] = visAll(),
): CircuitComponentElement {
  return {
    id,
    type: 'circuit-component',
    visibility: visMode,
    componentType,
    center,
    orientation,
    value,
    style: { stroke: '#000', strokeWidth: SW },
  };
}

function label(id: string, x: number, y: number, text: string, visMode = visTeacher()): LabelElement {
  return { id, type: 'label', visibility: visMode, position: { x, y }, text, fontSize: 13, anchor: 'middle' };
}

// ── Series Circuit ────────────────────────────────────────────────────────────

function buildSeries(params: SeriesCircuitParams, viewMode: ViewMode): DiagramElement[] {
  const { hasSwitch, switchClosed, hasResistor, hasBulb, batteryValue, resistorValue, showCurrentArrow, showLabels, labelLocale } = params;
  const isZH = labelLocale === 'zh-TW';
  const elements: DiagramElement[] = [];

  // Circuit rectangle extents
  const left = 70;
  const right = 530;
  const top = 160;
  const bottom = 380;
  const hw = CIRCUIT_HALF_WIDTH;

  // Determine ordered component list on top wire
  type CompDef = { id: string; type: CircuitComponentType; value?: string };
  const comps: CompDef[] = [];
  comps.push({ id: 'battery', type: 'battery', value: batteryValue });
  if (hasSwitch) comps.push({ id: 'switch', type: switchClosed ? 'switch-closed' : 'switch-open' });
  if (hasResistor) comps.push({ id: 'resistor', type: 'resistor', value: resistorValue });
  if (hasBulb) comps.push({ id: 'bulb', type: 'bulb' });

  // Distribute component centers evenly along the top wire
  const span = right - left;
  const totalBody = comps.length * hw * 2;
  const gap = (span - totalBody) / (comps.length + 1);
  const centers: number[] = [];
  let cx = left + gap + hw;
  for (const _ of comps) {
    centers.push(cx);
    cx += hw * 2 + gap;
  }

  // Top wire segments (between corners and components, between components)
  let prevRight = left;
  for (let i = 0; i < comps.length; i++) {
    const compLeft = centers[i] - hw;
    elements.push(wire(`wire-top-${i}`, prevRight, top, compLeft, top));
    prevRight = centers[i] + hw;
  }
  elements.push(wire(`wire-top-end`, prevRight, top, right, top));

  // Components
  for (let i = 0; i < comps.length; i++) {
    const showVal = showLabels && viewMode !== 'minimal' && comps[i].value;
    elements.push(component(
      comps[i].id,
      comps[i].type,
      { x: centers[i], y: top },
      'horizontal',
      showVal ? comps[i].value : undefined,
      viewMode === 'minimal' ? vis(['teacher', 'student', 'minimal']) : visAll(),
    ));
  }

  // Left, right, bottom wires
  elements.push(wire('wire-left', left, top, left, bottom));
  elements.push(wire('wire-right', right, top, right, bottom));
  elements.push(wire('wire-bottom', left, bottom, right, bottom));

  // Current direction arrow (teacher mode, detailed)
  if (showCurrentArrow && viewMode === 'teacher') {
    const arrowMidX = (left + right) / 2;
    elements.push({
      id: 'current-arrow',
      type: 'arrow',
      visibility: visTeacher(),
      start: { x: arrowMidX - 25, y: bottom },
      end: { x: arrowMidX + 25, y: bottom },
      headSize: 8,
      style: { stroke: '#000', strokeWidth: 2 },
    } as DiagramElement);
    if (showLabels) {
      elements.push(label('label-current', arrowMidX, bottom + 20,
        isZH ? 'I（電流方向）' : 'I (current direction)'));
    }
  }

  // Title
  if (viewMode === 'teacher' && showLabels) {
    elements.push(label('title', CANVAS_W / 2, 30,
      isZH ? '串聯電路' : 'Series Circuit', visTeacher()));
  }

  return elements;
}

// ── Parallel Circuit ──────────────────────────────────────────────────────────

function buildParallel(params: ParallelCircuitParams, viewMode: ViewMode): DiagramElement[] {
  const { branch1Type, branch2Type, batteryValue, branch1Value, branch2Value, showLabels, labelLocale } = params;
  const isZH = labelLocale === 'zh-TW';
  const elements: DiagramElement[] = [];
  const hw = CIRCUIT_HALF_WIDTH;

  // Outer rectangle
  const left = 100;
  const right = 500;
  const top = 110;
  const bottom = 420;
  // Battery on left vertical wire, centered
  const batCY = (top + bottom) / 2;

  // Junction points
  const jTopLeft:  Point = { x: left, y: top };
  const jTopRight: Point = { x: right, y: top };
  const jBotLeft:  Point = { x: left, y: bottom };
  const jBotRight: Point = { x: right, y: bottom };

  // Branch y positions
  const branch1Y = top + 80;
  const branch2Y = bottom - 80;
  const branchCX = (left + right) / 2;

  // Left wire: top to battery top, battery bottom to bottom
  elements.push(wire('wire-left-top', left, top, left, batCY - hw));
  elements.push(wire('wire-left-bot', left, batCY + hw, left, bottom));

  // Battery (vertical on left)
  const showBatVal = showLabels && viewMode !== 'minimal' && batteryValue;
  elements.push(component('battery', 'battery', { x: left, y: batCY }, 'vertical',
    showBatVal ? batteryValue : undefined));

  // Right wire
  elements.push(wire('wire-right', right, top, right, bottom));

  // Top horizontal wire
  elements.push(wire('wire-top', left, top, right, top));

  // Bottom horizontal wire
  elements.push(wire('wire-bottom', left, bottom, right, bottom));

  // Branch 1 (upper): left junction ↔ branch component ↔ right junction
  const b1Left = left;
  const b1Right = right;
  const b1CompCX = branchCX;

  // Branch connector wires at branch1Y
  elements.push(wire('wire-b1-left-v', left, top, left, branch1Y));
  elements.push(wire('wire-b1-right-v', right, top, right, branch1Y));
  elements.push(wire('wire-b1-left-h', left, branch1Y, b1CompCX - hw, branch1Y));
  elements.push(wire('wire-b1-right-h', b1CompCX + hw, branch1Y, right, branch1Y));
  const showB1Val = showLabels && viewMode !== 'minimal' && branch1Value;
  elements.push(component('branch1', branch1Type, { x: b1CompCX, y: branch1Y }, 'horizontal',
    showB1Val ? branch1Value : undefined));

  // Branch 2 (lower)
  elements.push(wire('wire-b2-left-v', left, branch2Y, left, bottom));
  elements.push(wire('wire-b2-right-v', right, branch2Y, right, bottom));
  elements.push(wire('wire-b2-left-h', left, branch2Y, b1CompCX - hw, branch2Y));
  elements.push(wire('wire-b2-right-h', b1CompCX + hw, branch2Y, right, branch2Y));
  const showB2Val = showLabels && viewMode !== 'minimal' && branch2Value;
  elements.push(component('branch2', branch2Type, { x: b1CompCX, y: branch2Y }, 'horizontal',
    showB2Val ? branch2Value : undefined));

  // Junction dots
  for (const [id, p] of [
    ['junc-tl', jTopLeft], ['junc-tr', jTopRight],
    ['junc-bl', jBotLeft], ['junc-br', jBotRight],
  ] as [string, Point][]) {
    elements.push({
      id,
      type: 'circle',
      visibility: visAll(),
      center: p,
      radius: 4,
      style: { stroke: '#000', strokeWidth: 1, fill: '#000' },
    } as DiagramElement);
  }

  // Title
  if (viewMode === 'teacher' && showLabels) {
    elements.push(label('title', CANVAS_W / 2, 30,
      isZH ? '並聯電路' : 'Parallel Circuit', visTeacher()));
  }

  return elements;
}

// ── Main generator ────────────────────────────────────────────────────────────

export function generateSimpleCircuit(
  params: SimpleCircuitParams,
  viewMode: ViewMode = 'teacher',
): DiagramSpec {
  const isZH = params.labelLocale === 'zh-TW';
  const elements: DiagramElement[] =
    params.circuitType === 'series'
      ? buildSeries(params, viewMode)
      : buildParallel(params, viewMode);

  const typeLabel = params.circuitType === 'series'
    ? (isZH ? '串聯' : 'Series')
    : (isZH ? '並聯' : 'Parallel');

  return {
    metadata: {
      version: '0.1',
      title: isZH ? `${typeLabel}電路圖` : `${typeLabel} Circuit Diagram`,
      author: 'Graphite Physics Templates',
      locale: params.labelLocale,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    canvas: {
      width: CANVAS_W,
      height: CANVAS_H,
      viewBox: [0, 0, CANVAS_W, CANVAS_H],
      unit: 'px',
    },
    view: {
      mode: viewMode,
      theme: 'exam-bw',
    },
    elements,
  };
}

// ── Presets ───────────────────────────────────────────────────────────────────

export const simpleCircuitPresets = {
  /** 串聯：電池 + 開關（閉合）+ 電阻 + 燈泡 */
  seriesFull: (): SeriesCircuitParams => ({
    circuitType: 'series',
    hasSwitch: true,
    switchClosed: true,
    hasResistor: true,
    hasBulb: true,
    showCurrentArrow: false,
    showLabels: true,
    analysisScenario: 'simple',
    labelLocale: 'zh-TW',
  }),
  /** 串聯：電池 + 電阻（最簡版） */
  seriesMinimal: (): SeriesCircuitParams => ({
    circuitType: 'series',
    hasSwitch: false,
    switchClosed: false,
    hasResistor: true,
    hasBulb: false,
    showCurrentArrow: false,
    showLabels: false,
    analysisScenario: 'simple',
    labelLocale: 'zh-TW',
  }),
  /** 串聯：有斷路開關（教師版，可講通路/斷路） */
  seriesOpenSwitch: (): SeriesCircuitParams => ({
    circuitType: 'series',
    hasSwitch: true,
    switchClosed: false,
    hasResistor: true,
    hasBulb: true,
    showCurrentArrow: false,
    showLabels: true,
    analysisScenario: 'simple',
    labelLocale: 'zh-TW',
  }),
  /** 並聯：電阻 + 燈泡 */
  parallelResistorBulb: (): ParallelCircuitParams => ({
    circuitType: 'parallel',
    branch1Type: 'resistor',
    branch2Type: 'bulb',
    showLabels: true,
    analysisScenario: 'simple',
    labelLocale: 'zh-TW',
  }),
  /** 並聯：電阻 + 電阻（可比較分流） */
  parallelTwoResistors: (): ParallelCircuitParams => ({
    circuitType: 'parallel',
    branch1Type: 'resistor',
    branch2Type: 'resistor',
    branch1Value: 'R₁',
    branch2Value: 'R₂',
    showLabels: true,
    analysisScenario: 'detailed',
    labelLocale: 'zh-TW',
  }),
};
