import { DiagramSpec } from './types';

/**
 * 簡易的 DiagramSpec 驗證器 (v0.1)
 * 確保傳入的物件符合基礎結構需求。
 */
export function validateDiagramSpec(spec: any): spec is DiagramSpec {
  if (!spec || typeof spec !== 'object') return false;
  
  // 檢查 Metadata
  if (!spec.metadata || spec.metadata.version !== '0.1') {
    console.error('Invalid version: only v0.1 is supported');
    return false;
  }

  // 檢查 Canvas
  if (!spec.canvas || typeof spec.canvas.width !== 'number') return false;

  // 檢查 Elements 是否為陣列
  if (!Array.isArray(spec.elements)) return false;

  return true;
}
