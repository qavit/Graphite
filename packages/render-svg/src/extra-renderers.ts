/**
 * 針對新元素類型的渲染邏輯擴展
 */
import { DiagramElement } from '@graphite/diagram-spec';

export function renderNewElements(el: DiagramElement): string {
  switch (el.type) {
    case 'circle': {
      const stroke = el.style?.stroke || 'black';
      const fill = el.style?.fill || 'white';
      const sw = el.style?.strokeWidth || 2;
      const outer = `<circle cx="${el.center.x}" cy="${el.center.y}" r="${el.radius}" stroke="${stroke}" stroke-width="${sw}" fill="${fill}" />`;
      if (!el.label) return outer;
      const label = `<text x="${el.center.x}" y="${el.center.y + el.radius * 0.4}" text-anchor="middle" font-size="${el.radius * 1.2}" font-family="sans-serif" fill="${stroke}">${el.label}</text>`;
      return `${outer}\n${label}`;
    }

    case 'arc-path': {
      const { center, radius, startAngle, endAngle, sweep, showArrowhead } = el;
      const stroke = el.style?.stroke || 'black';
      const sw = el.style?.strokeWidth || 2;
      const dash = el.style?.strokeDasharray || '';

      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const startX = center.x + radius * Math.cos(toRad(startAngle));
      const startY = center.y + radius * Math.sin(toRad(startAngle));
      const endX = center.x + radius * Math.cos(toRad(endAngle));
      const endY = center.y + radius * Math.sin(toRad(endAngle));

      // Compute arc span in the sweep direction (always a positive value)
      let span: number;
      if (sweep === 'clockwise') {
        span = ((endAngle - startAngle) % 360 + 360) % 360;
      } else {
        span = ((startAngle - endAngle) % 360 + 360) % 360;
      }
      const largeArc = span > 180 ? 1 : 0;
      const sweepFlag = sweep === 'clockwise' ? 1 : 0;

      const marker = showArrowhead ? ' marker-end="url(#arrowhead)"' : '';
      const dashAttr = dash ? ` stroke-dasharray="${dash}"` : '';
      return `<path d="M ${startX.toFixed(2)} ${startY.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} ${sweepFlag} ${endX.toFixed(2)} ${endY.toFixed(2)}" stroke="${stroke}" stroke-width="${sw}" fill="none"${dashAttr}${marker} />`;
    }

    case 'field-symbol': {
      const { center, size, direction } = el;
      const stroke = el.style?.stroke || 'black';
      const sw = el.style?.strokeWidth || 1.5;
      const outer = `<circle cx="${center.x}" cy="${center.y}" r="${size}" stroke="${stroke}" stroke-width="${sw}" fill="none" />`;
      let inner: string;
      if (direction === 'out-of-page') {
        // ⊙: filled dot
        inner = `<circle cx="${center.x}" cy="${center.y}" r="${(size * 0.25).toFixed(2)}" fill="${stroke}" />`;
      } else {
        // ⊗: × cross
        const d = size * 0.6;
        inner = [
          `<line x1="${(center.x - d).toFixed(2)}" y1="${(center.y - d).toFixed(2)}" x2="${(center.x + d).toFixed(2)}" y2="${(center.y + d).toFixed(2)}" stroke="${stroke}" stroke-width="${sw}" />`,
          `<line x1="${(center.x + d).toFixed(2)}" y1="${(center.y - d).toFixed(2)}" x2="${(center.x - d).toFixed(2)}" y2="${(center.y + d).toFixed(2)}" stroke="${stroke}" stroke-width="${sw}" />`,
        ].join('\n');
      }
      return `${outer}\n${inner}`;
    }

    case 'circuit-component': {
      return renderCircuitComponent(el);
    }

    case 'grid': {
      const lines: string[] = [];
      for (let x = el.xMin; x <= el.xMax; x += el.stepX) {
        lines.push(`<line x1="${x}" y1="${el.yMin}" x2="${x}" y2="${el.yMax}" stroke="#ddd" stroke-width="1" />`);
      }
      for (let y = el.yMin; y <= el.yMax; y += el.stepY) {
        lines.push(`<line x1="${el.xMin}" y1="${y}" x2="${el.xMax}" y2="${y}" stroke="#ddd" stroke-width="1" />`);
      }
      return lines.join('\n');
    }

    case 'function-curve': {
      const pathPoints: string[] = [];
      const dx = (el.domain[1] - el.domain[0]) / el.points;
      for (let i = 0; i <= el.points; i++) {
        const x = el.domain[0] + i * dx;
        const y = el.fn(x);
        pathPoints.push(`${x.toFixed(2)},${y.toFixed(2)}`);
      }
      return `<polyline points="${pathPoints.join(' ')}" fill="none" stroke="black" stroke-width="2" />`;
    }

    default:
      return '';
  }
}

