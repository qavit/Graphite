/**
 * Charged Particle Motion in Electromagnetic Field Template
 * Graphite Physics - Task 010
 *
 * Supports:
 *   - Magnetic field (into/out of page) → circular trajectory
 *   - Electric field (upward/downward)  → parabolic trajectory
 */

import {
  DiagramSpec,
  ViewMode,
  Locale,
  DiagramElement,
  ForceVectorElement,
  LabelElement,
  ArcPathElement,
  CircleElement,
  FieldSymbolElement,
  FunctionCurveElement,
  ArrowElement,
} from '@graphite/diagram-spec';

export interface ChargedParticleParams {
  fieldType: 'magnetic' | 'electric';
  /** Magnetic: 'into-page' | 'out-of-page'   Electric: 'upward' | 'downward' */
  fieldDirection: 'into-page' | 'out-of-page' | 'upward' | 'downward';
  chargeSign: 'positive' | 'negative';
  showTrajectory: boolean;
  showForceVector: boolean;
  showVelocityVector: boolean;
  analysisScenario: 'simple' | 'detailed';
  labelLocale: Locale;
}

const CANVAS_W = 600;
const CANVAS_H = 500;

// ── helpers ──────────────────────────────────────────────────────────────────

function visAll(): ViewMode[] { return ['teacher', 'student', 'minimal']; }
function visTeacher(): ViewMode[] { return ['teacher']; }
function visTeacherStudent(): ViewMode[] { return ['teacher', 'student']; }

function label(id: string, x: number, y: number, text: string, vis: ViewMode[], anchor: 'start' | 'middle' | 'end' = 'middle'): LabelElement {
  return { id, type: 'label', visibility: vis, position: { x, y }, text, fontSize: 13, anchor };
}

// ── magnetic field template ──────────────────────────────────────────────────

