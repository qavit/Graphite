import { describe, it, expect } from 'vitest';
import {
  WORKBENCH_STORAGE_KEY,
  createInitialPersistedState,
  hydratePersistedState,
  readPersistedStateFromStorage,
  persistStateToStorage,
} from '../storage';

describe('createInitialPersistedState', () => {
  it('returns sensible defaults', () => {
    const state = createInitialPersistedState();
    expect(state.inspectorTab).toBe('properties');
    expect(state.inspectorOpen).toBe(true);
    expect(state.templateSearch).toBe('');
    expect(state.document.version).toBe(1);
  });
});

describe('hydratePersistedState', () => {
  it('returns fallback for null', () => {
    const state = hydratePersistedState(null);
    expect(state.inspectorTab).toBe('properties');
  });

  it('returns fallback for non-object', () => {
    const state = hydratePersistedState('corrupt');
    expect(state.inspectorTab).toBe('properties');
  });

  it('accepts valid inspectorTab', () => {
    const state = hydratePersistedState({ inspectorTab: 'svg' });
    expect(state.inspectorTab).toBe('svg');
  });

  it('rejects invalid inspectorTab', () => {
    const state = hydratePersistedState({ inspectorTab: 'unknown' });
    expect(state.inspectorTab).toBe('properties');
  });

  it('accepts all valid tab values', () => {
    for (const tab of ['properties', 'ir', 'svg', 'validation', 'export'] as const) {
      expect(hydratePersistedState({ inspectorTab: tab }).inspectorTab).toBe(tab);
    }
  });

  it('accepts boolean inspectorOpen', () => {
    expect(hydratePersistedState({ inspectorOpen: false }).inspectorOpen).toBe(false);
  });

  it('ignores non-boolean inspectorOpen', () => {
    const fallback = createInitialPersistedState();
    expect(hydratePersistedState({ inspectorOpen: 'yes' }).inspectorOpen).toBe(fallback.inspectorOpen);
  });

  it('accepts string templateSearch', () => {
    expect(hydratePersistedState({ templateSearch: '電路' }).templateSearch).toBe('電路');
  });
});

describe('readPersistedStateFromStorage', () => {
  it('returns initial state when storage is null', () => {
    const state = readPersistedStateFromStorage(null);
    expect(state.inspectorTab).toBe('properties');
  });

  it('returns initial state when key is absent', () => {
    const storage = { getItem: () => null };
    const state = readPersistedStateFromStorage(storage);
    expect(state.inspectorTab).toBe('properties');
  });

  it('returns initial state when stored JSON is corrupt', () => {
    const storage = { getItem: () => '{not valid json' };
    const state = readPersistedStateFromStorage(storage);
    expect(state.inspectorTab).toBe('properties');
  });

  it('hydrates valid stored state', () => {
    const initial = createInitialPersistedState();
    const payload = JSON.stringify({ ...initial, inspectorTab: 'ir', document: initial.document });
    const storage = { getItem: (_key: string) => payload };
    const state = readPersistedStateFromStorage(storage);
    expect(state.inspectorTab).toBe('ir');
  });
});

describe('persistStateToStorage', () => {
  it('writes serialized state to storage', () => {
    let stored: string | null = null;
    const storage = { setItem: (_key: string, value: string) => { stored = value; } };
    const initial = createInitialPersistedState();
    persistStateToStorage(storage, initial);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.inspectorTab).toBe('properties');
  });

  it('uses the correct storage key', () => {
    let usedKey: string | null = null;
    const storage = { setItem: (key: string, _value: string) => { usedKey = key; } };
    persistStateToStorage(storage, createInitialPersistedState());
    expect(usedKey).toBe(WORKBENCH_STORAGE_KEY);
  });

  it('does nothing when storage is null', () => {
    expect(() => persistStateToStorage(null, createInitialPersistedState())).not.toThrow();
  });
});
