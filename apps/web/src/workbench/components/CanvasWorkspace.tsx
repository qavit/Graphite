import { useCallback, useRef } from 'react';
import type { DiagramSpec } from '@graphite/diagram-spec';
import { createTranslator } from '../i18n';
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
  const t = createTranslator(locale);
  const canvasTitle = formatTitle(locale, template);
  const zoomLabel = `${Math.round(canvas.zoom * 100)}%`;
  const stageRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<{ startX: number; startY: number; scrollLeft: number; scrollTop: number } | null>(null);

  const handleStageMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (canvas.interactionMode !== 'pan' || !stageRef.current) return;
    e.preventDefault();
    const el = stageRef.current;
    panRef.current = { startX: e.clientX, startY: e.clientY, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop };

    const onMouseMove = (ev: MouseEvent) => {
      if (!panRef.current || !stageRef.current) return;
      stageRef.current.scrollLeft = panRef.current.scrollLeft - (ev.clientX - panRef.current.startX);
      stageRef.current.scrollTop  = panRef.current.scrollTop  - (ev.clientY - panRef.current.startY);
    };
    const onMouseUp = () => {
      panRef.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [canvas.interactionMode]);

  return (
    <main className="surface surface--canvas">
      <div className="canvas-header">
        <h1 className="canvas-header__title">{spec?.metadata.title ?? canvasTitle}</h1>
        <div className="canvas-metrics">
          <button type="button" className="metric-chip metric-chip--button" title={t('fitCanvas') + ' (0)'} onClick={onFit}>
            {zoomLabel}
          </button>
        </div>
      </div>

      <div className="canvas-toolbar" role="toolbar" aria-label={t('canvasLabel')}>
        {/* Tool group — mutually exclusive interaction mode */}
        <div className="toolbar-group toolbar-group--segmented" role="group">
          <ToolButton
            icon={<PointerIcon />}
            label={t('selectMode')}
            shortcut="S"
            active={canvas.interactionMode === 'select'}
            iconOnly
            onClick={() => onInteractionModeChange('select')}
          />
          <ToolButton
            icon={<HandIcon />}
            label={t('panMode')}
            shortcut="H"
            active={canvas.interactionMode === 'pan'}
            iconOnly
            onClick={() => onInteractionModeChange('pan')}
          />
        </div>

        {/* View group — zoom controls */}
        <div className="toolbar-group" role="group">
          <ToolButton icon={<ZoomInIcon />} label={t('zoomIn')} shortcut="+" iconOnly onClick={onZoomIn} />
          <ToolButton icon={<ZoomOutIcon />} label={t('zoomOut')} shortcut="-" iconOnly onClick={onZoomOut} />
          <ToolButton icon={<FitIcon />} label={t('fitCanvas')} shortcut="0" iconOnly onClick={onFit} />
        </div>

        {/* Overlay group — independent display toggles */}
        <div className="toolbar-group" role="group">
          <ToolButton icon={<GridIcon />} label={t('grid')} shortcut="G" active={canvas.showGrid} iconOnly onClick={onToggleGrid} />
          <ToolButton icon={<TypeIcon />} label={t('labels')} shortcut="L" active={canvas.showLabels} iconOnly onClick={onToggleLabels} />
          <ToolButton icon={<VectorIcon />} label={t('vectors')} shortcut="V" active={canvas.showVectors} iconOnly onClick={onToggleVectors} />
        </div>
      </div>


      <div
        ref={stageRef}
        className={`canvas-stage${canvas.showGrid ? ' canvas-stage--grid' : ''}${canvas.interactionMode === 'pan' ? ' canvas-stage--pan' : ''}`}
        onMouseDown={handleStageMouseDown}
      >
        {spec ? (
          <div
            style={{
              width: spec.canvas.width * canvas.zoom,
              height: spec.canvas.height * canvas.zoom,
              flexShrink: 0,
            }}
          >
            <div
              className="paper-frame"
              style={{
                transform: `scale(${canvas.zoom})`,
                transformOrigin: 'top left',
                width: spec.canvas.width,
                height: spec.canvas.height,
              }}
            >
              <div className="paper-content" aria-label="SVG preview" dangerouslySetInnerHTML={{ __html: svgMarkup }} />
            </div>
          </div>
        ) : (
          <div className="error-state">
            <strong>{t('diagramFailed')}</strong>
            <span>{t('diagramFailedHint')}</span>
          </div>
        )}
      </div>
    </main>
  );
}