function buildMagnetic(params: ChargedParticleParams, viewMode: ViewMode): DiagramElement[] {
  const { fieldDirection, chargeSign, showTrajectory, showForceVector, showVelocityVector, analysisScenario, labelLocale } = params;
  const elements: DiagramElement[] = [];
  const isZH = labelLocale === 'zh-TW';

  // Grid of field symbols (⊗ or ⊙)
  const symbolSize = 14;
  const spacing = 70;
  const cols = Math.floor(CANVAS_W / spacing);
  const rows = Math.floor(CANVAS_H / spacing);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = spacing / 2 + c * spacing;
      const cy = spacing / 2 + r * spacing;
      const sym: FieldSymbolElement = {
        id: `field-sym-${r}-${c}`,
        type: 'field-symbol',
        visibility: visAll(),
        center: { x: cx, y: cy },
        size: symbolSize,
        direction: fieldDirection as 'into-page' | 'out-of-page',
        style: { stroke: '#888', strokeWidth: 1 },
      };
      elements.push(sym);
    }
  }

  // Particle starting position
  const px = 150;
  const py = 310;
  const particleR = 14;

  // Particle circle
  const particle: CircleElement = {
    id: 'particle',
    type: 'circle',
    visibility: visAll(),
    center: { x: px, y: py },
    radius: particleR,
    label: chargeSign === 'positive' ? '+' : '−',
    style: { stroke: '#000', strokeWidth: 2, fill: '#fff' },
  };
  elements.push(particle);

  // Physics: determine circular orbit direction
  // Convention (SVG, y-down):
  //   B into page → positive charge moving right → F = q(v×B):
  //     v=(1,0,0), B=(0,0,-1) → v×B=(0·(-1)-0·0, 0·0-1·(-1), 1·0-0·0)=(0,1,0) → F upward in physics = upward on screen (SVG y-up)
  //     → center is ABOVE particle (smaller y in SVG) → counterclockwise on screen
  //   B out of page → positive charge → center BELOW → clockwise
  //   Negate for negative charge.
  const intoPage = fieldDirection === 'into-page';
  const positive = chargeSign === 'positive';
  // isCounterclockwise on screen (SVG):
  const ccw = intoPage === positive; // true→CCW, false→CW

  const orbitR = 140;
  // Center of orbit is perpendicular to velocity (velocity is rightward = +x)
  // Perpendicular: CCW → upward (SVG: above particle, smaller y)
  //                CW  → downward (larger y)
  const orbitCY = ccw ? py - orbitR : py + orbitR;
  const orbitCX = px;

  // Particle is at the bottom (CCW) or top (CW) of the orbit circle
  // Angle of particle from orbit center (SVG convention: 0=right, 90=down)
  const startAngle = ccw ? 90 : 270; // SVG: 90=down=particle when CCW, 270=up when CW

  // End angle: 3/4 arc (270°) in the sweep direction
  const endAngle = ccw
    ? startAngle - 270  // counterclockwise on screen = decreasing SVG angle
    : startAngle + 270; // clockwise = increasing angle

  if (showTrajectory) {
    const arc: ArcPathElement = {
      id: 'trajectory',
      type: 'arc-path',
      visibility: viewMode === 'minimal' ? [] : visTeacherStudent(),
      center: { x: orbitCX, y: orbitCY },
      radius: orbitR,
      startAngle,
      endAngle,
      sweep: ccw ? 'counterclockwise' : 'clockwise',
      showArrowhead: true,
      style: { stroke: '#000', strokeWidth: 2, strokeDasharray: '6,3' },
    };
    elements.push(arc);
  }

  // Velocity vector (rightward from particle)
  if (showVelocityVector) {
    const vLen = 60;
    const vel: ArrowElement = {
      id: 'velocity',
      type: 'arrow',
      visibility: visTeacherStudent(),
      start: { x: px, y: py },
      end: { x: px + vLen, y: py },
      headSize: 8,
      style: { stroke: '#000', strokeWidth: 2 },
    };
    elements.push(vel);

    if (viewMode === 'teacher') {
      elements.push(label('label-v', px + vLen + 10, py + 4, isZH ? 'v₀' : 'v₀', visTeacher(), 'start'));
    }
  }

  // Force vector (toward orbit center = perpendicular to velocity)
  if (showForceVector && viewMode !== 'minimal') {
    const fLen = 55;
    const fDY = ccw ? -fLen : fLen; // toward center
    const force: ForceVectorElement = {
      id: 'force-mag',
      type: 'force-vector',
      visibility: visTeacher(),
      start: { x: px, y: py },
      end: { x: px, y: py + fDY },
      forceName: isZH ? '安培力/洛倫茲力' : 'Lorentz Force',
      magnitude: 'F = qvB',
      showMagnitude: analysisScenario === 'detailed',
      style: { stroke: '#000', strokeWidth: 2 },
      headSize: 8,
    };
    elements.push(force);

    if (viewMode === 'teacher') {
      elements.push(label('label-f', px + 12, py + fDY - 8 * (ccw ? 1 : -1), isZH ? 'F' : 'F', visTeacher(), 'start'));
    }
  }

  // Detailed labels
  if (analysisScenario === 'detailed' && viewMode === 'teacher') {
    const fieldLabel = isZH
      ? (intoPage ? 'B（入紙面）' : 'B（出紙面）')
      : (intoPage ? 'B (into page)' : 'B (out of page)');
    elements.push(label('label-field', CANVAS_W / 2, CANVAS_H - 18, fieldLabel, visTeacher()));

    const orbitLabel = isZH ? `r = mv / qB` : `r = mv / qB`;
    elements.push(label('label-radius', orbitCX + orbitR + 10, orbitCY, orbitLabel, visTeacher(), 'start'));
  }

  return elements;
}

// ── electric field template ──────────────────────────────────────────────────

