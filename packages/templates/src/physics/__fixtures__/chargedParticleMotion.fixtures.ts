import { ChargedParticleParams } from '../chargedParticleMotion';

export const fixture_magnetic_into_positive: ChargedParticleParams = {
  fieldType: 'magnetic',
  fieldDirection: 'into-page',
  chargeSign: 'positive',
  showTrajectory: true,
  showForceVector: true,
  showVelocityVector: true,
  analysisScenario: 'simple',
  labelLocale: 'zh-TW',
};

export const fixture_magnetic_out_negative: ChargedParticleParams = {
  fieldType: 'magnetic',
  fieldDirection: 'out-of-page',
  chargeSign: 'negative',
  showTrajectory: true,
  showForceVector: true,
  showVelocityVector: true,
  analysisScenario: 'simple',
  labelLocale: 'zh-TW',
};

export const fixture_electric_upward_positive: ChargedParticleParams = {
  fieldType: 'electric',
  fieldDirection: 'upward',
  chargeSign: 'positive',
  showTrajectory: true,
  showForceVector: true,
  showVelocityVector: true,
  analysisScenario: 'simple',
  labelLocale: 'zh-TW',
};

export const fixture_electric_downward_negative: ChargedParticleParams = {
  fieldType: 'electric',
  fieldDirection: 'downward',
  chargeSign: 'negative',
  showTrajectory: true,
  showForceVector: true,
  showVelocityVector: true,
  analysisScenario: 'simple',
  labelLocale: 'zh-TW',
};

export const fixture_magnetic_detailed: ChargedParticleParams = {
  fieldType: 'magnetic',
  fieldDirection: 'into-page',
  chargeSign: 'positive',
  showTrajectory: true,
  showForceVector: true,
  showVelocityVector: true,
  analysisScenario: 'detailed',
  labelLocale: 'zh-TW',
};

export const chargedParticleFixtures = [
  fixture_magnetic_into_positive,
  fixture_magnetic_out_negative,
  fixture_electric_upward_positive,
  fixture_electric_downward_negative,
  fixture_magnetic_detailed,
];
