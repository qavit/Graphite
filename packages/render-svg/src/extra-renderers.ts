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