function buildElectric(params: ChargedParticleParams, viewMode: ViewMode): DiagramElement[] {
  const { fieldDirection, chargeSign, showTrajectory, showForceVector, showVelocityVector, analysisScenario, labelLocale } = params;
  const elements: DiagramElement[] = [];
  const isZH = labelLocale === 'zh-TW';

  const upward = fieldDirection === 'upward';
  const positive = chargeSign === 'positive';
  // Force direction on screen (SVG y-down):
  //   E upward + positive charge → F upward → deflects upward → smaller y
  //   E upward + negative charge → F downward → deflects downward → larger y
  const deflectsUp = upward === positive;

  // E-field arrow lines (vertical, across canvas)
  const arrowSpacing = 60;
  const arrowCount = Math.floor(CANVAS_W / arrowSpacing);
  const arrowLen = 50;
  for (let i = 0; i < arrowCount; i++) {
    const ax = arrowSpacing / 2 + i * arrowSpacing;
    const ayStart = 60;
    const ayEnd = ayStart + (upward ? -arrowLen : arrowLen);
    const efield: ArrowElement = {
      id: `efield-${i}`,
      type: 'arrow',
      visibility: visAll(),
      start: { x: ax, y: upward ? ayStart + arrowLen : ayStart },
      end: { x: ax, y: upward ? ayStart : ayStart + arrowLen },
      headSize: 6,
      style: { stroke: '#666', strokeWidth: 1.5 },
    };
    elements.push(efield);
  }

  // Particle entrance position (left side, mid height)
  const enterX = 60;
  const enterY = 280;
  const particleR = 14;

  const particle: CircleElement = {
    id: 'particle',
    type: 'circle',
    visibility: visAll(),
    center: { x: enterX, y: enterY },
    radius: particleR,
    label: positive ? '+' : '−',
    style: { stroke: '#000', strokeWidth: 2, fill: '#fff' },
  };
  elements.push(particle);

  // Parabolic trajectory: x is horizontal travel, y deflects
  // Physics: x = v₀t, y = ½at² → y = k·(x-enterX)²
  // k chosen to give ~120px deflection across 400px horizontal travel
  const horizTravel = 440;
  const maxDeflect = 130;
  const k = maxDeflect / (horizTravel * horizTravel);

  if (showTrajectory) {
    const fn = (x: number) => enterY + (deflectsUp ? -1 : 1) * k * (x - enterX) ** 2;
    const curve: FunctionCurveElement = {
      id: 'trajectory',
      type: 'function-curve',
      visibility: viewMode === 'minimal' ? [] : visTeacherStudent(),
      samples: Array.from({ length: 61 }, (_, i) => {
        const x = enterX + (i / 60) * horizTravel;
        return { x, y: fn(x) };
      }),
      style: { stroke: '#000', strokeWidth: 2, strokeDasharray: '6,3' },
    };
    elements.push(curve);
  }

  // Velocity vector (rightward)
  if (showVelocityVector) {
    const vel: ArrowElement = {
      id: 'velocity',
      type: 'arrow',
      visibility: visTeacherStudent(),
      start: { x: enterX, y: enterY },
      end: { x: enterX + 55, y: enterY },
      headSize: 8,
      style: { stroke: '#000', strokeWidth: 2 },
    };
    elements.push(vel);
    if (viewMode === 'teacher') {
      elements.push(label('label-v', enterX + 68, enterY + 4, 'v₀', visTeacher(), 'start'));
    }
  }

  // Force vector
  if (showForceVector && viewMode !== 'minimal') {
    const fLen = 55;
    const force: ForceVectorElement = {
      id: 'force-elec',
      type: 'force-vector',
      visibility: visTeacher(),
      start: { x: enterX, y: enterY },
      end: { x: enterX, y: enterY + (deflectsUp ? -fLen : fLen) },
      forceName: isZH ? '電場力' : 'Electric Force',
      magnitude: 'F = qE',
      showMagnitude: analysisScenario === 'detailed',
      style: { stroke: '#000', strokeWidth: 2 },
      headSize: 8,
    };
    elements.push(force);
    if (viewMode === 'teacher') {
      elements.push(label('label-f', enterX + 12, enterY + (deflectsUp ? -fLen - 8 : fLen + 14), 'F', visTeacher(), 'start'));
    }
  }

  // Detailed labels
  if (analysisScenario === 'detailed' && viewMode === 'teacher') {
    const eLabel = isZH
      ? (upward ? 'E（向上）' : 'E（向下）')
      : (upward ? 'E (upward)' : 'E (downward)');
    elements.push(label('label-efield', CANVAS_W / 2, CANVAS_H - 18, eLabel, visTeacher()));

    const motionLabel = isZH ? '拋物線軌跡：y ∝ x²' : 'Parabolic: y ∝ x²';
    elements.push(label('label-parabola', CANVAS_W - 20, enterY + (deflectsUp ? -maxDeflect / 2 : maxDeflect / 2), motionLabel, visTeacher(), 'end'));
  }

  return elements;
}

