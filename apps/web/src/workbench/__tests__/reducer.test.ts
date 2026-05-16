import { describe, it, expect } from 'vitest';
import { createWorkbenchState, workbenchReducer } from '../reducer';
import { serializeDocument } from '../document';

describe('workbenchReducer', () => {
  it('initializes with default state', () => {
    const state = createWorkbenchState();
    expect(state.document.version).toBe(1);
    expect(state.document.locale).toBe('zh-TW');
    expect(state.document.mode).toBe('teacher');
    expect(state.inspectorTab).toBe('properties');
    expect(state.inspectorOpen).toBe(true);
    expect(state.irError).toBeNull();
  });

  it('document/mode changes mode and updates irDraft', () => {
    const state = createWorkbenchState();
    const next = workbenchReducer(state, { type: 'document/mode', mode: 'student' });
    expect(next.document.mode).toBe('student');
    expect(next.irDraft).toContain('"mode": "student"');
    expect(next.irError).toBeNull();
  });

  it('document/locale changes locale', () => {
    const state = createWorkbenchState();
    const next = workbenchReducer(state, { type: 'document/locale', locale: 'en-US' });
    expect(next.document.locale).toBe('en-US');
  });

  it('document/theme changes theme', () => {
    const state = createWorkbenchState();
    const next = workbenchReducer(state, { type: 'document/theme', theme: 'dark' });
    expect(next.document.theme).toBe('dark');
  });

  it('document/template switches template type', () => {
    const state = createWorkbenchState();
    const next = workbenchReducer(state, {
      type: 'document/template',
      template: { type: 'particle', fieldType: 'magnetic', fieldDirection: 'into-page', chargeSign: 'positive', showTrajectory: true, showForceVector: true, showVelocityVector: true, analysisScenario: 'detailed' },
    });
    expect(next.document.template.type).toBe('particle');
    expect(next.irDraft).toContain('"type": "particle"');
  });

  it('document/canvas patches canvas fields', () => {
    const state = createWorkbenchState();
    const next = workbenchReducer(state, { type: 'document/canvas', patch: { showGrid: false, zoom: 1.5 } });
    expect(next.document.canvas.showGrid).toBe(false);
    expect(next.document.canvas.zoom).toBe(1.5);
    expect(next.document.canvas.showLabels).toBe(true);
  });

  it('document/update shallow-merges the document', () => {
    const state = createWorkbenchState();
    const next = workbenchReducer(state, { type: 'document/update', patch: { theme: 'dark' } });
    expect(next.document.theme).toBe('dark');
    expect(next.document.locale).toBe(state.document.locale);
  });

  it('document/reset replaces entire document', () => {
    const state = createWorkbenchState();
    const fresh = { ...state.document, locale: 'en-US' as const, theme: 'dark' as const };
    const next = workbenchReducer(state, { type: 'document/reset', document: fresh });
    expect(next.document.locale).toBe('en-US');
    expect(next.status).toBe('IR applied');
  });

  it('ui/inspectorTab switches tab', () => {
    const state = createWorkbenchState();
    const next = workbenchReducer(state, { type: 'ui/inspectorTab', tab: 'svg' });
    expect(next.inspectorTab).toBe('svg');
  });

  it('ui/inspectorOpen toggles inspector', () => {
    const state = createWorkbenchState();
    const closed = workbenchReducer(state, { type: 'ui/inspectorOpen', open: false });
    expect(closed.inspectorOpen).toBe(false);
    const reopened = workbenchReducer(closed, { type: 'ui/inspectorOpen', open: true });
    expect(reopened.inspectorOpen).toBe(true);
  });

  it('ui/templateSearch updates search query', () => {
    const state = createWorkbenchState();
    const next = workbenchReducer(state, { type: 'ui/templateSearch', query: '電路' });
    expect(next.templateSearch).toBe('電路');
  });

  it('ui/irDraft stores draft and error', () => {
    const state = createWorkbenchState();
    const next = workbenchReducer(state, { type: 'ui/irDraft', draft: 'bad json', error: 'Invalid JSON' });
    expect(next.irDraft).toBe('bad json');
    expect(next.irError).toBe('Invalid JSON');
  });

  it('ui/status updates status message', () => {
    const state = createWorkbenchState();
    const next = workbenchReducer(state, { type: 'ui/status', status: '已儲存' });
    expect(next.status).toBe('已儲存');
  });

  it('irDraft stays in sync after mode change', () => {
    const state = createWorkbenchState();
    const next = workbenchReducer(state, { type: 'document/mode', mode: 'minimal' });
    const parsed = JSON.parse(next.irDraft);
    expect(parsed.mode).toBe('minimal');
  });

  it('unknown action returns state unchanged', () => {
    const state = createWorkbenchState();
    const next = workbenchReducer(state, { type: 'ui/status', status: state.status });
    expect(next).toEqual(state);
  });
});
