import { DiagramSpec, DiagramElement, ViewMode } from '@graphite/diagram-spec';
import { renderNewElements } from './extra-renderers';

/**
 * 核心渲染函數：將 DiagramSpec 轉換為 SVG 字串
 */
export function renderToSVG(spec: DiagramSpec): string {
  const { width, height, viewBox } = spec.canvas;
  const { mode } = spec.view;

  // 過濾在當前模式下不可見的元件
  const visibleElements = spec.elements.filter(el => 
    el.visibility.includes(mode)
  );

  const svgContent = visibleElements.map(el => renderElement(el, mode)).join('\n');

  return `
<svg 
  width="${width}" 
  height="${height}" 
  viewBox="${viewBox.join(' ')}" 
  xmlns="http://www.w3.org/2000/svg"
  class="graphite-diagram theme-${spec.view.theme}"
>
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="black" />
    </marker>
  </defs>
  <rect width="100%" height="100%" fill="white" />
  ${svgContent}
</svg>`.trim();
}

function renderElement(el: DiagramElement, mode: ViewMode): string {
  const newEl = renderNewElements(el);
  if (newEl) return newEl;

  const commonAttrs = `id="${el.id}" stroke="${el.style?.stroke || 'black'}" stroke-width="${el.style?.strokeWidth || 1.5}" fill="${el.style?.fill || 'none'}" stroke-dasharray="${el.style?.strokeDasharray || ''}"`;
  
  let transform = '';
  if (el.rotation !== undefined) {
    const cx = el.rotationCenter?.x ?? 0;
    const cy = el.rotationCenter?.y ?? 0;
    transform = ` transform="rotate(${el.rotation} ${cx} ${cy})"`;
  }

  switch (el.type) {
    case 'line':
      return `<line x1="${el.start.x}" y1="${el.start.y}" x2="${el.end.x}" y2="${el.end.y}" ${commonAttrs}${transform} />`;

    case 'arrow':
    case 'force-vector':
      return `<line x1="${el.start.x}" y1="${el.start.y}" x2="${el.end.x}" y2="${el.end.y}" ${commonAttrs}${transform} marker-end="url(#arrowhead)" />`;

    case 'label':
      return `
<text 
  x="${el.position.x}" 
  y="${el.position.y}" 
  fill="black" 
  font-family="sans-serif" 
  font-size="${el.fontSize || 14}" 
  text-anchor="${el.anchor || 'middle'}"
  ${transform}
>
  ${el.text}
</text>`.trim();

    case 'box':
      // For box, if rotationCenter is not provided, we should probably default to its center
      const boxTransform = el.rotation !== undefined && !el.rotationCenter 
        ? ` transform="rotate(${el.rotation} ${el.position.x + el.width / 2} ${el.position.y + el.height / 2})"`
        : transform;
        
      return `
<rect 
  x="${el.position.x}" 
  y="${el.position.y}" 
  width="${el.width}" 
  height="${el.height}" 
  ${commonAttrs}${boxTransform}
/>
${el.label ? `<text x="${el.position.x + el.width / 2}" y="${el.position.y + el.height / 2 + 5}" font-size="12" text-anchor="middle"${boxTransform}>${el.label}</text>` : ''}
`.trim();

    default:
      return `<!-- Unsupported element type: ${(el as any).type} -->`;
  }
}
