import { describe, it, expect } from 'vitest';
import { generateFieldLines } from '../fieldLines';
import { validateDiagramSpec } from '@graphite/diagram-spec';

describe('Electric Field Lines Template', () => {
  it('should generate a valid DiagramSpec for positive charge', () => {
    const spec = generateFieldLines({ chargeSign: 'positive' }, 'teacher');
    expect(validateDiagramSpec(spec)).toBe(true);
  });

  it('should generate a valid DiagramSpec for negative charge', () => {
    const spec = generateFieldLines({ chargeSign: 'negative' }, 'teacher');
    expect(validateDiagramSpec(spec)).toBe(true);
  });

  it('should include a charge circle', () => {
    const spec = generateFieldLines({ chargeSign: 'positive' }, 'teacher');
    const circle = spec.elements.find((el) => el.id === 'charge-circle');
    expect(circle).toBeDefined();
    expect((circle as any).label).toBe('+');
  });

  it('should include 8 radial field lines', () => {
    const spec = generateFieldLines({ chargeSign: 'positive' }, 'teacher');
    const lines = spec.elements.filter((el) => el.id.startsWith('field-line-'));
    expect(lines.length).toBe(8);
  });

  it('should show charge label in teacher mode', () => {
    const spec = generateFieldLines({ chargeSign: 'positive' }, 'teacher');
    expect(spec.elements.find((el) => el.id === 'label-charge')).toBeDefined();
  });

  it('should not show charge label in student mode', () => {
    const spec = generateFieldLines({ chargeSign: 'positive' }, 'student');
    expect(spec.elements.find((el) => el.id === 'label-charge')).toBeUndefined();
  });

  it('should show field lines in minimal mode', () => {
    const spec = generateFieldLines({ chargeSign: 'positive' }, 'minimal');
    const lines = spec.elements.filter((el) => el.id.startsWith('field-line-'));
    expect(lines.length).toBe(8);
  });

  it('should use fixed createdAt for determinism', () => {
    const spec = generateFieldLines({ chargeSign: 'positive' }, 'teacher');
    expect(spec.metadata.createdAt).toBe('2026-01-01T00:00:00.000Z');
  });
});
