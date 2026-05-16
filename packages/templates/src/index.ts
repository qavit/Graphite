/**
 * Graphite Physics Templates
 * Domain-specific STEM diagram templates for Taiwan high school physics
 */

// Physics - Inclined Plane
export {
  generateInclinedPlane,
  inclinedPlanePresets,
  type InclinedPlaneParams,
} from './physics/inclinedPlane';

// Physics - Charged Particle Motion in EM Field (Task 010)
export {
  generateChargedParticleMotion,
  chargedParticlePresets,
  type ChargedParticleParams,
} from './physics/chargedParticleMotion';

// Physics - Simple Circuit Diagrams (Task 011)
export {
  generateSimpleCircuit,
  simpleCircuitPresets,
  type SimpleCircuitParams,
  type SeriesCircuitParams,
  type ParallelCircuitParams,
} from './physics/simpleCircuit';

// Golden fixtures for testing
export {
  inclinedPlaneFixtures,
  inclinedPlaneTestCases,
  fixture_30deg_teacher_simple,
  fixture_45deg_teacher_friction,
  fixture_30deg_student_blank,
  fixture_60deg_teacher_simple,
  fixture_30deg_minimal,
} from './physics/__fixtures__/inclinedPlane.fixtures';
