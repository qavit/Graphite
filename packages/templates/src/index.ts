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
