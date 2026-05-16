import { describe, it, expect } from 'vitest';
import {
  createDefaultDocument,
  loadDocumentFromUnknown,
  buildDiagramSpec,
  serializeDocument,
} from '../document';

describe('createDefaultDocument', () => {
  it('returns valid defaults', () => {
    const doc = createDefaultDocument();
    expect(doc.version).toBe(1);
    expect(doc.locale).toBe('zh-TW');
    expect(doc.theme).toBe('light');
    expect(doc.mode).toBe('teacher');
    expect(doc.template.type).toBe('inclined');
    expect(doc.canvas.zoom).toBe(1);
    expect(doc.canvas.showGrid).toBe(true);
  });
});

describe('loadDocumentFromUnknown', () => {
  it('returns fallback for null input', () => {
    const fallback = createDefaultDocument();
    expect(loadDocumentFromUnknown(null, fallback)).toEqual(fallback);
  });

  it('returns fallback for non-object input', () => {
    const fallback = createDefaultDocument();
    expect(loadDocumentFromUnknown('bad', fallback)).toEqual(fallback);
  });

  it('loads valid locale override', () => {
    const fallback = createDefaultDocument();
    const doc = loadDocumentFromUnknown({ locale: 'en-US' }, fallback);
    expect(doc.locale).toBe('en-US');
  });

  it('rejects invalid locale and uses fallback', () => {
    const fallback = createDefaultDocument();
    const doc = loadDocumentFromUnknown({ locale: 'fr-FR' }, fallback);
    expect(doc.locale).toBe(fallback.locale);
  });

  it('loads valid theme override', () => {
    const fallback = createDefaultDocument();
    const doc = loadDocumentFromUnknown({ theme: 'dark' }, fallback);
    expect(doc.theme).toBe('dark');
  });

  it('rejects invalid theme and uses fallback', () => {
    const fallback = createDefaultDocument();
    const doc = loadDocumentFromUnknown({ theme: 'blue' }, fallback);
    expect(doc.theme).toBe(fallback.theme);
  });

  it('loads valid mode override', () => {
    const fallback = createDefaultDocument();
    const doc = loadDocumentFromUnknown({ mode: 'student' }, fallback);
    expect(doc.mode).toBe('student');
  });

  it('loads circuit template preset', () => {
    const fallback = createDefaultDocument();
    const doc = loadDocumentFromUnknown({ template: { type: 'circuit', preset: 'parallelTwoResistors' } }, fallback);
    expect(doc.template.type).toBe('circuit');
    if (doc.template.type === 'circuit') {
      expect(doc.template.preset).toBe('parallelTwoResistors');
    }
  });

  it('falls back to seriesFull for unknown circuit preset', () => {
    const fallback = createDefaultDocument();
    const doc = loadDocumentFromUnknown({ template: { type: 'circuit', preset: 'nonexistent' } }, fallback);
    expect(doc.template.type).toBe('circuit');
    if (doc.template.type === 'circuit') {
      expect(doc.template.preset).toBe('seriesFull');
    }
  });

  it('loads inclined template angle', () => {
    const fallback = createDefaultDocument();
    const doc = loadDocumentFromUnknown({ template: { type: 'inclined', angle: 45, scenario: 'simple' } }, fallback);
    expect(doc.template.type).toBe('inclined');
    if (doc.template.type === 'inclined') {
      expect(doc.template.angle).toBe(45);
      expect(doc.template.scenario).toBe('simple');
    }
  });

  it('loads canvas overrides', () => {
    const fallback = createDefaultDocument();
    const doc = loadDocumentFromUnknown({ canvas: { zoom: 1.5, showGrid: false } }, fallback);
    expect(doc.canvas.zoom).toBe(1.5);
    expect(doc.canvas.showGrid).toBe(false);
    expect(doc.canvas.showLabels).toBe(fallback.canvas.showLabels);
  });

  it('always sets version to 1', () => {
    const fallback = createDefaultDocument();
    const doc = loadDocumentFromUnknown({}, fallback);
    expect(doc.version).toBe(1);
  });
});

describe('buildDiagramSpec', () => {
  it('produces a valid DiagramSpec for inclined template', () => {
    const doc = createDefaultDocument();
    const spec = buildDiagramSpec(doc);
    expect(spec.metadata.title).toBeTruthy();
    expect(spec.elements.length).toBeGreaterThan(0);
    expect(spec.view.theme).toBe('exam-bw');
  });

  it('produces a valid DiagramSpec for circuit template', () => {
    const doc = { ...createDefaultDocument(), template: { type: 'circuit' as const, preset: 'seriesFull' as const } };
    const spec = buildDiagramSpec(doc);
    expect(spec.elements.length).toBeGreaterThan(0);
    expect(spec.view.theme).toBe('exam-bw');
  });

  it('always outputs exam-bw regardless of document theme', () => {
    const doc = { ...createDefaultDocument(), theme: 'dark' as const };
    const spec = buildDiagramSpec(doc);
    expect(spec.view.theme).toBe('exam-bw');
  });

  it('respects canvas showLabels=false', () => {
    const doc = { ...createDefaultDocument(), canvas: { ...createDefaultDocument().canvas, showLabels: false } };
    const spec = buildDiagramSpec(doc);
    const labels = spec.elements.filter((el) => el.type === 'label');
    expect(labels.length).toBe(0);
  });

  it('respects canvas showVectors=false', () => {
    const doc = { ...createDefaultDocument(), canvas: { ...createDefaultDocument().canvas, showVectors: false } };
    const spec = buildDiagramSpec(doc);
    const vectors = spec.elements.filter((el) => el.type === 'arrow' || el.type === 'force-vector');
    expect(vectors.length).toBe(0);
  });
});

describe('serializeDocument', () => {
  it('produces valid JSON string', () => {
    const doc = createDefaultDocument();
    const json = serializeDocument(doc);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('round-trips through loadDocumentFromUnknown', () => {
    const doc = createDefaultDocument();
    const json = serializeDocument(doc);
    const loaded = loadDocumentFromUnknown(JSON.parse(json), doc);
    expect(loaded).toEqual(doc);
  });
});
