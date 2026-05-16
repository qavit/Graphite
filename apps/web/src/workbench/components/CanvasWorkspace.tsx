import type { DiagramSpec } from '@graphite/diagram-spec';
import type { CanvasState, TemplateState, UiLocale, WorkbenchValidationReport } from '../types';
import {
  FitIcon,
  GridIcon,
  HandIcon,
  PointerIcon,
  TypeIcon,
  VectorIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from './icons';
import { ToolButton } from './ToolButton';

interface CanvasWorkspaceProps {
  locale: UiLocale;
  spec: DiagramSpec | null;
  svgMarkup: string;
  template: TemplateState;
  canvas: CanvasState;
  validation: WorkbenchValidationReport;
  onInteractionModeChange: (mode: CanvasState['interactionMode']) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onToggleGrid: () => void;
  onToggleLabels: () => void;
  onToggleVectors: () => void;
}

function formatTitle(locale: UiLocale, template: TemplateState) {
  if (locale === 'zh-TW') {
    switch (template.type) {
      case 'inclined':
        return '斜面受力';
      case 'particle':
        return '帶電粒子';
      case 'circuit':
        return '簡單電路';
    }
  }

  switch (template.type) {
    case 'inclined':
      return 'Inclined Plane';
    case 'particle':
      return 'Charged Particle';
    case 'circuit':
      return 'Simple Circuit';
  }

  const exhaustive: never = template;
  return exhaustive;
}

export function CanvasWorkspace({
  locale,
  spec,
  svgMarkup,
  template,
  canvas,
  validation,
  onInteractionModeChange,
  onZoomIn,
  onZoomOut,
  onFit,
  onToggleGrid,
  onToggleLabels,
  onToggleVectors,
}: CanvasWorkspaceProps) {
  const canvasTitle = formatTitle(locale, template);
  const zoomLabel = `${Math.round(canvas.zoom * 100)}%`;

  return (
    <main className="surface surface--canvas">
      <div className="surface__header surface__header--stacked">
        <div>
          <p className="eyebrow">{locale === 'zh-TW' ? '畫布' : 'Canvas'}</p>
          <h1>{spec?.metadata.title ?? canvasTitle}</h1>
        </div>
        <div className="canvas-metrics">
          <span className="metric-chip">
            {spec?.canvas.width ?? 0} × {spec?.canvas.height ?? 0}
          </span>
          <span className="metric-chip">{spec?.elements.length ?? 0} elements</span>
          <span className="metric-chip">{zoomLabel}</span>
        </div>
      </div>

      <div className="canvas-toolbar" role="toolbar" aria-label={locale === 'zh-TW' ? '畫布工具列' : 'Canvas toolbar'}>
        <ToolButton
          icon={<PointerIcon />}
          label={locale === 'zh-TW' ? '選取' : 'Select'}
          shortcut="S"
          active={canvas.interactionMode === 'select'}
          onClick={() => onInteractionModeChange('select')}
        />
        <ToolButton
          icon={<HandIcon />}
          label={locale === 'zh-TW' ? '平移' : 'Pan'}
          shortcut="Space"
          active={canvas.interactionMode === 'pan'}
          onClick={() => onInteractionModeChange('pan')}
        />
        <ToolButton icon={<ZoomInIcon />} label={locale === 'zh-TW' ? '放大' : 'Zoom in'} shortcut="+" onClick={onZoomIn} />
        <ToolButton icon={<ZoomOutIcon />} label={locale === 'zh-TW' ? '縮小' : 'Zoom out'} shortcut="-" onClick={onZoomOut} />
        <ToolButton icon={<FitIcon />} label={locale === 'zh-TW' ? '適合畫布' : 'Fit'} shortcut="0" onClick={onFit} />
        <ToolButton
          icon={<GridIcon />}
          label={locale === 'zh-TW' ? '格線' : 'Grid'}
          shortcut="G"
          active={canvas.showGrid}
          onClick={onToggleGrid}
        />
        <ToolButton
          icon={<TypeIcon />}
          label={locale === 'zh-TW' ? '標註' : 'Labels'}
          shortcut="L"
          active={canvas.showLabels}
          onClick={onToggleLabels}
        />
        <ToolButton
          icon={<VectorIcon />}
          label={locale === 'zh-TW' ? '向量' : 'Vectors'}
          shortcut="V"
          active={canvas.showVectors}
          onClick={onToggleVectors}
        />
      </div>

      <div className="canvas-summary">
        <div className="summary-block">
          <span className="summary-label">{locale === 'zh-TW' ? '模板' : 'Template'}</span>
          <strong>{canvasTitle}</strong>
          <span>{locale === 'zh-TW' ? '以模板為主的教學圖' : 'Template-first teaching diagram'}</span>
        </div>
        <div className="summary-block">
          <span className="summary-label">{locale === 'zh-TW' ? '模式' : 'Mode'}</span>
          <strong>{canvas.interactionMode === 'select' ? (locale === 'zh-TW' ? '選取' : 'Select') : (locale === 'zh-TW' ? '平移' : 'Pan')}</strong>
          <span>{locale === 'zh-TW' ? '畫布互動模式' : 'Canvas interaction mode'}</span>
        </div>
        <div className="summary-block">
          <span className="summary-label">{locale === 'zh-TW' ? '驗證' : 'Validation'}</span>
          <strong>{validation.status === 'success' ? 'OK' : 'Review'}</strong>
          <span>{validation.summary}</span>
        </div>
      </div>

      <div className="canvas-stage">
        {spec ? (
          <div className="paper-frame">
            <div className="paper-content" aria-label="SVG preview" dangerouslySetInnerHTML={{ __html: svgMarkup }} />
          </div>
        ) : (
          <div className="error-state">
            <strong>{locale === 'zh-TW' ? '圖形生成失敗。' : 'Diagram generation failed.'}</strong>
            <span>{locale === 'zh-TW' ? '請檢查參數設定。' : 'Check the current parameter values.'}</span>
          </div>
        )}
      </div>
    </main>
  );
}
