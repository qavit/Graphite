/**
 * Inclined Plane Free-Body Diagram Template
 * Graphite Physics - Task 004
 */

import {
  DiagramSpec,
  ViewMode,
  ThemeMode,
  Locale,
  LineElement,
  ForceVectorElement,
  LabelElement,
  BoxElement,
  DiagramElement,
} from '@graphite/diagram-spec';

export interface InclinedPlaneParams {
  angle: number; // degrees (0-90)
  showLabels: boolean;
  labelLocale: Locale;
  analysisScenario: 'simple' | 'friction' | 'advanced';
}

/**
 * Generate an Inclined Plane Free-Body Diagram
 * Returns a DiagramSpec that can be rendered to SVG
 */
export function generateInclinedPlane(
  params: InclinedPlaneParams,
  viewMode: ViewMode = 'teacher'
): DiagramSpec {
  const {
    angle,
    showLabels,
    labelLocale,
    analysisScenario,
  } = params;

  // Canvas setup
  const canvasWidth = 600;
  const canvasHeight = 500;
  const padding = 40;

  // Incline geometry
  const angleRad = (angle * Math.PI) / 180;
  const inclineBase = canvasWidth - 2 * padding;
  const inclineHeight = inclineBase * Math.tan(angleRad);
  const inclineStartX = padding;
  const inclineStartY = canvasHeight - padding;
  const inclineEndX = canvasWidth - padding;
  const inclineEndY = inclineStartY - inclineHeight;

  // Object (block) on incline
  const blockSize = 30;
  const blockPosRatio = 0.5;
  const blockCenterX =
    inclineStartX +
    blockPosRatio * (inclineEndX - inclineStartX);
  const blockCenterY =
    inclineStartY -
    blockPosRatio * inclineHeight -
    (blockSize / 2) / Math.cos(angleRad); // Adjust for rotation to stay on surface

  // Force vectors scale
  const weightScale = 80;
  const normalScale = weightScale * Math.cos(angleRad);
  const frictionScale = weightScale * Math.sin(angleRad);

  // Elements array
  const elements: DiagramElement[] = [];

  // 1. Incline line
  const inclineLine: LineElement = {
    id: 'incline',
    type: 'line',
    visibility: ['teacher', 'student', 'minimal'],
    start: { x: inclineStartX, y: inclineStartY },
    end: { x: inclineEndX, y: inclineEndY },
    style: {
      stroke: '#000',
      strokeWidth: 2,
    },
  };
  elements.push(inclineLine);

  // 2. Ground line
  const groundLine: LineElement = {
    id: 'ground',
    type: 'line',
    visibility: ['teacher', 'student', 'minimal'],
    start: { x: inclineStartX - 20, y: inclineStartY },
    end: { x: inclineEndX + 20, y: inclineStartY },
    style: {
      stroke: '#000',
      strokeWidth: 2,
    },
  };
  elements.push(groundLine);

  // 3. Block (object) - ROTATED to match incline
  const block: BoxElement = {
    id: 'block',
    type: 'box',
    visibility: ['teacher', 'student', 'minimal'],
    position: { x: blockCenterX - blockSize / 2, y: blockCenterY - blockSize / 2 },
    width: blockSize,
    height: blockSize,
    rotation: -angle, // Rotate counter-clockwise to match incline
    style: {
      stroke: '#000',
      strokeWidth: 2,
      fill: '#fff',
    },
  };
  elements.push(block);

  // 4. Weight (gravitational force) - always downward
  if (viewMode !== 'minimal') {
    const weightForce: ForceVectorElement = {
      id: 'force-weight',
      type: 'force-vector',
      visibility: viewMode === 'teacher' ? ['teacher'] : ['teacher', 'student'],
      start: { x: blockCenterX, y: blockCenterY },
      end: {
        x: blockCenterX,
        y: blockCenterY + weightScale,
      },
      forceName: labelLocale === 'zh-TW' ? '重力' : 'Weight',
      magnitude: 'mg',
      showMagnitude: viewMode === 'teacher' && showLabels,
      style: {
        stroke: '#000',
        strokeWidth: 2,
      },
      headSize: 8,
    };
    elements.push(weightForce);
  }

  // 5. Normal force - perpendicular to incline
  // Screen angle of incline is -angle. Normal is -angle - 90.
  if (viewMode !== 'minimal') {
    const normalAngleRad = -angleRad - Math.PI / 2;
    const normalForce: ForceVectorElement = {
      id: 'force-normal',
      type: 'force-vector',
      visibility: viewMode === 'teacher' ? ['teacher'] : ['teacher', 'student'],
      start: { x: blockCenterX, y: blockCenterY },
      end: {
        x: blockCenterX + normalScale * Math.cos(normalAngleRad),
        y: blockCenterY + normalScale * Math.sin(normalAngleRad),
      },
      forceName: labelLocale === 'zh-TW' ? '正向力' : 'Normal Force',
      magnitude: 'N = mg cos θ',
      showMagnitude: viewMode === 'teacher' && showLabels,
      style: {
        stroke: '#000',
        strokeWidth: 2,
      },
      headSize: 8,
    };
    elements.push(normalForce);
  }

  // 6. Friction force (if scenario is friction or advanced)
  // Static friction points UP the incline to balance the component of weight.
  // Screen angle is -angle.
  if ((analysisScenario === 'friction' || analysisScenario === 'advanced') && viewMode !== 'minimal') {
    const frictionAngleRad = -angleRad;
    const frictionForce: ForceVectorElement = {
      id: 'force-friction',
      type: 'force-vector',
      visibility: viewMode === 'teacher' ? ['teacher'] : ['teacher', 'student'],
      start: { x: blockCenterX, y: blockCenterY },
      end: {
        x: blockCenterX + frictionScale * Math.cos(frictionAngleRad),
        y: blockCenterY + frictionScale * Math.sin(frictionAngleRad),
      },
      forceName: labelLocale === 'zh-TW' ? '摩擦力' : 'Friction',
      magnitude: 'f = mg sin θ',
      showMagnitude: viewMode === 'teacher' && showLabels,
      style: {
        stroke: '#000',
        strokeWidth: 2,
        strokeDasharray: '4,4',
      },
      headSize: 8,
    };
    elements.push(frictionForce);
  }

  // 7. Angle label
  if (showLabels && viewMode === 'teacher') {
    const angleLabelX = inclineStartX + 30;
    const angleLabelY = inclineStartY - 20;
    const angleLabel: LabelElement = {
      id: 'label-angle',
      type: 'label',
      visibility: ['teacher'],
      position: { x: angleLabelX, y: angleLabelY },
      text: `θ = ${angle}°`,
      fontSize: 14,
      anchor: 'start',
    };
    elements.push(angleLabel);
  }

  // 8. Metadata labels
  if (showLabels && viewMode === 'teacher') {
    const forceLabels: LabelElement[] = [
      {
        id: 'label-weight',
        type: 'label',
        visibility: ['teacher'],
        position: { x: blockCenterX + 20, y: blockCenterY + weightScale + 15 },
        text: labelLocale === 'zh-TW' ? '重力 (mg)' : 'Weight (mg)',
        fontSize: 12,
        anchor: 'start',
      },
      {
        id: 'label-normal',
        type: 'label',
        visibility: ['teacher'],
        position: {
          x: blockCenterX + normalScale * Math.cos(-angleRad - Math.PI / 2) + 10,
          y: blockCenterY + normalScale * Math.sin(-angleRad - Math.PI / 2) - 10,
        },
        text: labelLocale === 'zh-TW' ? '正向力 (N = mg cos θ)' : 'Normal (N = mg cos θ)',
        fontSize: 12,
        anchor: 'start',
      },
    ];
    if (analysisScenario === 'friction' || analysisScenario === 'advanced') {
      forceLabels.push({
        id: 'label-friction',
        type: 'label',
        visibility: ['teacher'],
        position: {
          x: blockCenterX + frictionScale * Math.cos(-angleRad) + 10,
          y: blockCenterY + frictionScale * Math.sin(-angleRad) - 10,
        },
        text: labelLocale === 'zh-TW' ? '摩擦力 (f = mg sin θ)' : 'Friction (f = mg sin θ)',
        fontSize: 12,
        anchor: 'start',
      });
    }
    elements.push(...forceLabels);
  }

  // Build the complete spec
  const spec: DiagramSpec = {
    metadata: {
      version: '0.1',
      title:
        labelLocale === 'zh-TW'
          ? `斜面自由體圖 (${angle}°)`
          : `Inclined Plane FBD (${angle}°)`,
      author: 'Graphite Physics Templates',
      locale: labelLocale,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

  return spec;
}

/**
 * Preset configurations for common scenarios
 */
export const inclinedPlanePresets = {
  teacherSimple: (angle: number): InclinedPlaneParams => ({
    angle,
    showLabels: true,
    labelLocale: 'zh-TW' as Locale,
    analysisScenario: 'simple' as const,
  }),
  studentSimple: (angle: number): InclinedPlaneParams => ({
    angle,
    showLabels: false,
    labelLocale: 'zh-TW' as Locale,
    analysisScenario: 'simple' as const,
  }),
  teacherWithFriction: (angle: number): InclinedPlaneParams => ({
    angle,
    showLabels: true,
    labelLocale: 'zh-TW' as Locale,
    analysisScenario: 'friction' as const,
  }),
  minimal: (angle: number): InclinedPlaneParams => ({
    angle,
    showLabels: false,
    labelLocale: 'zh-TW' as Locale,
    analysisScenario: 'simple' as const,
  }),
};
