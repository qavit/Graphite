import { describe, it, expect } from 'vitest';
import { generateInductionWaveform } from '../inductionWaveform';
import { validateDiagramSpec } from '@graphite/diagram-spec';

describe('Induction Waveform Template', () => {
  it('should generate a valid DiagramSpec in teacher mode', () => {
    const spec = generateInductionWaveform({ showEMF: true }, 'teacher');
    expect(validateDiagramSpec(spec)).toBe(true);
  });

  it('should include flux curve in all modes', () => {
    for (const mode of ['teacher', 'student', 'minimal'] as const) {
      const spec = generateInductionWaveform({ showEMF: true }, mode);
      expect(spec.elements.find((el) => el.id === 'curve-flux')).toBeDefined();
    }
  });

  it('should include EMF curve in teacher mode when showEMF=true', () => {
    const spec = generateInductionWaveform({ showEMF: true }, 'teacher');
    expect(spec.elements.find((el) => el.id === 'curve-emf')).toBeDefined();
  });

  it('should NOT include EMF curve in student mode', () => {
    const spec = generateInductionWaveform({ showEMF: true }, 'student');
    expect(spec.elements.find((el) => el.id === 'curve-emf')).toBeUndefined();
  });

  it('should NOT include EMF curve when showEMF=false', () => {
    const spec = generateInductionWaveform({ showEMF: false }, 'teacher');
    expect(spec.elements.find((el) => el.id === 'curve-emf')).toBeUndefined();
  });

  it('should include axes', () => {
    const spec = generateInductionWaveform({ showEMF: true }, 'teacher');
    expect(spec.elements.find((el) => el.id === 'axis-x')).toBeDefined();
    expect(spec.elements.find((el) => el.id === 'axis-y')).toBeDefined();
  });

  it('should include labels in teacher mode', () => {
    const spec = generateInductionWaveform({ showEMF: true }, 'teacher');
    expect(spec.elements.find((el) => el.id === 'label-flux')).toBeDefined();
    expect(spec.elements.find((el) => el.id === 'label-t')).toBeDefined();
    expect(spec.elements.find((el) => el.id === 'label-emf')).toBeDefined();
  });

  it('should include quarter-period tick marks in teacher mode', () => {
    const spec = generateInductionWaveform({ showEMF: true }, 'teacher');
    const ticks = spec.elements.filter((el) => el.id.startsWith('tick-label-x-'));
    expect(ticks.length).toBe(4);
  });

  it('should use fixed createdAt for determinism', () => {
    const spec = generateInductionWaveform({ showEMF: true }, 'teacher');
    expect(spec.metadata.createdAt).toBe('2026-01-01T00:00:00.000Z');
  });
});
