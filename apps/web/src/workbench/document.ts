import {
  generateChargedParticleMotion,
  generateInclinedPlane,
  generateSimpleCircuit,
  simpleCircuitPresets,
} from '@graphite/templates';
import { renderToSVG } from '@graphite/render-svg';
import type { DiagramElement, DiagramSpec, ViewMode } from '@graphite/diagram-spec';
import type { ChargedParticleParams, InclinedPlaneParams, SimpleCircuitParams } from '@graphite/templates';
import type {
  CanvasState,
  CircuitPresetId,
  CircuitTemplateState,
  InclinedTemplateState,
  ParticleTemplateState,
  TemplateState,
  UiLocale,
  UiTheme,
  WorkbenchDocument,
} from './types';

export function createDefaultDocument(): WorkbenchDocument {
  return {
    version: 1,
    locale: 'zh-TW',
    theme: 'light',
    mode: 'teacher',
    canvas: {
      zoom: 1,
      showGrid: true,
      showLabels: true,
      showVectors: true,
      interactionMode: 'select',
    },
    template: {
      type: 'inclined',
      angle: 30,
      scenario: 'friction',
    },
  };
}

export function createCircuitTemplate(preset: CircuitPresetId): CircuitTemplateState {
  return {
    type: 'circuit',
    preset,
  };
}

export function createParticleTemplate(): ParticleTemplateState {
  return {
    type: 'particle',
    fieldType: 'magnetic',
    fieldDirection: 'into-page',
    chargeSign: 'positive',
    showTrajectory: true,
    showForceVector: true,
    showVelocityVector: true,
    analysisScenario: 'detailed',
  };
}

export function createInclinedTemplate(): InclinedTemplateState {
  return {
    type: 'inclined',
    angle: 30,
    scenario: 'friction',
  };
}

export function buildDiagramSpec(document: WorkbenchDocument): DiagramSpec {
  const viewMode = document.mode;
  const baseSpec = buildBaseSpec(document, viewMode);
  const elements = applyCanvasVisibility(baseSpec.elements, document.canvas);

  return {
    ...baseSpec,
    elements,
    view: {
      ...baseSpec.view,
      // DiagramSpec theme is always exam-bw; the UI light/dark theme is a shell concern only.
      theme: 'exam-bw',
    },
  };
}

function buildBaseSpec(document: WorkbenchDocument, mode: ViewMode): DiagramSpec {
  switch (document.template.type) {
    case 'inclined': {
      const params: InclinedPlaneParams = {
        angle: document.template.angle,
        showLabels: true,
        labelLocale: document.locale,
        analysisScenario: document.template.scenario,
      };
      return generateInclinedPlane(params, mode);
    }
    case 'particle': {
      const params: ChargedParticleParams = {
        fieldType: document.template.fieldType,
        fieldDirection: document.template.fieldDirection,
        chargeSign: document.template.chargeSign,
        showTrajectory: document.template.showTrajectory,
        showForceVector: document.template.showForceVector,
        showVelocityVector: document.template.showVelocityVector,
        analysisScenario: document.template.analysisScenario,
        labelLocale: document.locale,
      };
      return generateChargedParticleMotion(params, mode);
    }
    case 'circuit': {
      const params: SimpleCircuitParams = simpleCircuitPresets[document.template.preset]();
      return generateSimpleCircuit(params, mode);
    }
  }
}

function applyCanvasVisibility(elements: DiagramElement[], canvas: CanvasState): DiagramElement[] {
  return elements.filter((element) => {
    if (!canvas.showLabels && element.type === 'label') {
      return false;
    }
    if (!canvas.showVectors && (element.type === 'arrow' || element.type === 'force-vector')) {
      return false;
    }
    return true;
  });
}

