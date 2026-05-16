import type { DiagramElement, DiagramSpec } from '@graphite/diagram-spec';
import type { WorkbenchDocument, WorkbenchValidationItem, WorkbenchValidationReport } from './types';

function boundsForElement(element: DiagramElement): { xMin: number; yMin: number; xMax: number; yMax: number } | null {
  switch (element.type) {
    case 'line':
    case 'arrow':
    case 'force-vector':
      return {
        xMin: Math.min(element.start.x, element.end.x),
        yMin: Math.min(element.start.y, element.end.y),
        xMax: Math.max(element.start.x, element.end.x),
        yMax: Math.max(element.start.y, element.end.y),
      };
    case 'label': {
      const fontSize = element.fontSize ?? 14;
      const width = Math.max(24, element.text.length * fontSize * 0.58);
      const height = fontSize * 1.4;
      const anchorOffset = element.anchor === 'start' ? 0 : element.anchor === 'end' ? width : width / 2;
      return {
        xMin: element.position.x - anchorOffset,
        yMin: element.position.y - height,
        xMax: element.position.x - anchorOffset + width,
        yMax: element.position.y,
      };
    }
    case 'box':
      return {
        xMin: element.position.x,
        yMin: element.position.y,
        xMax: element.position.x + element.width,
        yMax: element.position.y + element.height,
      };
    case 'circle':
      return {
        xMin: element.center.x - element.radius,
        yMin: element.center.y - element.radius,
        xMax: element.center.x + element.radius,
        yMax: element.center.y + element.radius,
      };
    case 'arc-path':
      return {
        xMin: element.center.x - element.radius,
        yMin: element.center.y - element.radius,
        xMax: element.center.x + element.radius,
        yMax: element.center.y + element.radius,
      };
    case 'field-symbol':
      return {
        xMin: element.center.x - element.size,
        yMin: element.center.y - element.size,
        xMax: element.center.x + element.size,
        yMax: element.center.y + element.size,
      };
    case 'circuit-component': {
      const halfWidth = element.orientation === 'horizontal' ? 40 : 18;
      const halfHeight = element.orientation === 'horizontal' ? 18 : 40;
      return {
        xMin: element.center.x - halfWidth,
        yMin: element.center.y - halfHeight,
        xMax: element.center.x + halfWidth,
        yMax: element.center.y + halfHeight,
      };
    }
    case 'coordinate-axis':
    case 'grid':
    case 'function-curve':
      return null;
    default:
      return null;
  }
}

function withinCanvas(element: DiagramElement, spec: DiagramSpec, margin = 10): boolean {
  const bounds = boundsForElement(element);
  if (!bounds) {
    return true;
  }

  const [minX, minY, width, height] = spec.canvas.viewBox;
  const maxX = minX + width;
  const maxY = minY + height;
  return (
    bounds.xMin >= minX - margin &&
    bounds.yMin >= minY - margin &&
    bounds.xMax <= maxX + margin &&
    bounds.yMax <= maxY + margin
  );
}

function buildSemanticNote(document: WorkbenchDocument): WorkbenchValidationItem {
  switch (document.template.type) {
    case 'inclined':
      return document.template.angle >= 0 && document.template.angle <= 90
        ? {
            id: 'physics',
            severity: 'success',
            title: 'Physics semantics',
            detail: 'Inclined plane angle is within the expected teaching range.',
          }
        : {
            id: 'physics',
            severity: 'warning',
            title: 'Physics semantics',
            detail: 'Inclined plane angle is outside the usual 0° to 90° range.',
          };
    case 'particle': {
      const fieldIsMagnetic = document.template.fieldType === 'magnetic';
      const directionMatches = fieldIsMagnetic
        ? document.template.fieldDirection === 'into-page' || document.template.fieldDirection === 'out-of-page'
        : document.template.fieldDirection === 'upward' || document.template.fieldDirection === 'downward';

      return directionMatches
        ? {
            id: 'physics',
            severity: 'success',
            title: 'Physics semantics',
            detail: 'Field type and direction are consistent for the selected particle scenario.',
          }
        : {
            id: 'physics',
            severity: 'warning',
            title: 'Physics semantics',
            detail: 'Field direction does not match the selected field type.',
          };
    }
    case 'circuit':
      return {
        id: 'physics',
        severity: 'success',
        title: 'Physics semantics',
        detail: 'Circuit preset maps to a known classroom diagram family.',
      };
  }
}

export function buildValidationReport(document: WorkbenchDocument, spec: DiagramSpec): WorkbenchValidationReport {
  const syntaxOk = typeof spec.metadata.title === 'string' && spec.metadata.title.length > 0 && spec.elements.length > 0;
  const syntaxItem: WorkbenchValidationItem = syntaxOk
    ? {
        id: 'syntax',
        severity: 'success',
        title: 'SVG syntax',
        detail: 'Renderer produced a diagram with metadata and drawable elements.',
      }
    : {
        id: 'syntax',
        severity: 'warning',
        title: 'SVG syntax',
        detail: 'Diagram metadata or drawable elements are missing.',
      };

  const outOfBounds = spec.elements.filter((element) => !withinCanvas(element, spec));
  const boundsItem: WorkbenchValidationItem =
    outOfBounds.length === 0
      ? {
          id: 'bounds',
          severity: 'success',
          title: 'Bounds',
          detail: 'All tracked elements sit within the canvas margin.',
        }
      : {
          id: 'bounds',
          severity: 'warning',
          title: 'Bounds',
          detail: `${outOfBounds.length} element(s) sit close to or beyond the canvas margin.`,
        };

  const labelCount = spec.elements.filter((element) => element.type === 'label').length;
  const labelsItem: WorkbenchValidationItem =
    labelCount > 0
      ? {
          id: 'labels',
          severity: 'success',
          title: 'Labels',
          detail: `${labelCount} label element(s) are visible in the current document.`,
        }
      : {
          id: 'labels',
          severity: 'warning',
          title: 'Labels',
          detail: 'No visible labels are present in this view.',
        };

  const physicsItem = buildSemanticNote(document);
  const items = [syntaxItem, boundsItem, labelsItem, physicsItem];
  const hasWarning = items.some((item) => item.severity === 'warning');

  return {
    status: hasWarning ? 'warning' : 'success',
    summary: hasWarning ? 'Some review points need attention.' : 'All checks passed.',
    items,
  };
}
