import { useCallback, useEffect, useRef } from 'react';
import type { DiagramSpec } from '@graphite/diagram-spec';
import { createTranslator } from '../i18n';
import { resolveSelectableElementId, findSelectedForceVector } from '../selection';
import type { DiagramEditIntent } from '../interaction';
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
  selectedElementId: string | null;
  onElementSelect: (elementId: string | null) => void;
  onElementEdit: (intent: DiagramEditIntent) => void;
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
      case 'vector-superposition':
        return '向量疊加';
      case 'field-lines':
        return '電力線';
      case 'induction-waveform':
        return '電磁感應波形';
    }
  }

  switch (template.type) {
    case 'inclined':
      return 'Inclined Plane';
    case 'particle':
      return 'Charged Particle';
    case 'circuit':
      return 'Simple Circuit';
    case 'vector-superposition':
      return 'Vector Superposition';
    case 'field-lines':
      return 'Electric Field Lines';
    case 'induction-waveform':
      return 'Induction Waveform';
  }
}

export function CanvasWorkspace({
  locale,
  spec,
  svgMarkup,
  template,
  canvas,
  validation,
  selectedElementId,
  onElementSelect,
  onElementEdit,
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
  const paperRef = useRef<HTMLDivElement>(null);
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

  const suppressClickRef = useRef(false);

  // Pointer (client) -> DiagramSpec coordinate via the live SVG's own screen CTM.
  const toSpecPoint = useCallback((clientX: number, clientY: number) => {
    const svg = paperRef.current?.querySelector('svg');
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const p = svg.createSVGPoint();
    p.x = clientX;
    p.y = clientY;
    const local = p.matrixTransform(ctm.inverse());
    return Number.isFinite(local.x) && Number.isFinite(local.y) ? { x: local.x, y: local.y } : null;
  }, []);

  const handleStagePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (canvas.interactionMode !== 'select' || e.button !== 0) return;
    const handle = (e.target as Element).closest?.('[data-graphite-handle]');
    const elementId = handle?.getAttribute('data-element-id');
    if (!elementId || elementId !== selectedElementId || !findSelectedForceVector(spec, elementId)) return;
    e.preventDefault();
    let moved = false;
    const onMove = (ev: PointerEvent) => {
      const point = toSpecPoint(ev.clientX, ev.clientY);
      if (!point) return;
      moved = true;
      onElementEdit({ type: 'element/endpoint', elementId, endpoint: 'end', point });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      if (moved) {
        suppressClickRef.current = true;
        setTimeout(() => { suppressClickRef.current = false; }, 0);
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  }, [canvas.interactionMode, selectedElementId, spec, onElementEdit, toSpecPoint]);

  const handleStageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (suppressClickRef.current) return;
    if (canvas.interactionMode !== 'select') return;
    onElementSelect(resolveSelectableElementId(e.target, spec));
  }, [canvas.interactionMode, spec, onElementSelect]);

  // Presentation-only decoration of the live DOM. svgMarkup (the export source) is never touched.
  useEffect(() => {
    const root = paperRef.current;
    if (!root) return;
    root.querySelectorAll('.graphite-hit, .graphite-handle').forEach((n) => n.remove());
    root.querySelectorAll('.graphite-selected').forEach((n) => n.classList.remove('graphite-selected'));
    root.querySelectorAll('line[data-element-type="force-vector"]').forEach((line) => {
      const hit = line.cloneNode(false) as SVGLineElement;
      hit.removeAttribute('id');
      hit.removeAttribute('marker-end');
      hit.removeAttribute('class');
      hit.setAttribute('class', 'graphite-hit');
      hit.setAttribute('stroke', 'transparent');
      hit.setAttribute('stroke-width', '14');
      hit.setAttribute('stroke-dasharray', '');
      hit.setAttribute('fill', 'none');
      hit.setAttribute('pointer-events', 'stroke');
      line.after(hit);
      if (line.getAttribute('data-element-id') === selectedElementId) line.classList.add('graphite-selected');
    });
    // End-point handle: presentation only, positioned from the semantic element, select mode only.
    const selected = findSelectedForceVector(spec, selectedElementId);
    const svg = root.querySelector('svg');
    if (selected && svg && canvas.interactionMode === 'select') {
      const ns = 'http://www.w3.org/2000/svg';
      const handle = document.createElementNS(ns, 'circle');
      handle.setAttribute('class', 'graphite-handle');
      handle.setAttribute('data-graphite-handle', 'end');
      handle.setAttribute('data-element-id', selected.id);
      handle.setAttribute('cx', String(selected.end.x));
      handle.setAttribute('cy', String(selected.end.y));
      handle.setAttribute('r', String(7 / canvas.zoom));
      handle.setAttribute('fill', '#ffffff');
      handle.setAttribute('stroke', '#2563eb');
      handle.setAttribute('stroke-width', String(2.5 / canvas.zoom));
      handle.setAttribute('role', 'button');
      handle.setAttribute('aria-label', `Drag end point for ${selected.id}`);
      svg.appendChild(handle);
    }
  }, [svgMarkup, selectedElementId, spec, canvas.interactionMode, canvas.zoom]);

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
        onClick={handleStageClick}
        onPointerDown={handleStagePointerDown}
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
              <div ref={paperRef} className="paper-content" aria-label="SVG preview" dangerouslySetInnerHTML={{ __html: svgMarkup }} />
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
