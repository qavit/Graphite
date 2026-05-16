import { describe, it, expect } from 'vitest';
import { buildValidationReport } from '../validation';
import { buildDiagramSpec, createDefaultDocument } from '../document';

function makeSpec() {
  const doc = createDefaultDocument();
  return { doc, spec: buildDiagramSpec(doc) };
}

describe('buildValidationReport', () => {
  it('returns success status for a valid inclined document', () => {
    const { doc, spec } = makeSpec();
    const report = buildValidationReport(doc, spec);
    expect(report.status).toBe('success');
    expect(report.items.length).toBeGreaterThan(0);
  });

  it('contains syntax, bounds, labels, and physics items', () => {
    const { doc, spec } = makeSpec();
    const report = buildValidationReport(doc, spec);
    const ids = report.items.map((item) => item.id);
    expect(ids).toContain('syntax');
    expect(ids).toContain('bounds');
    expect(ids).toContain('labels');
    expect(ids).toContain('physics');
  });

  it('reports warning for inclined angle > 90', () => {
    const doc = createDefaultDocument();
    if (doc.template.type === 'inclined') {
      const badDoc = { ...doc, template: { ...doc.template, angle: 120 } };
      const spec = buildDiagramSpec(badDoc);
      const report = buildValidationReport(badDoc, spec);
      const physicsItem = report.items.find((item) => item.id === 'physics');
      expect(physicsItem?.severity).toBe('warning');
    }
  });

  it('reports success for inclined angle within 0-90', () => {
    const doc = createDefaultDocument();
    const spec = buildDiagramSpec(doc);
    const report = buildValidationReport(doc, spec);
    const physicsItem = report.items.find((item) => item.id === 'physics');
    expect(physicsItem?.severity).toBe('success');
  });

  it('reports warning when field type and direction are inconsistent for particle', () => {
    const doc = createDefaultDocument();
    const particleDoc = {
      ...doc,
      template: {
        type: 'particle' as const,
        fieldType: 'magnetic' as const,
        fieldDirection: 'upward' as const,
        chargeSign: 'positive' as const,
        showTrajectory: true,
        showForceVector: true,
        showVelocityVector: true,
        analysisScenario: 'detailed' as const,
      },
    };
    const spec = buildDiagramSpec(particleDoc);
    const report = buildValidationReport(particleDoc, spec);
    const physicsItem = report.items.find((item) => item.id === 'physics');
    expect(physicsItem?.severity).toBe('warning');
    expect(report.status).toBe('warning');
  });

  it('reports success when field type and direction are consistent for particle', () => {
    const doc = createDefaultDocument();
    const particleDoc = {
      ...doc,
      template: {
        type: 'particle' as const,
        fieldType: 'magnetic' as const,
        fieldDirection: 'into-page' as const,
        chargeSign: 'positive' as const,
        showTrajectory: true,
        showForceVector: true,
        showVelocityVector: true,
        analysisScenario: 'detailed' as const,
      },
    };
    const spec = buildDiagramSpec(particleDoc);
    const report = buildValidationReport(particleDoc, spec);
    const physicsItem = report.items.find((item) => item.id === 'physics');
    expect(physicsItem?.severity).toBe('success');
  });

  it('reports success for a circuit template', () => {
    const doc = { ...createDefaultDocument(), template: { type: 'circuit' as const, preset: 'seriesFull' as const } };
    const spec = buildDiagramSpec(doc);
    const report = buildValidationReport(doc, spec);
    const physicsItem = report.items.find((item) => item.id === 'physics');
    expect(physicsItem?.severity).toBe('success');
  });

  it('overall status is warning when any item is warning', () => {
    const { doc, spec } = makeSpec();
    const badDoc = { ...doc, template: { ...doc.template as Extract<typeof doc.template, { type: 'inclined' }>, angle: 120 } };
    const badSpec = buildDiagramSpec(badDoc);
    const report = buildValidationReport(badDoc, badSpec);
    expect(report.status).toBe('warning');
    expect(report.summary).toBeTruthy();
  });
});
