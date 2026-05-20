import type { ViewMode } from '@graphite/diagram-spec';

export type TemplateId = 'inclined' | 'particle' | 'circuit';
export type UiLocale = 'zh-TW' | 'en-US';
export type UiTheme = 'light' | 'dark';
export type InspectorTab = 'properties' | 'ir' | 'svg' | 'validation' | 'export';
export type InteractionMode = 'select' | 'pan';
export type CircuitPresetId =
  | 'seriesFull'
  | 'seriesMinimal'
  | 'seriesOpenSwitch'
  | 'parallelResistorBulb'
  | 'parallelTwoResistors';

export interface CanvasState {
  zoom: number;
  showGrid: boolean;
  showLabels: boolean;
  showVectors: boolean;
  interactionMode: InteractionMode;
}

export interface InclinedTemplateState {
  type: 'inclined';
  angle: number;
  scenario: 'simple' | 'friction' | 'advanced';
}

export interface ParticleTemplateState {
  type: 'particle';
  fieldType: 'magnetic' | 'electric';
  fieldDirection: 'into-page' | 'out-of-page' | 'upward' | 'downward';
  chargeSign: 'positive' | 'negative';
  showTrajectory: boolean;
  showForceVector: boolean;
  showVelocityVector: boolean;
  analysisScenario: 'simple' | 'detailed';
}

export interface CircuitTemplateState {
  type: 'circuit';
  preset: CircuitPresetId;
}

export type TemplateState = InclinedTemplateState | ParticleTemplateState | CircuitTemplateState;

export interface WorkbenchDocument {
  version: 1;
  title: string;
  locale: UiLocale;
  theme: UiTheme;
  mode: ViewMode;
  canvas: CanvasState;
  template: TemplateState;
}

export interface WorkbenchValidationItem {
  id: string;
  severity: 'success' | 'info' | 'warning';
  title: string;
  detail: string;
}

export interface WorkbenchValidationReport {
  status: 'success' | 'warning';
  summary: string;
  items: WorkbenchValidationItem[];
}

export interface WorkbenchState {
  document: WorkbenchDocument;
  inspectorTab: InspectorTab;
  templateSearch: string;
  inspectorOpen: boolean;
  irDraft: string;
  irError: string | null;
  status: string;
}

export type WorkbenchAction =
  | { type: 'document/update'; patch: Partial<WorkbenchDocument> }
  | { type: 'document/template'; template: TemplateState }
  | { type: 'document/canvas'; patch: Partial<CanvasState> }
  | { type: 'document/mode'; mode: ViewMode }
  | { type: 'document/title'; title: string }
  | { type: 'document/locale'; locale: UiLocale }
  | { type: 'document/theme'; theme: UiTheme }
  | { type: 'ui/inspectorTab'; tab: InspectorTab }
  | { type: 'ui/templateSearch'; query: string }
  | { type: 'ui/inspectorOpen'; open: boolean }
  | { type: 'ui/irDraft'; draft: string; error: string | null }
  | { type: 'ui/status'; status: string }
  | { type: 'document/reset'; document: WorkbenchDocument };
