/**
 * 針對新元素類型的渲染邏輯擴展
 */
import { DiagramElement } from '@graphite/diagram-spec';

// 在現有的 renderElement 函數內新增對 grid 和 function-curve 的處理
export function renderNewElements(el: DiagramElement): string {
  switch (el.type) {
    case 'grid':
      const lines: string[] = [];
      for (let x = el.xMin; x <= el.xMax; x += el.stepX) {
        lines.push(`<line x1="${x}" y1="${el.yMin}" x2="${x}" y2="${el.yMax}" stroke="#ddd" stroke-width="1" />`);
      }
      for (let y = el.yMin; y <= el.yMax; y += el.stepY) {
        lines.push(`<line x1="${el.xMin}" y1="${y}" x2="${el.xMax}" y2="${y}" stroke="#ddd" stroke-width="1" />`);
      }
      return lines.join('\n');

    case 'function-curve':
      const pathPoints: string[] = [];
      const dx = (el.domain[1] - el.domain[0]) / el.points;
      for (let i = 0; i <= el.points; i++) {
        const x = el.domain[0] + i * dx;
        const y = el.fn(x);
        pathPoints.push(`${x},${y}`);
      }
      return `<polyline points="${pathPoints.join(' ')}" fill="none" stroke="black" stroke-width="2" />`;

    default:
      return '';
  }
}
