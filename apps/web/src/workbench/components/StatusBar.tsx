import type { DiagramSpec } from '@graphite/diagram-spec';
import { createTranslator } from '../i18n';
import type { CanvasState, UiLocale, UiTheme, WorkbenchValidationReport } from '../types';

interface StatusBarProps {
  locale: UiLocale;
  theme: UiTheme;
  status: string;
  canvas: CanvasState;
  spec: DiagramSpec | null;
  validation: WorkbenchValidationReport;
  onFitCanvas: () => void;
  onOpenValidation: () => void;
}

export function StatusBar({ locale, theme, status, canvas, spec, validation, onFitCanvas, onOpenValidation }: StatusBarProps) {
  const t = createTranslator(locale);
  const zoomLabel = `${Math.round(canvas.zoom * 100)}%`;
  const toolLabel = canvas.interactionMode === 'select' ? t('selectMode') : t('panMode');
  const sizeLabel = spec ? `${spec.canvas.width} × ${spec.canvas.height}` : '— × —';
  const localeLabel = locale === 'zh-TW' ? t('localeZh') : t('localeEn');
  const themeLabel = theme === 'dark' ? t('themeDark') : t('themeLight');
  const validOk = validation.status === 'success';

  return (
    <footer className="statusbar">
      <span className={`statusbar__status${validOk ? '' : ' statusbar__status--warn'}`}>{status}</span>
      <span className="statusbar__sep" aria-hidden="true" />
      <span className="statusbar__field" title={t('interactionModeLabel')}>{toolLabel}</span>
      <span className="statusbar__sep" aria-hidden="true" />
      <button
        type="button"
        className="statusbar__field statusbar__field--btn"
        title={t('clickToFit')}
        onClick={onFitCanvas}
      >
        {zoomLabel}
      </button>
      <span className="statusbar__sep" aria-hidden="true" />
      <span className="statusbar__field">{sizeLabel}</span>
      <span className="statusbar__sep" aria-hidden="true" />
      <button
        type="button"
        className={`statusbar__field statusbar__field--btn statusbar__field--validation${validOk ? '' : ' is-warn'}`}
        title={t('clickForValidation')}
        onClick={onOpenValidation}
      >
        {validOk ? '✓' : '⚠'} {validation.summary}
      </button>
      <span className="statusbar__right">
        <span className="statusbar__field">{localeLabel}</span>
        <span className="statusbar__sep" aria-hidden="true" />
        <span className="statusbar__field">{themeLabel}</span>
      </span>
    </footer>
  );
}
