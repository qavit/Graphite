import { describe, it, expect } from 'vitest';
import { renderToSVG } from '../renderer';
import { validateAgainstGolden, validateMultiple, generateReport } from '../golden-tester';
import {
  fixture_circuit_series_full,
  fixture_circuit_series_minimal,
  fixture_circuit_series_open_switch,
  fixture_circuit_parallel_resistor_bulb,
  fixture_circuit_parallel_two_resistors,
} from '@graphite/templates';
import path from 'path';

const goldenDir = path.join(__dirname, '../__fixtures__');

describe('Golden Figure Testing - Simple Circuit', () => {
  it('renders series-full circuit to SVG', () => {
    const spec = fixture_circuit_series_full();
    const svg = renderToSVG(spec);
    expect(svg).toContain('<svg');
    expect(svg).toContain('graphite-diagram');
    expect(svg).toContain('line');
  });

  it('matches golden file for series-full', () => {
    const svg = renderToSVG(fixture_circuit_series_full());
    const result = validateAgainstGolden('circuit-series-full', svg, goldenDir, {
      updateGolden: process.env.UPDATE_GOLDEN === 'true',
    });
    if (!result.passed) console.log(`[Golden] ${result.message}`);
    expect(result.passed).toBe(true);
  });

  it('matches golden file for series-minimal', () => {
    const svg = renderToSVG(fixture_circuit_series_minimal());
    const result = validateAgainstGolden('circuit-series-minimal', svg, goldenDir, {
      updateGolden: process.env.UPDATE_GOLDEN === 'true',
    });
    expect(result.passed).toBe(true);
  });

  it('matches golden file for series-open-switch', () => {
    const svg = renderToSVG(fixture_circuit_series_open_switch());
    const result = validateAgainstGolden('circuit-series-open-switch', svg, goldenDir, {
      updateGolden: process.env.UPDATE_GOLDEN === 'true',
    });
    expect(result.passed).toBe(true);
  });

  it('matches golden file for parallel-resistor-bulb', () => {
    const svg = renderToSVG(fixture_circuit_parallel_resistor_bulb());
    const result = validateAgainstGolden('circuit-parallel-resistor-bulb', svg, goldenDir, {
      updateGolden: process.env.UPDATE_GOLDEN === 'true',
    });
    expect(result.passed).toBe(true);
  });

  it('matches golden file for parallel-two-resistors', () => {
    const svg = renderToSVG(fixture_circuit_parallel_two_resistors());
    const result = validateAgainstGolden('circuit-parallel-two-resistors', svg, goldenDir, {
      updateGolden: process.env.UPDATE_GOLDEN === 'true',
    });
    expect(result.passed).toBe(true);
  });

  it('validates all circuit presets in batch', () => {
    const diagrams = [
      { id: 'circuit-series-full', svg: renderToSVG(fixture_circuit_series_full()) },
      { id: 'circuit-series-minimal', svg: renderToSVG(fixture_circuit_series_minimal()) },
      { id: 'circuit-series-open-switch', svg: renderToSVG(fixture_circuit_series_open_switch()) },
      { id: 'circuit-parallel-resistor-bulb', svg: renderToSVG(fixture_circuit_parallel_resistor_bulb()) },
      { id: 'circuit-parallel-two-resistors', svg: renderToSVG(fixture_circuit_parallel_two_resistors()) },
    ];
    const results = validateMultiple(diagrams, goldenDir, {
      updateGolden: process.env.UPDATE_GOLDEN === 'true',
    });
    console.log(generateReport(results));
    expect(results.every((r) => r.passed)).toBe(true);
  });
});
