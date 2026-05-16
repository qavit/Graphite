import { describe, expect, it } from 'vitest';
import { validateDiagramSpec } from '../schemas';
import type { DiagramSpec } from '../types';

const validSpec: DiagramSpec = {
  metadata: {
    version: '0.1',
    title: 'Test diagram',
    locale: 'zh-TW',
    createdAt: '2026-05-16T00:00:00.000Z',
    updatedAt: '2026-05-16T00:00:00.000Z',
  },
  canvas: {
    width: 100,
    height: 100,
    viewBox: [0, 0, 100, 100],
  },
  view: {
    mode: 'teacher',
    theme: 'exam-bw',
  },
  elements: [],
};

describe('validateDiagramSpec', () => {
  it('accepts a minimally valid DiagramSpec v0.1 object', () => {
    expect(validateDiagramSpec(validSpec)).toBe(true);
  });

  it('rejects unsupported versions', () => {
    expect(
      validateDiagramSpec({
        ...validSpec,
        metadata: { ...validSpec.metadata, version: '0.2' },
      })
    ).toBe(false);
  });

  it('rejects specs without an elements array', () => {
    expect(validateDiagramSpec({ ...validSpec, elements: undefined })).toBe(false);
  });
});
