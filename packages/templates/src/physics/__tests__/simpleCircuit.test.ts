import { describe, it, expect } from 'vitest';
import {
  generateSimpleCircuit,
  simpleCircuitPresets,
  type SeriesCircuitParams,
  type ParallelCircuitParams,
} from '../simpleCircuit';
import { validateDiagramSpec } from '@graphite/diagram-spec';

describe('Simple Circuit Template', () => {
  // ── Series ──────────────────────────────────────────────────────────────────

  describe('series circuit', () => {
    it('generates valid DiagramSpec for full series circuit', () => {
      const params = simpleCircuitPresets.seriesFull();
      const spec = generateSimpleCircuit(params, 'teacher');

      expect(validateDiagramSpec(spec)).toBe(true);
      expect(spec.metadata.locale).toBe('zh-TW');
      expect(spec.view.mode).toBe('teacher');
      expect(spec.view.theme).toBe('exam-bw');
      expect(spec.canvas.width).toBe(600);
      expect(spec.canvas.height).toBe(500);
    });

    it('includes battery, switch, resistor, bulb components', () => {
      const params = simpleCircuitPresets.seriesFull();
      const spec = generateSimpleCircuit(params, 'teacher');

      const comps = spec.elements.filter(el => el.type === 'circuit-component') as any[];
      const types = comps.map(c => c.componentType);
      expect(types).toContain('battery');
      expect(types).toContain('switch-closed');
      expect(types).toContain('resistor');
      expect(types).toContain('bulb');
    });

    it('uses switch-open when switchClosed is false', () => {
      const params = simpleCircuitPresets.seriesOpenSwitch();
      const spec = generateSimpleCircuit(params, 'teacher');

      const sw = spec.elements.find(el => (el as any).componentType === 'switch-open');
      expect(sw).toBeDefined();
    });

    it('omits switch when hasSwitch is false', () => {
      const params: SeriesCircuitParams = {
        ...simpleCircuitPresets.seriesMinimal(),
        hasSwitch: false,
      };
      const spec = generateSimpleCircuit(params, 'teacher');

      const sw = spec.elements.find(
        el => (el as any).componentType === 'switch-open' || (el as any).componentType === 'switch-closed'
      );
      expect(sw).toBeUndefined();
    });

    it('omits bulb when hasBulb is false', () => {
      const params = simpleCircuitPresets.seriesMinimal();
      const spec = generateSimpleCircuit(params, 'teacher');

      const bulb = spec.elements.find(el => (el as any).componentType === 'bulb');
      expect(bulb).toBeUndefined();
    });

    it('includes connecting wires', () => {
      const params = simpleCircuitPresets.seriesFull();
      const spec = generateSimpleCircuit(params, 'teacher');

      const wires = spec.elements.filter(el => el.type === 'line');
      expect(wires.length).toBeGreaterThan(4); // at least 4 circuit sides
    });

    it('generates consistent specs for same params', () => {
      const params = simpleCircuitPresets.seriesFull();
      const spec1 = generateSimpleCircuit(params, 'teacher');
      const spec2 = generateSimpleCircuit(params, 'teacher');

      expect(spec1.elements.length).toBe(spec2.elements.length);
      spec1.elements.forEach((el, i) => {
        expect(el.id).toBe(spec2.elements[i].id);
        expect(el.type).toBe(spec2.elements[i].type);
      });
    });

    it('supports en-US locale', () => {
      const params: SeriesCircuitParams = {
        ...simpleCircuitPresets.seriesFull(),
        labelLocale: 'en-US',
      };
      const spec = generateSimpleCircuit(params, 'teacher');

      expect(spec.metadata.locale).toBe('en-US');
      expect(spec.metadata.title).toContain('Series');
    });

    it('generates valid spec in student mode', () => {
      const params = simpleCircuitPresets.seriesFull();
      const spec = generateSimpleCircuit(params, 'student');

      expect(validateDiagramSpec(spec)).toBe(true);
      expect(spec.view.mode).toBe('student');
    });

    it('generates valid spec in minimal mode', () => {
      const params = simpleCircuitPresets.seriesMinimal();
      const spec = generateSimpleCircuit(params, 'minimal');

      expect(validateDiagramSpec(spec)).toBe(true);
    });
  });

  // ── Parallel ─────────────────────────────────────────────────────────────────

  describe('parallel circuit', () => {
    it('generates valid DiagramSpec for parallel resistor+bulb', () => {
      const params = simpleCircuitPresets.parallelResistorBulb();
      const spec = generateSimpleCircuit(params, 'teacher');

      expect(validateDiagramSpec(spec)).toBe(true);
      expect(spec.metadata.title).toContain('並聯');
    });

    it('includes battery and both branch components', () => {
      const params = simpleCircuitPresets.parallelResistorBulb();
      const spec = generateSimpleCircuit(params, 'teacher');

      const comps = spec.elements.filter(el => el.type === 'circuit-component') as any[];
      const types = comps.map(c => c.componentType);
      expect(types).toContain('battery');
      expect(types).toContain('resistor');
      expect(types).toContain('bulb');
    });

    it('includes junction dots', () => {
      const params = simpleCircuitPresets.parallelResistorBulb();
      const spec = generateSimpleCircuit(params, 'teacher');

      const dots = spec.elements.filter(el => el.id?.startsWith('junc-'));
      expect(dots.length).toBe(4);
    });

    it('generates valid spec for two-resistor parallel', () => {
      const params = simpleCircuitPresets.parallelTwoResistors();
      const spec = generateSimpleCircuit(params, 'teacher');

      expect(validateDiagramSpec(spec)).toBe(true);
      const comps = spec.elements.filter(el => el.type === 'circuit-component') as any[];
      const resistors = comps.filter(c => c.componentType === 'resistor');
      expect(resistors.length).toBe(2);
    });
  });
});
