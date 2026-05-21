import { describe, it, expect } from 'vitest';
import { generateVectorSuperposition } from '../vectorSuperposition';
import { validateDiagramSpec } from '@graphite/diagram-spec';

describe('Vector Superposition Template', () => {
  it('should generate a valid DiagramSpec in teacher mode', () => {
    const spec = generateVectorSuperposition({}, 'teacher');
    expect(validateDiagramSpec(spec)).toBe(true);
    expect(spec.view.mode).toBe('teacher');
  });

  it('should include F1, F2, and resultant arrows', () => {
    const spec = generateVectorSuperposition({}, 'teacher');
    expect(spec.elements.find((el) => el.id === 'force-f1')).toBeDefined();
    expect(spec.elements.find((el) => el.id === 'force-f2')).toBeDefined();
    expect(spec.elements.find((el) => el.id === 'force-result')).toBeDefined();
  });

  it('should include F1, F2, F_result labels in teacher mode', () => {
    const spec = generateVectorSuperposition({}, 'teacher');
    expect(spec.elements.find((el) => el.id === 'label-f1')).toBeDefined();
    expect(spec.elements.find((el) => el.id === 'label-f2')).toBeDefined();
    expect(spec.elements.find((el) => el.id === 'label-f-result')).toBeDefined();
  });

  it('should not include labels in student mode', () => {
    const spec = generateVectorSuperposition({}, 'student');
    expect(spec.elements.find((el) => el.id === 'label-f1')).toBeUndefined();
  });

  it('resultant arrow is dashed in student mode', () => {
    const spec = generateVectorSuperposition({}, 'student');
    const result = spec.elements.find((el) => el.id === 'force-result');
    expect(result?.style?.strokeDasharray).toBeTruthy();
  });

  it('should use fixed createdAt for determinism', () => {
    const spec = generateVectorSuperposition({}, 'teacher');
    expect(spec.metadata.createdAt).toBe('2026-01-01T00:00:00.000Z');
  });
});
