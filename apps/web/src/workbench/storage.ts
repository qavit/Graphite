import { createDefaultDocument, loadDocumentFromUnknown, serializeDocument } from './document';
import type { WorkbenchDocument, WorkbenchState } from './types';

export const WORKBENCH_STORAGE_KEY = 'graphite:workbench-state:v1';

export interface PersistedWorkbenchState {
  document: WorkbenchDocument;
  inspectorTab: WorkbenchState['inspectorTab'];
  templateSearch: string;
  inspectorOpen: boolean;
}

export function createInitialPersistedState(): PersistedWorkbenchState {
  const document = createDefaultDocument();
  return {
    document,
    inspectorTab: 'properties',
    templateSearch: '',
    inspectorOpen: true,
  };
}

export function hydratePersistedState(raw: unknown): PersistedWorkbenchState {
  const fallback = createInitialPersistedState();
  if (!raw || typeof raw !== 'object') {
    return fallback;
  }

  const candidate = raw as Partial<PersistedWorkbenchState> & { document?: unknown };
  const document = loadDocumentFromUnknown(candidate.document, fallback.document);

  return {
    document,
    inspectorTab:
      candidate.inspectorTab === 'properties' ||
      candidate.inspectorTab === 'ir' ||
      candidate.inspectorTab === 'svg' ||
      candidate.inspectorTab === 'validation' ||
      candidate.inspectorTab === 'export'
        ? candidate.inspectorTab
        : fallback.inspectorTab,
    templateSearch: typeof candidate.templateSearch === 'string' ? candidate.templateSearch : fallback.templateSearch,
    inspectorOpen: typeof candidate.inspectorOpen === 'boolean' ? candidate.inspectorOpen : fallback.inspectorOpen,
  };
}

export function readPersistedStateFromStorage(storage: Pick<Storage, 'getItem'> | null): PersistedWorkbenchState {
  if (!storage) {
    return createInitialPersistedState();
  }

  try {
    const raw = storage.getItem(WORKBENCH_STORAGE_KEY);
    if (!raw) {
      return createInitialPersistedState();
    }

    return hydratePersistedState(JSON.parse(raw));
  } catch {
    return createInitialPersistedState();
  }
}

export function persistStateToStorage(
  storage: Pick<Storage, 'setItem'> | null,
  state: PersistedWorkbenchState,
): void {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(
      WORKBENCH_STORAGE_KEY,
      JSON.stringify({
        ...state,
        document: JSON.parse(serializeDocument(state.document)),
      }),
    );
  } catch {
    // Ignore storage failures in constrained browser contexts.
  }
}
