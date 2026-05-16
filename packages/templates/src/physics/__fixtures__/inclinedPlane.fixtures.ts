/**
 * Golden Examples (Fixtures) for Inclined Plane Template
 * These are canonical diagrams used for visual regression testing
 */

import { generateInclinedPlane, type InclinedPlaneParams } from '../inclinedPlane';
import type { DiagramSpec } from '@graphite/diagram-spec';

/**
 * Golden Example 1: 30° angle, teacher mode, simple variant
 * Standard physics problem: block on 30° incline
 */
export const fixture_30deg_teacher_simple = (): DiagramSpec => {
  const params: InclinedPlaneParams = {
    angle: 30,
    showLabels: true,
    labelLocale: 'zh-TW',
    analysisScenario: 'simple',
  };
  return generateInclinedPlane(params, 'teacher');
};

/**
 * Golden Example 2: 45° angle, teacher mode with friction
 * Common exam problem: 45° incline with friction forces
 */
export const fixture_45deg_teacher_friction = (): DiagramSpec => {
  const params: InclinedPlaneParams = {
    angle: 45,
    showLabels: true,
    labelLocale: 'zh-TW',
    analysisScenario: 'friction',
  };
  return generateInclinedPlane(params, 'teacher');
};

/**
 * Golden Example 3: 30° angle, student mode (blank)
 * Worksheet version without force labels for students to solve
 */
export const fixture_30deg_student_blank = (): DiagramSpec => {
  const params: InclinedPlaneParams = {
    angle: 30,
    showLabels: false,
    labelLocale: 'zh-TW',
    analysisScenario: 'simple',
  };
  return generateInclinedPlane(params, 'student');
};

/**
 * Golden Example 4: 60° angle, teacher mode, simple variant
 * High-angle problem for advanced students
 */
export const fixture_60deg_teacher_simple = (): DiagramSpec => {
  const params: InclinedPlaneParams = {
    angle: 60,
    showLabels: true,
    labelLocale: 'zh-TW',
    analysisScenario: 'simple',
  };
  return generateInclinedPlane(params, 'teacher');
};

/**
 * Golden Example 5: Minimal mode (30°)
 * Reduced diagram for embedded use or slides
 */
export const fixture_30deg_minimal = (): DiagramSpec => {
  const params: InclinedPlaneParams = {
    angle: 30,
    showLabels: false,
    labelLocale: 'zh-TW',
    analysisScenario: 'simple',
  };
  return generateInclinedPlane(params, 'minimal');
};

/**
 * Collection of all golden fixtures
 */
export const inclinedPlaneFixtures = {
  '30deg-teacher-simple': fixture_30deg_teacher_simple,
  '45deg-teacher-friction': fixture_45deg_teacher_friction,
  '30deg-student-blank': fixture_30deg_student_blank,
  '60deg-teacher-simple': fixture_60deg_teacher_simple,
  '30deg-minimal': fixture_30deg_minimal,
};

/**
 * Test data for parametric testing
 */
export const inclinedPlaneTestCases = [
  {
    angle: 15,
    locale: 'zh-TW' as const,
    variant: 'simple' as const,
    modes: ['teacher', 'student', 'minimal'] as const,
  },
  {
    angle: 30,
    locale: 'zh-TW' as const,
    variant: 'simple' as const,
    modes: ['teacher', 'student', 'minimal'] as const,
  },
  {
    angle: 45,
    locale: 'zh-TW' as const,
    variant: 'friction' as const,
    modes: ['teacher', 'student'] as const,
  },
  {
    angle: 60,
    locale: 'zh-TW' as const,
    variant: 'advanced' as const,
    modes: ['teacher'] as const,
  },
  {
    angle: 30,
    locale: 'en-US' as const,
    variant: 'simple' as const,
    modes: ['teacher'] as const,
  },
];
