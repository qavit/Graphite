import { describe, it, expect } from 'vitest';
import {
  generateChargedParticleMotion,
  chargedParticlePresets,
  type ChargedParticleParams,
} from '../chargedParticleMotion';
import { validateDiagramSpec } from '@graphite/diagram-spec';

describe('Charged Particle Motion Template', () => {
  it('generates valid spec for magnetic field (into-page, positive charge)', () => {
    const params = chargedParticlePresets.magneticIntoPagePositive();
    const spec = generateChargedParticleMotion(params, 'teacher');

    expect(validateDiagramSpec(spec)).toBe(true);
    expect(spec.metadata.locale).toBe('zh-TW');
    expect(spec.view.mode).toBe('teacher');
    expect(spec.view.theme).toBe('exam-bw');
    expect(spec.canvas.width).toBe(600);
    expect(spec.canvas.height).toBe(500);
  });

  it('generates valid spec for electric field (upward, positive charge)', () => {
    const params = chargedParticlePresets.electricUpwardPositive();
    const spec = generateChargedParticleMotion(params, 'teacher');

    expect(validateDiagramSpec(spec)).toBe(true);
  });

  it('includes field symbols for magnetic field', () => {
    const params = chargedParticlePresets.magneticIntoPagePositive();
    const spec = generateChargedParticleMotion(params, 'teacher');

    const fieldSymbols = spec.elements.filter(el => el.type === 'field-symbol');
    expect(fieldSymbols.length).toBeGreaterThan(0);
    expect((fieldSymbols[0] as any).direction).toBe('into-page');
  });

  it('includes out-of-page field symbols when fieldDirection is out-of-page', () => {
    const params = chargedParticlePresets.magneticOutOfPageNegative();
    const spec = generateChargedParticleMotion(params, 'teacher');

    const fieldSymbols = spec.elements.filter(el => el.type === 'field-symbol');
    expect((fieldSymbols[0] as any).direction).toBe('out-of-page');
  });

  it('includes arc trajectory for magnetic field', () => {
    const params = chargedParticlePresets.magneticIntoPagePositive();
    const spec = generateChargedParticleMotion(params, 'teacher');

    const arc = spec.elements.find(el => el.id === 'trajectory');
    expect(arc).toBeDefined();
    expect(arc?.type).toBe('arc-path');
  });

  it('includes parabolic trajectory for electric field', () => {
    const params = chargedParticlePresets.electricUpwardPositive();
    const spec = generateChargedParticleMotion(params, 'teacher');

    const curve = spec.elements.find(el => el.id === 'trajectory');
    expect(curve).toBeDefined();
    expect(curve?.type).toBe('function-curve');
  });

  it('includes particle circle with correct charge label', () => {
    const positiveParams = chargedParticlePresets.magneticIntoPagePositive();
    const positiveSpec = generateChargedParticleMotion(positiveParams, 'teacher');
    const positiveParticle = positiveSpec.elements.find(el => el.id === 'particle') as any;
    expect(positiveParticle?.label).toBe('+');

    const negativeParams = chargedParticlePresets.magneticOutOfPageNegative();
    const negativeSpec = generateChargedParticleMotion(negativeParams, 'teacher');
    const negativeParticle = negativeSpec.elements.find(el => el.id === 'particle') as any;
    expect(negativeParticle?.label).toBe('−');
  });

  it('includes force vector in teacher mode', () => {
    const params = chargedParticlePresets.magneticIntoPagePositive();
    const spec = generateChargedParticleMotion(params, 'teacher');

    const force = spec.elements.find(el => el.id === 'force-mag');
    expect(force).toBeDefined();
    expect(force?.type).toBe('force-vector');
    expect(force?.visibility).toContain('teacher');
  });

  it('excludes force vector from student-only visibility', () => {
    const params = chargedParticlePresets.magneticIntoPagePositive();
    const spec = generateChargedParticleMotion(params, 'student');

    // Force vector is teacher-only; should not appear when filtered by student mode
    const visibleForce = spec.elements.find(
      el => el.id === 'force-mag' && el.visibility.includes('student')
    );
    expect(visibleForce).toBeUndefined();
  });

  it('includes velocity vector when showVelocityVector is true', () => {
    const params: ChargedParticleParams = {
      ...chargedParticlePresets.magneticIntoPagePositive(),
      showVelocityVector: true,
    };
    const spec = generateChargedParticleMotion(params, 'teacher');

    const vel = spec.elements.find(el => el.id === 'velocity');
    expect(vel).toBeDefined();
  });

  it('excludes velocity vector when showVelocityVector is false', () => {
    const params: ChargedParticleParams = {
      ...chargedParticlePresets.magneticIntoPagePositive(),
      showVelocityVector: false,
    };
    const spec = generateChargedParticleMotion(params, 'teacher');

    const vel = spec.elements.find(el => el.id === 'velocity');
    expect(vel).toBeUndefined();
  });

  it('detailed scenario includes radius formula label', () => {
    const params = chargedParticlePresets.magneticDetailed();
    const spec = generateChargedParticleMotion(params, 'teacher');

    const radiusLabel = spec.elements.find(el => el.id === 'label-radius') as any;
    expect(radiusLabel).toBeDefined();
    expect(radiusLabel?.text).toContain('r =');
  });

  it('generates consistent specs for identical params', () => {
    const params = chargedParticlePresets.magneticIntoPagePositive();
    const spec1 = generateChargedParticleMotion(params, 'teacher');
    const spec2 = generateChargedParticleMotion(params, 'teacher');

    expect(spec1.elements.length).toBe(spec2.elements.length);
    spec1.elements.forEach((el, i) => {
      expect(el.id).toBe(spec2.elements[i].id);
      expect(el.type).toBe(spec2.elements[i].type);
    });
  });

  it('supports en-US locale', () => {
    const params: ChargedParticleParams = {
      ...chargedParticlePresets.magneticIntoPagePositive(),
      labelLocale: 'en-US',
    };
    const spec = generateChargedParticleMotion(params, 'teacher');

    expect(spec.metadata.locale).toBe('en-US');
    expect(spec.metadata.title).toContain('Magnetic Field');
  });

  it('minimal mode hides trajectory', () => {
    const params = chargedParticlePresets.magneticIntoPagePositive();
    const spec = generateChargedParticleMotion(params, 'minimal');

    const arc = spec.elements.find(el => el.id === 'trajectory');
    // Trajectory element exists but its visibility does not include 'minimal'
    if (arc) {
      expect(arc.visibility).not.toContain('minimal');
    }
  });
});
