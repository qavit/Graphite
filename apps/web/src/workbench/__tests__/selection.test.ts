import { describe, it, expect } from 'vitest';
import type { DiagramSpec } from '@graphite/diagram-spec';
import { renderToSVG } from '@graphite/render-svg';
import { resolveSelectableElementId, findSelectedForceVector } from '../selection';

const base = { visibility: ['teacher', 'student', 'minimal'] } as const;
const spec = {
  version: '1.0',
  metadata: { title: 't' },
  canvas: { width: 100, height: 100, viewBox: [0, 0, 100, 100] },
  view: { mode: 'teacher', theme: 'light' },
  elements: [
    { ...base, id: 'force-a', type: 'force-vector', start: { x: 0, y: 0 }, end: { x: 10, y: 10 }, forceName: 'mg', showMagnitude: false },
    { ...base, id: 'lbl', type: 'label', position: { x: 5, y: 5 }, text: 'hi' },
  ],
} as unknown as DiagramSpec;

const target = (id: string | null): EventTarget =>
  ({ closest: () => (id ? { getAttribute: () => id } : null) }) as unknown as EventTarget;

describe('resolveSelectableElementId', () => {
  it('accepts a force-vector present in the spec', () => {
    expect(resolveSelectableElementId(target('force-a'), spec)).toBe('force-a');
  });
  it('rejects ids unknown to the spec', () => {
    expect(resolveSelectableElementId(target('ghost-force'), spec)).toBeNull();
  });
  it('rejects non force-vector types', () => {
    expect(resolveSelectableElementId(target('lbl'), spec)).toBeNull();
  });
  it('returns null for empty targets', () => {
    expect(resolveSelectableElementId(null, spec)).toBeNull();
    expect(resolveSelectableElementId(target(null), spec)).toBeNull();
    expect(resolveSelectableElementId(target('force-a'), null)).toBeNull();
  });
  it('findSelectedForceVector looks up from spec', () => {
    expect(findSelectedForceVector(spec, 'force-a')?.forceName).toBe('mg');
    expect(findSelectedForceVector(spec, 'lbl')).toBeNull();
    expect(findSelectedForceVector(spec, null)).toBeNull();
  });
});

describe('renderer semantic identifiers', () => {
  it('force-vector SVG carries element id and type', () => {
    const svg = renderToSVG(spec);
    expect(svg).toContain('data-element-id="force-a"');
    expect(svg).toContain('data-element-type="force-vector"');
  });
  it('is deterministic regardless of selection (selection is not an input)', () => {
    expect(renderToSVG(spec)).toBe(renderToSVG(spec));
  });
});
