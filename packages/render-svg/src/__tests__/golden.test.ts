import { describe, it, expect, beforeAll } from 'vitest';
import { renderToSVG } from '../renderer';
import {
  validateAgainstGolden,
  validateMultiple,
  generateReport,
  normalizeSVG,
  compareSVG,
} from '../golden-tester';
import {
  fixture_30deg_teacher_simple,
  fixture_45deg_teacher_friction,
  fixture_30deg_student_blank,
  fixture_60deg_teacher_simple,
  fixture_30deg_minimal,
} from '@graphite/templates';
import path from 'path';

const goldenDir = path.join(__dirname, '../__fixtures__');

describe('Golden Figure Testing - Inclined Plane', () => {
  it('should render 30° teacher simple variant to SVG', () => {
    const spec = fixture_30deg_teacher_simple();
    const svg = renderToSVG(spec);

    expect(svg).toBeDefined();
    expect(svg).toContain('<svg');
    expect(svg).toContain('graphite-diagram');
    expect(svg).toContain('30');
  });

  it('should match golden file for 30° teacher simple', () => {
    const spec = fixture_30deg_teacher_simple();
    const svg = renderToSVG(spec);

    const result = validateAgainstGolden(
      '30deg-teacher-simple',
      svg,
      goldenDir,
      { updateGolden: process.env.UPDATE_GOLDEN === 'true' }
    );

    if (!result.passed) {
      console.log(`[Golden Test] ${result.message}`);
    }

    expect(result.passed).toBe(true);
  });

  it('should match golden file for 45° with friction', () => {
    const spec = fixture_45deg_teacher_friction();
    const svg = renderToSVG(spec);

    const result = validateAgainstGolden(
      '45deg-teacher-friction',
      svg,
      goldenDir,
      { updateGolden: process.env.UPDATE_GOLDEN === 'true' }
    );

    expect(result.passed).toBe(true);
  });

  it('should match golden file for 30° student blank', () => {
    const spec = fixture_30deg_student_blank();
    const svg = renderToSVG(spec);

    const result = validateAgainstGolden(
      '30deg-student-blank',
      svg,
      goldenDir,
      { updateGolden: process.env.UPDATE_GOLDEN === 'true' }
    );

    expect(result.passed).toBe(true);
  });

  it('should match golden file for 60° teacher simple', () => {
    const spec = fixture_60deg_teacher_simple();
    const svg = renderToSVG(spec);

    const result = validateAgainstGolden(
      '60deg-teacher-simple',
      svg,
      goldenDir,
      { updateGolden: process.env.UPDATE_GOLDEN === 'true' }
    );

    expect(result.passed).toBe(true);
  });

  it('should match golden file for minimal mode', () => {
    const spec = fixture_30deg_minimal();
    const svg = renderToSVG(spec);

    const result = validateAgainstGolden(
      '30deg-minimal',
      svg,
      goldenDir,
      { updateGolden: process.env.UPDATE_GOLDEN === 'true' }
    );

    expect(result.passed).toBe(true);
  });

  it('should validate multiple diagrams in batch', () => {
    const diagrams = [
      { id: '30deg-teacher-simple', svg: renderToSVG(fixture_30deg_teacher_simple()) },
      { id: '45deg-teacher-friction', svg: renderToSVG(fixture_45deg_teacher_friction()) },
      { id: '30deg-student-blank', svg: renderToSVG(fixture_30deg_student_blank()) },
      { id: '60deg-teacher-simple', svg: renderToSVG(fixture_60deg_teacher_simple()) },
      { id: '30deg-minimal', svg: renderToSVG(fixture_30deg_minimal()) },
    ];

    const results = validateMultiple(
      diagrams,
      goldenDir,
      { updateGolden: process.env.UPDATE_GOLDEN === 'true' }
    );

    expect(results).toHaveLength(5);
    expect(results.every(r => r.passed)).toBe(true);

    const report = generateReport(results);
    console.log(report);
  });

  describe('SVG Comparison', () => {
    it('should normalize SVG for comparison', () => {
      const svg1 = '<svg>\n  <line x1="0" y1="0" />\n</svg>';
      const svg2 = '<svg><line x1="0" y1="0"/></svg>';

      const norm1 = normalizeSVG(svg1);
      const norm2 = normalizeSVG(svg2);

      expect(norm1).toBe(norm2);
    });

    it('should detect matching SVGs after normalization', () => {
      const svg1 = `
        <svg>
          <line x1="0" y1="0" x2="10" y2="10" />
          <circle cx="5" cy="5" r="3" />
        </svg>
      `;

      const svg2 = `<svg><line x1="0" y1="0" x2="10" y2="10"/><circle cx="5" cy="5" r="3"/></svg>`;

      const comparison = compareSVG(svg1, svg2);
      expect(comparison.match).toBe(true);
    });

    it('should detect different SVGs', () => {
      const svg1 = '<svg><line x1="0" y1="0" x2="10" y2="10" /></svg>';
      const svg2 = '<svg><line x1="0" y1="0" x2="20" y2="20" /></svg>';

      const comparison = compareSVG(svg1, svg2);
      expect(comparison.match).toBe(false);
    });
  });

  describe('Report Generation', () => {
    it('should generate a readable test report', () => {
      const results = [
        { passed: true, fixtureId: 'test-1', message: 'OK' },
        { passed: true, fixtureId: 'test-2', message: 'OK' },
        { passed: false, fixtureId: 'test-3', message: 'Failed', diffLines: 5 },
      ];

      const report = generateReport(results);

      expect(report).toContain('Total: 3');
      expect(report).toContain('Passed: 2');
      expect(report).toContain('Failed: 1');
      expect(report).toContain('✅');
      expect(report).toContain('❌');
    });
  });
});
