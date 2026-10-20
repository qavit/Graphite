import type { DiagramSpec } from '@graphite/diagram-spec';

export { applyDiagramEditIntent, type DiagramEditIntent } from '@graphite/diagram-spec';

/**
 * Session-local editing projection over a generated spec. `baseKey` identifies the
 * generated spec the edit was made against; any change to the source invalidates it.
 */
export interface InteractiveOverride {
  baseKey: string;
  spec: DiagramSpec;
}

export function specKey(spec: DiagramSpec | null): string {
  return spec ? JSON.stringify(spec) : '';
}

export function resolveDisplaySpec(generated: DiagramSpec | null, override: InteractiveOverride | null): DiagramSpec | null {
  if (!generated) return null;
  return override && override.baseKey === specKey(generated) ? override.spec : generated;
}
