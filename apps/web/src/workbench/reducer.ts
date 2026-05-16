import { createDefaultDocument, serializeDocument } from './document';
import type { CanvasState, TemplateState, UiLocale, UiTheme, WorkbenchAction, WorkbenchState } from './types';
import { createInitialPersistedState, hydratePersistedState } from './storage';

export function createWorkbenchState(): WorkbenchState {
  const persisted = createInitialPersistedState();
  return {
    document: persisted.document,
    inspectorTab: persisted.inspectorTab,
    templateSearch: persisted.templateSearch,
    inspectorOpen: persisted.inspectorOpen,
    irDraft: serializeDocument(persisted.document),
    irError: null,
    status: 'Workbench ready',
  };
}

export function hydrateWorkbenchState(raw: unknown): WorkbenchState {
  const persisted = hydratePersistedState(raw);
  return {
    document: persisted.document,
    inspectorTab: persisted.inspectorTab,
    templateSearch: persisted.templateSearch,
    inspectorOpen: persisted.inspectorOpen,
    irDraft: serializeDocument(persisted.document),
    irError: null,
    status: 'Workbench ready',
  };
}

export function workbenchReducer(state: WorkbenchState, action: WorkbenchAction): WorkbenchState {
  switch (action.type) {
    case 'document/update': {
      const document = { ...state.document, ...action.patch };
      return {
        ...state,
        document,
        irDraft: serializeDocument(document),
        irError: null,
      };
    }
    case 'document/template': {
      const document = { ...state.document, template: action.template };
      return {
        ...state,
        document,
        irDraft: serializeDocument(document),
        irError: null,
      };
    }
    case 'document/canvas': {
      const canvas: CanvasState = { ...state.document.canvas, ...action.patch };
      const document = { ...state.document, canvas };
      return {
        ...state,
        document,
        irDraft: serializeDocument(document),
        irError: null,
      };
    }
    case 'document/mode': {
      const document = { ...state.document, mode: action.mode };
      return {
        ...state,
        document,
        irDraft: serializeDocument(document),
        irError: null,
      };
    }
    case 'document/locale': {
      const document = { ...state.document, locale: action.locale };
      return {
        ...state,
        document,
        irDraft: serializeDocument(document),
        irError: null,
      };
    }
    case 'document/theme': {
      const document = { ...state.document, theme: action.theme };
      return {
        ...state,
        document,
        irDraft: serializeDocument(document),
        irError: null,
      };
    }
    case 'document/reset': {
      return {
        ...state,
        document: action.document,
        irDraft: serializeDocument(action.document),
        irError: null,
        status: 'IR applied',
      };
    }
    case 'ui/inspectorTab':
      return { ...state, inspectorTab: action.tab };
    case 'ui/templateSearch':
      return { ...state, templateSearch: action.query };
    case 'ui/inspectorOpen':
      return { ...state, inspectorOpen: action.open };
    case 'ui/irDraft':
      return { ...state, irDraft: action.draft, irError: action.error };
    case 'ui/status':
      return { ...state, status: action.status };
    default:
      return state;
  }
}

export function resetWorkbenchDocument(): WorkbenchState {
  const document = createDefaultDocument();
  return {
    document,
    inspectorTab: 'properties',
    templateSearch: '',
    inspectorOpen: true,
    irDraft: serializeDocument(document),
    irError: null,
    status: 'Workbench ready',
  };
}
