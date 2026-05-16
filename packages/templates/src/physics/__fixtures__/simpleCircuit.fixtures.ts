import { generateSimpleCircuit, simpleCircuitPresets } from '../simpleCircuit';
import type { DiagramSpec } from '@graphite/diagram-spec';

export const fixture_circuit_series_full = (): DiagramSpec =>
  generateSimpleCircuit(simpleCircuitPresets.seriesFull(), 'teacher');

export const fixture_circuit_series_minimal = (): DiagramSpec =>
  generateSimpleCircuit(simpleCircuitPresets.seriesMinimal(), 'teacher');

export const fixture_circuit_series_open_switch = (): DiagramSpec =>
  generateSimpleCircuit(simpleCircuitPresets.seriesOpenSwitch(), 'teacher');

export const fixture_circuit_parallel_resistor_bulb = (): DiagramSpec =>
  generateSimpleCircuit(simpleCircuitPresets.parallelResistorBulb(), 'teacher');

export const fixture_circuit_parallel_two_resistors = (): DiagramSpec =>
  generateSimpleCircuit(simpleCircuitPresets.parallelTwoResistors(), 'teacher');