// ── main generator ───────────────────────────────────────────────────────────

export function generateChargedParticleMotion(
  params: ChargedParticleParams,
  viewMode: ViewMode = 'teacher'
): DiagramSpec {
  const { fieldType, chargeSign, fieldDirection, labelLocale } = params;
  const isZH = labelLocale === 'zh-TW';

  const fieldLabel = fieldType === 'magnetic'
    ? (isZH ? '磁場' : 'Magnetic Field')
    : (isZH ? '電場' : 'Electric Field');
  const chargeLabel = chargeSign === 'positive'
    ? (isZH ? '正電荷' : 'positive charge')
    : (isZH ? '負電荷' : 'negative charge');

  const elements: DiagramElement[] =
    fieldType === 'magnetic'
      ? buildMagnetic(params, viewMode)
      : buildElectric(params, viewMode);

  // Title label (teacher only)
  if (viewMode === 'teacher') {
    const titleText = isZH
      ? `${chargeLabel}在均勻${fieldLabel}中的運動`
      : `${chargeLabel} motion in uniform ${fieldLabel}`;
    elements.unshift({
      id: 'title',
      type: 'label',
      visibility: ['teacher'],
      position: { x: CANVAS_W / 2, y: 22 },
      text: titleText,
      fontSize: 15,
      anchor: 'middle',
    });
  }

  return {
    metadata: {
      version: '0.1',
      title: isZH
        ? `帶電粒子在${fieldLabel}中的運動 (${fieldDirection})`
        : `Charged Particle in ${fieldLabel} (${fieldDirection})`,
      author: 'Graphite Physics Templates',
      locale: labelLocale,
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

// ── presets ──────────────────────────────────────────────────────────────────

export const chargedParticlePresets = {
  /** 正電荷在入紙面磁場中做圓周運動（最常見考題） */
  magneticIntoPagePositive: (): ChargedParticleParams => ({
    fieldType: 'magnetic',
    fieldDirection: 'into-page',
    chargeSign: 'positive',
    showTrajectory: true,
    showForceVector: true,
    showVelocityVector: true,
    analysisScenario: 'simple',
    labelLocale: 'zh-TW',
  }),
  /** 負電荷在出紙面磁場中做圓周運動 */
  magneticOutOfPageNegative: (): ChargedParticleParams => ({
    fieldType: 'magnetic',
    fieldDirection: 'out-of-page',
    chargeSign: 'negative',
    showTrajectory: true,
    showForceVector: true,
    showVelocityVector: true,
    analysisScenario: 'simple',
    labelLocale: 'zh-TW',
  }),
  /** 正電荷在向上電場中偏轉（拋物線） */
  electricUpwardPositive: (): ChargedParticleParams => ({
    fieldType: 'electric',
    fieldDirection: 'upward',
    chargeSign: 'positive',
    showTrajectory: true,
    showForceVector: true,
    showVelocityVector: true,
    analysisScenario: 'simple',
    labelLocale: 'zh-TW',
  }),
  /** 詳細版：磁場圓周運動含公式標註 */
  magneticDetailed: (): ChargedParticleParams => ({
    fieldType: 'magnetic',
    fieldDirection: 'into-page',
    chargeSign: 'positive',
    showTrajectory: true,
    showForceVector: true,
    showVelocityVector: true,
    analysisScenario: 'detailed',
    labelLocale: 'zh-TW',
  }),
};