// ── Circuit component renderer ────────────────────────────────────────────────
// Each component is rendered centered at (cx, cy).
// Wires connect at cx ± CIRCUIT_HALF_WIDTH for horizontal orientation,
// cy ± CIRCUIT_HALF_WIDTH for vertical.
export const CIRCUIT_HALF_WIDTH = 25;

import { CircuitComponentElement } from '@graphite/diagram-spec';

function renderCircuitComponent(el: CircuitComponentElement): string {
  const { center: { x: cx, y: cy }, componentType, orientation, value } = el;
  const sw = el.style?.strokeWidth ?? 2;
  const stroke = el.style?.stroke ?? 'black';
  const hw = CIRCUIT_HALF_WIDTH;
  const parts: string[] = [];

  const line = (x1: number, y1: number, x2: number, y2: number, w = sw) =>
    `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${stroke}" stroke-width="${w}" fill="none"/>`;

  const horiz = orientation === 'horizontal';

  // Helper: coordinates along "along" and "across" the wire
  const A = (a: number, b: number): [number, number] => horiz ? [cx + a, cy + b] : [cx + b, cy + a];

  switch (componentType) {
    case 'battery': {
      // IEC single-cell: long line = positive (toward wire start), short = negative
      // Lead wires to ±hw, terminal lines at ±7
      const [lx1, ly1] = A(-hw, 0); const [lx2, ly2] = A(-7, 0);
      const [rx1, ry1] = A(7, 0);   const [rx2, ry2] = A(hw, 0);
      parts.push(line(lx1, ly1, lx2, ly2)); // left lead
      parts.push(line(rx1, ry1, rx2, ry2)); // right lead
      // Long line (positive)
      const [p1x, p1y] = A(-7, -14); const [p2x, p2y] = A(-7, 14);
      parts.push(line(p1x, p1y, p2x, p2y, 2));
      // Short line (negative)
      const [n1x, n1y] = A(7, -9); const [n2x, n2y] = A(7, 9);
      parts.push(line(n1x, n1y, n2x, n2y, 2));
      // + / − labels (small)
      const [plx, ply] = A(-7, horiz ? -18 : -18);
      const [nlx, nly] = A(7, horiz ? -13 : -13);
      parts.push(`<text x="${plx.toFixed(1)}" y="${ply.toFixed(1)}" text-anchor="middle" font-size="11" font-family="sans-serif" fill="${stroke}">+</text>`);
      parts.push(`<text x="${nlx.toFixed(1)}" y="${nly.toFixed(1)}" text-anchor="middle" font-size="11" font-family="sans-serif" fill="${stroke}">−</text>`);
      break;
    }

    case 'resistor': {
      // IEC: rectangle 40×16 centered on wire
      const [lx1, ly1] = A(-hw, 0); const [lx2, ly2] = A(-20, 0);
      const [rx1, ry1] = A(20, 0);  const [rx2, ry2] = A(hw, 0);
      parts.push(line(lx1, ly1, lx2, ly2));
      parts.push(line(rx1, ry1, rx2, ry2));
      // Rectangle
      const [bx, by] = A(-20, -9);
      const rectW = 40, rectH = 18;
      const [finalW, finalH] = horiz ? [rectW, rectH] : [rectH, rectW];
      parts.push(`<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${finalW}" height="${finalH}" stroke="${stroke}" stroke-width="${sw}" fill="white"/>`);
      break;
    }

    case 'bulb': {
      const r = 15;
      const [lx1, ly1] = A(-hw, 0); const [lx2, ly2] = A(-r, 0);
      const [rx1, ry1] = A(r, 0);   const [rx2, ry2] = A(hw, 0);
      parts.push(line(lx1, ly1, lx2, ly2));
      parts.push(line(rx1, ry1, rx2, ry2));
      parts.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}" stroke="${stroke}" stroke-width="${sw}" fill="white"/>`);
      // Cross inside
      const d = r * 0.6;
      parts.push(line(cx - d, cy - d, cx + d, cy + d));
      parts.push(line(cx + d, cy - d, cx - d, cy + d));
      break;
    }

    case 'switch-open': {
      const pivotOffset = 12;
      const [lx1, ly1] = A(-hw, 0);  const [lx2, ly2] = A(-pivotOffset, 0);
      const [rx1, ry1] = A(pivotOffset, 0); const [rx2, ry2] = A(hw, 0);
      parts.push(line(lx1, ly1, lx2, ly2));
      parts.push(line(rx1, ry1, rx2, ry2));
      // Pivot and end dots
      parts.push(`<circle cx="${lx2.toFixed(1)}" cy="${ly2.toFixed(1)}" r="2.5" fill="${stroke}"/>`);
      parts.push(`<circle cx="${rx1.toFixed(1)}" cy="${ry1.toFixed(1)}" r="2.5" fill="${stroke}"/>`);
      // Open blade (angled ~25° toward the "up" / "left" direction)
      const [bx, by] = A(-pivotOffset, 0);
      const [ex, ey] = A(pivotOffset - 4, horiz ? -13 : -13);
      parts.push(line(bx, by, ex, ey));
      break;
    }

    case 'switch-closed': {
      const pivotOffset = 12;
      const [lx1, ly1] = A(-hw, 0);  const [lx2, ly2] = A(-pivotOffset, 0);
      const [rx1, ry1] = A(pivotOffset, 0); const [rx2, ry2] = A(hw, 0);
      parts.push(line(lx1, ly1, lx2, ly2));
      parts.push(line(rx1, ry1, rx2, ry2));
      parts.push(`<circle cx="${lx2.toFixed(1)}" cy="${ly2.toFixed(1)}" r="2.5" fill="${stroke}"/>`);
      parts.push(`<circle cx="${rx1.toFixed(1)}" cy="${ry1.toFixed(1)}" r="2.5" fill="${stroke}"/>`);
      parts.push(line(lx2, ly2, rx1, ry1)); // closed blade
      break;
    }

    case 'ammeter':
    case 'voltmeter': {
      const r = 15;
      const [lx1, ly1] = A(-hw, 0); const [lx2, ly2] = A(-r, 0);
      const [rx1, ry1] = A(r, 0);   const [rx2, ry2] = A(hw, 0);
      parts.push(line(lx1, ly1, lx2, ly2));
      parts.push(line(rx1, ry1, rx2, ry2));
      parts.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}" stroke="${stroke}" stroke-width="${sw}" fill="white"/>`);
      const letter = componentType === 'ammeter' ? 'A' : 'V';
      parts.push(`<text x="${cx.toFixed(1)}" y="${(cy + 5).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="bold" font-family="sans-serif" fill="${stroke}">${letter}</text>`);
      break;
    }
  }

  // Optional value label below/beside the component
  if (value) {
    const [vlx, vly] = A(0, horiz ? 30 : 30);
    parts.push(`<text x="${vlx.toFixed(1)}" y="${vly.toFixed(1)}" text-anchor="middle" font-size="12" font-family="sans-serif" fill="${stroke}">${value}</text>`);
  }

  return parts.join('\n');
}
