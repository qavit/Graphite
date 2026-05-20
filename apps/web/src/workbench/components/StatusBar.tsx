import { useEffect, useRef, useState } from 'react';
import { createTranslator } from '../i18n';
import type { CanvasState, UiLocale, WorkbenchValidationReport } from '../types';
import type { DiagramSpec } from '@graphite/diagram-spec';

const ZOOM_PRESETS = [0.5, 0.75, 1, 1.5, 2] as const;

interface StatusBarProps {
  locale: UiLocale;
  status: string;
  canvas: CanvasState;
  spec: DiagramSpec | null;
  validation: WorkbenchValidationReport;
  onFitCanvas: () => void;
  onZoomChange: (zoom: number) => void;
  onOpenValidation: () => void;
}

export function StatusBar({ locale, status, canvas, spec, validation, onFitCanvas, onZoomChange, onOpenValidation }: StatusBarProps) {
  const t = createTranslator(locale);
  const zoomLabel = `${Math.round(canvas.zoom * 100)}%`;
  const toolLabel = canvas.interactionMode === 'select' ? t('selectMode') : t('panMode');
  const validOk = validation.status === 'success';
  const [zoomMenuOpen, setZoomMenuOpen] = useState(false);
  const zoomAnchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!zoomMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (zoomAnchorRef.current && !zoomAnchorRef.current.contains(e.target as Node)) {
        setZoomMenuOpen(false);
      }
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [zoomMenuOpen]);

  return (
    <footer className="statusbar">
      <span className={`statusbar__status${validOk ? '' : ' statusbar__status--warn'}`}>{status}</span>
      <span className="statusbar__sep" aria-hidden="true" />
      <span className="statusbar__field">{toolLabel}</span>
      {spec && (
        <>
          <span className="statusbar__sep" aria-hidden="true" />
          <span className="statusbar__field">{spec.canvas.width} × {spec.canvas.height}</span>
          <span className="statusbar__sep" aria-hidden="true" />
          <span className="statusbar__field">{spec.elements.length} {spec.elements.length === 1 ? 'element' : 'elements'}</span>
        </>
      )}
      <span className="statusbar__sep" aria-hidden="true" />

      <span className="statusbar__zoom-anchor" ref={zoomAnchorRef}>
        <button
          type="button"
          className="statusbar__field statusbar__field--btn"
          title={t('clickToFit')}
          onClick={onFitCanvas}
        >
          {zoomLabel}
        </button>
        <button
          type="button"
          className={`statusbar__zoom-caret${zoomMenuOpen ? ' is-open' : ''}`}
          onClick={() => setZoomMenuOpen((o) => !o)}
          aria-label="Zoom presets"
        >
          ▾
        </button>
        {zoomMenuOpen && (
          <div className="statusbar__zoom-menu">
            {ZOOM_PRESETS.map((z) => (
              <button
                key={z}
                type="button"
                className={`statusbar__zoom-option${canvas.zoom === z ? ' is-active' : ''}`}
                onClick={() => { onZoomChange(z); setZoomMenuOpen(false); }}
              >
                {Math.round(z * 100)}%
              </button>
            ))}
          </div>
        )}
      </span>

      <span className="statusbar__sep" aria-hidden="true" />
      <button
        type="button"
        className={`statusbar__field statusbar__field--btn statusbar__field--validation${validOk ? '' : ' is-warn'}`}
        title={t('clickForValidation')}
        onClick={onOpenValidation}
      >
        {validOk ? '✓' : '⚠'} {validation.summary}
      </button>
    </footer>
  );
}