function toString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function toNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function toBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function loadDocumentFromUnknown(input: unknown, fallback = createDefaultDocument()): WorkbenchDocument {
  if (!input || typeof input !== 'object') {
    return fallback;
  }

  const raw = input as Partial<WorkbenchDocument> & {
    template?: Partial<TemplateState> & Record<string, unknown>;
    canvas?: Partial<CanvasState>;
  };

  const locale = raw.locale === 'en-US' || raw.locale === 'zh-TW' ? raw.locale : fallback.locale;
  const theme = raw.theme === 'dark' || raw.theme === 'light' ? raw.theme : fallback.theme;
  const mode = raw.mode === 'teacher' || raw.mode === 'student' || raw.mode === 'minimal' ? raw.mode : fallback.mode;

  const canvas = {
    zoom: toNumber(raw.canvas?.zoom, fallback.canvas.zoom),
    showGrid: toBoolean(raw.canvas?.showGrid, fallback.canvas.showGrid),
    showLabels: toBoolean(raw.canvas?.showLabels, fallback.canvas.showLabels),
    showVectors: toBoolean(raw.canvas?.showVectors, fallback.canvas.showVectors),
    interactionMode: raw.canvas?.interactionMode === 'pan' ? 'pan' : 'select',
  } satisfies CanvasState;

  const template = normalizeTemplate(raw.template, fallback.template);

  return {
    version: 1,
    locale,
    theme,
    mode,
    canvas,
    template,
  };
}

function normalizeTemplate(template: unknown, fallback: TemplateState): TemplateState {
  if (!template || typeof template !== 'object') {
    return fallback;
  }

  const raw = template as Record<string, unknown>;
  const type = toString(raw.type, fallback.type);

  if (type === 'particle') {
    return {
      type: 'particle',
      fieldType: raw.fieldType === 'electric' || raw.fieldType === 'magnetic' ? raw.fieldType : fallback.type === 'particle' ? fallback.fieldType : 'magnetic',
      fieldDirection:
        raw.fieldDirection === 'into-page' ||
        raw.fieldDirection === 'out-of-page' ||
        raw.fieldDirection === 'upward' ||
        raw.fieldDirection === 'downward'
          ? raw.fieldDirection
          : fallback.type === 'particle'
            ? fallback.fieldDirection
            : 'into-page',
      chargeSign: raw.chargeSign === 'negative' || raw.chargeSign === 'positive'
        ? raw.chargeSign
        : fallback.type === 'particle'
          ? fallback.chargeSign
          : 'positive',
      showTrajectory: toBoolean(raw.showTrajectory, fallback.type === 'particle' ? fallback.showTrajectory : true),
      showForceVector: toBoolean(raw.showForceVector, fallback.type === 'particle' ? fallback.showForceVector : true),
      showVelocityVector: toBoolean(raw.showVelocityVector, fallback.type === 'particle' ? fallback.showVelocityVector : true),
      analysisScenario: raw.analysisScenario === 'simple' || raw.analysisScenario === 'detailed'
        ? raw.analysisScenario
        : fallback.type === 'particle'
          ? fallback.analysisScenario
          : 'detailed',
    };
  }

  if (type === 'circuit') {
    const preset = (Object.keys(simpleCircuitPresets) as CircuitPresetId[]).includes(raw.preset as CircuitPresetId)
      ? (raw.preset as CircuitPresetId)
      : fallback.type === 'circuit'
        ? fallback.preset
        : 'seriesFull';

    return {
      type: 'circuit',
      preset,
    };
  }

  return {
    type: 'inclined',
    angle: toNumber(raw.angle, fallback.type === 'inclined' ? fallback.angle : 30),
    scenario: raw.scenario === 'simple' || raw.scenario === 'friction' || raw.scenario === 'advanced'
      ? raw.scenario
      : fallback.type === 'inclined'
        ? fallback.scenario
        : 'friction',
  };
}

export function serializeDocument(document: WorkbenchDocument) {
  return JSON.stringify(document, null, 2);
}

export function readSvgFromSpec(spec: DiagramSpec) {
  return renderToSVG(spec);
}
