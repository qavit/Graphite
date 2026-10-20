import { describe, it, expect } from 'vitest';
import type { DiagramSpec } from '@graphite/diagram-spec';
import { renderToSVG } from '../renderer';
import { escapeXml } from '../escape';

const vis = ['teacher', 'student', 'minimal'];
const spec = (elements: unknown[]) =>
  ({ metadata: { title: 't' }, canvas: { width: 10, height: 10, viewBox: [0, 0, 10, 10] }, view: { mode: 'teacher', theme: 'exam-bw' }, elements }) as unknown as DiagramSpec;
const evil = '</text><script>alert(1)</script>&"\'';

describe('SVG text escaping', () => {
  it('escapeXml handles the five special characters', () => {
    expect(escapeXml(`<&>"'`)).toBe('&lt;&amp;&gt;&quot;&#39;');
  });
  it('escapes label, box label, circle label and circuit value', () => {
    const svg = renderToSVG(spec([
      { id: 'l', type: 'label', visibility: vis, position: { x: 1, y: 1 }, text: evil },
      { id: 'b', type: 'box', visibility: vis, position: { x: 1, y: 1 }, width: 2, height: 2, label: evil },
      { id: 'c', type: 'circle', visibility: vis, center: { x: 5, y: 5 }, radius: 2, label: evil },
      { id: 'r', type: 'circuit-component', visibility: vis, componentType: 'resistor', center: { x: 5, y: 5 }, orientation: 'horizontal', value: evil },
    ]));
    expect(svg).not.toContain('<script');
    expect(svg).not.toContain('</text><');
    expect(svg).toContain('&lt;/text&gt;&lt;script&gt;');
  });
  it('escapes ids and style strings in attributes', () => {
    const svg = renderToSVG(spec([
      { id: 'a" onload="x', type: 'force-vector', visibility: vis, start: { x: 0, y: 0 }, end: { x: 1, y: 1 }, forceName: 'f', showMagnitude: false, style: { stroke: 'red" onclick="y' } },
    ]));
    expect(svg).not.toMatch(/ onload="x"/);
    expect(svg).not.toMatch(/ onclick="y"/);
    expect(svg).toContain('data-element-id="a&quot; onload=&quot;x"');
  });
  it('leaves ordinary text, including CJK and θ, unchanged', () => {
    const svg = renderToSVG(spec([{ id: 'l', type: 'label', visibility: vis, position: { x: 1, y: 1 }, text: '正向力 (N = mg cos θ)' }]));
    expect(svg).toContain('正向力 (N = mg cos θ)');
  });
});
