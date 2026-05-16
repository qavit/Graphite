/**
 * Graphite DiagramSpec v0.1
 * Core type definitions for teacher-first, vector-first STEM diagrams.
 */

export type ViewMode = 'teacher' | 'student' | 'minimal';
export type ThemeMode = 'exam-bw' | 'color-high-contrast';
export type Locale = 'zh-TW' | 'en-US';

export interface DiagramMetadata {
  version: string;
  title: string;
  author?: string;
  locale: Locale;
  createdAt: string;
  updatedAt: string;
}

export interface CanvasSettings {
  width: number;
  height: number;
  viewBox: [number, number, number, number]; // [minX, minY, width, height]
  unit?: string;
}

export interface Point {
  x: number;
  y: number;
}

export type ElementType = 
  | 'line' 
  | 'circle' 
  | 'polygon' 
  | 'arrow' 
  | 'label' 
  | 'box' 
  | 'force-vector' 
  | 'coordinate-axis'
  | 'grid'
  | 'function-curve';

export interface GridElement extends BaseElement {
  type: 'grid';
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  stepX: number;
  stepY: number;
}

export interface CoordinateAxisElement extends BaseElement {
  type: 'coordinate-axis';
  origin: Point;
  xRange: [number, number];
  yRange: [number, number];
  xLabel?: string;
  yLabel?: string;
  showTicks: boolean;
}

export interface FunctionCurveElement extends BaseElement {
  type: 'function-curve';
  fn: (x: number) => number;
  domain: [number, number];
  points: number; // Sampling points for rendering
}

export interface BaseElement {
  id: string;
  type: ElementType;
  visibility: ViewMode[]; // Which modes show this element
  rotation?: number; // Rotation in degrees
  rotationCenter?: Point; // Center of rotation, defaults to element's natural center
  style?: {
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
    fill?: string;
  };
}

export interface LineElement extends BaseElement {
  type: 'line';
  start: Point;
  end: Point;
}

export interface ArrowElement extends BaseElement {
  type: 'arrow';
  start: Point;
  end: Point;
  headSize?: number;
}

export interface LabelElement extends BaseElement {
  type: 'label';
  position: Point;
  text: string;
  isMath?: boolean; // If true, process as LaTeX
  fontSize?: number;
  anchor?: 'start' | 'middle' | 'end';
}

export interface BoxElement extends BaseElement {
  type: 'box';
  position: Point;
  width: number;
  height: number;
  label?: string; // Optional label for the box
}

/**
 * Domain Specific: Physics Force Vector
 */
export interface ForceVectorElement extends BaseElement {
  type: 'force-vector';
  start: Point;
  end: Point;
  headSize?: number;
  forceName: string;
  magnitude?: string; // e.g. "50 N"
  showMagnitude: boolean;
}

export type DiagramElement = 
  | LineElement 
  | ArrowElement 
  | LabelElement 
  | BoxElement 
  | ForceVectorElement
  | GridElement
  | CoordinateAxisElement
  | FunctionCurveElement;

export interface DiagramSpec {
  metadata: DiagramMetadata;
  canvas: CanvasSettings;
  view: {
    mode: ViewMode;
    theme: ThemeMode;
  };
  elements: DiagramElement[];
}
