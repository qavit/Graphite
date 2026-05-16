import { describe, it, expect } from 'vitest';
import {
  generateInclinedPlane,
  inclinedPlanePresets,
  type InclinedPlaneParams,
} from '../inclinedPlane';
import { validateDiagramSpec } from '@graphite/diagram-spec';

describe('Inclined Plane Template', () => {
  it('should generate a valid DiagramSpec for 30° teacher mode', () => {
    const params: InclinedPlaneParams = {
      angle: 30,
      showLabels: true,
      labelLocale: 'zh-TW',
      analysisScenario: 'simple',
    };
    const spec = generateInclinedPlane(params, 'teacher');

    expect(validateDiagramSpec(spec)).toBe(true);
    expect(spec.metadata.version).toBe('0.1');
    expect(spec.metadata.locale).toBe('zh-TW');
    expect(spec.view.mode).toBe('teacher');
    expect(spec.view.theme).toBe('exam-bw');
  });

  it('should generate a valid DiagramSpec for 45° student mode', () => {
    const params: InclinedPlaneParams = {
      angle: 45,
      showLabels: false,
      labelLocale: 'zh-TW',
      analysisScenario: 'simple',
    };
    const spec = generateInclinedPlane(params, 'student');

    expect(validateDiagramSpec(spec)).toBe(true);
    expect(spec.view.mode).toBe('student');
  });

  it('should include force vectors in teacher mode', () => {
    const params: InclinedPlaneParams = {
      angle: 30,
      showLabels: true,
      labelLocale: 'zh-TW',
      analysisScenario: 'simple',
    };
    const spec = generateInclinedPlane(params, 'teacher');

    const forceVectors = spec.elements.filter((el) => el.type === 'force-vector');
    expect(forceVectors.length).toBeGreaterThan(0);
    expect(forceVectors.some((f) => (f as any).forceName.includes('重力'))).toBe(true);
    expect(forceVectors.some((f) => (f as any).forceName.includes('正向力'))).toBe(true);
  });

  it('should exclude force labels in student mode', () => {
    const params: InclinedPlaneParams = {
      angle: 30,
      showLabels: true,
      labelLocale: 'zh-TW',
      analysisScenario: 'simple',
    };
    const spec = generateInclinedPlane(params, 'student');

    const teacherOnlyElements = spec.elements.filter(
      (el) => !el.visibility.includes('student')
    );
    expect(teacherOnlyElements.length).toBe(0);
  });

  it('should include friction force in friction variant', () => {
    const params: InclinedPlaneParams = {
      angle: 30,
      showLabels: true,
      labelLocale: 'zh-TW',
      analysisScenario: 'friction',
    };
    const spec = generateInclinedPlane(params, 'teacher');

    const frictionForce = spec.elements.find((el) => (el as any).id === 'force-friction');
    expect(frictionForce).toBeDefined();
  });

  it('should not include friction force in simple variant', () => {
    const params: InclinedPlaneParams = {
      angle: 30,
      showLabels: true,
      labelLocale: 'zh-TW',
      analysisScenario: 'simple',
    };
    const spec = generateInclinedPlane(params, 'teacher');

    const frictionForce = spec.elements.find((el) => (el as any).id === 'force-friction');
    expect(frictionForce).toBeUndefined();
  });

  it('should have correct canvas dimensions', () => {
    const params: InclinedPlaneParams = {
      angle: 30,
      showLabels: true,
      labelLocale: 'zh-TW',
      analysisScenario: 'simple',
    };
    const spec = generateInclinedPlane(params, 'teacher');

    expect(spec.canvas.width).toBe(600);
    expect(spec.canvas.height).toBe(500);
    expect(spec.canvas.viewBox[0]).toBe(0);
    expect(spec.canvas.viewBox[1]).toBe(0);
  });

  it('should support English locale', () => {
    const params: InclinedPlaneParams = {
      angle: 30,
      showLabels: true,
      labelLocale: 'en-US',
      analysisScenario: 'simple',
    };
    const spec = generateInclinedPlane(params, 'teacher');

    expect(spec.metadata.locale).toBe('en-US');
    expect(spec.metadata.title).toContain('Inclined Plane FBD');
  });

  it('should support preset configurations', () => {
    const teacherPreset = inclinedPlanePresets.teacherSimple(30);
    const spec = generateInclinedPlane(teacherPreset, 'teacher');

    expect(validateDiagramSpec(spec)).toBe(true);
    expect(spec.view.mode).toBe('teacher');
  });

  it('should generate consistent specs for same params', () => {
    const params: InclinedPlaneParams = {
      angle: 30,
      showLabels: true,
      labelLocale: 'zh-TW',
      analysisScenario: 'simple',
    };

    const spec1 = generateInclinedPlane(params, 'teacher');
    const spec2 = generateInclinedPlane(params, 'teacher');

    // Compare element counts and types
    expect(spec1.elements.length).toBe(spec2.elements.length);
    spec1.elements.forEach((el1, i) => {
      const el2 = spec2.elements[i];
      expect(el1.type).toBe(el2.type);
      expect(el1.id).toBe(el2.id);
    });
  });

  it('should handle extreme angles (near 0°)', () => {
    const params: InclinedPlaneParams = {
      angle: 5,
      showLabels: true,
      labelLocale: 'zh-TW',
      analysisScenario: 'simple',
    };
    const spec = generateInclinedPlane(params, 'teacher');

    expect(validateDiagramSpec(spec)).toBe(true);
    expect(spec.elements.length).toBeGreaterThan(0);
  });

  it('should handle extreme angles (near 90°)', () => {
    const params: InclinedPlaneParams = {
      angle: 85,
      showLabels: true,
      labelLocale: 'zh-TW',
      analysisScenario: 'simple',
    };
    const spec = generateInclinedPlane(params, 'teacher');

    expect(validateDiagramSpec(spec)).toBe(true);
    expect(spec.elements.length).toBeGreaterThan(0);
  });
});
