import { useMemo } from 'react';
import { CIRCUIT_PRESET_META } from '../catalog';
import { createTranslator } from '../i18n';
import { serializeDocument } from '../document';
import type {
  CanvasState,
  CircuitTemplateState,
  InspectorTab,
  InclinedTemplateState,
  ParticleTemplateState,
  TemplateState,
  UiLocale,
  WorkbenchDocument,
  WorkbenchValidationReport,
} from '../types';
import { FileIcon, LanguageIcon, MoonIcon, ResetIcon, SaveIcon, SunIcon } from './icons';
import { ToolButton } from './ToolButton';

interface InspectorPanelProps {
  document: WorkbenchDocument;
  validation: WorkbenchValidationReport;
  svgMarkup: string;
  irDraft: string;
  irError: string | null;
  tab: InspectorTab;
  locale: UiLocale;
  onTabChange: (tab: InspectorTab) => void;
  onDocumentModeChange: (mode: WorkbenchDocument['mode']) => void;
  onTemplateChange: (template: TemplateState) => void;
  onCanvasChange: (patch: Partial<CanvasState>) => void;
  onIrDraftChange: (value: string) => void;
  onApplyIr: () => void;
  onFormatIr: () => void;
  onResetIr: () => void;
  onSaveJson: () => void;
  onDownloadSvg: () => void;
  onCopySvg: () => void;
  className?: string;
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`inspector-tab ${active ? 'is-active' : ''}`} onClick={onClick} aria-pressed={active}>
      {label}
    </button>
  );
}

function ModeSelect({
  locale,
  value,
  onChange,
}: {
  locale: UiLocale;
  value: WorkbenchDocument['mode'];
  onChange: (mode: WorkbenchDocument['mode']) => void;
}) {
  const labels = useMemo(
    () =>
      ({
        teacher: locale === 'zh-TW' ? '教師版' : 'Teacher',
        student: locale === 'zh-TW' ? '學生版' : 'Student',
        minimal: locale === 'zh-TW' ? '極簡版' : 'Minimal',
      }) as Record<WorkbenchDocument['mode'], string>,
    [locale],
  );

  return (
    <div className="segmented">
      {(['teacher', 'student', 'minimal'] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          className={`segment ${value === mode ? 'is-active' : ''}`}
          onClick={() => onChange(mode)}
          aria-pressed={value === mode}
        >
          <strong>{labels[mode]}</strong>
          <span>{mode}</span>
        </button>
      ))}
    </div>
  );
}

function TemplateSettings({
  locale,
  template,
  onTemplateChange,
}: {
  locale: UiLocale;
  template: TemplateState;
  onTemplateChange: (template: TemplateState) => void;
}) {
  const t = createTranslator(locale);

  if (template.type === 'inclined') {
    const current = template as InclinedTemplateState;
    return (
      <div className="field-stack">
        <label className="field">
          <span className="field-label">{t('angleLabel')}</span>
          <span className="field-value">{current.angle}°</span>
        </label>
        <input
          className="range"
          type="range"
          min="0"
          max="90"
          value={current.angle}
          onChange={(event) => onTemplateChange({ ...current, angle: Number(event.target.value) })}
        />
        <label className="field">
          <span className="field-label">{t('analysisScenario')}</span>
          <select
            className="select"
            value={current.scenario}
            onChange={(event) =>
              onTemplateChange({
                ...current,
                scenario: event.target.value as InclinedTemplateState['scenario'],
              })
            }
          >
            <option value="simple">{t('scenarioSimple')}</option>
            <option value="friction">{t('scenarioFriction')}</option>
            <option value="advanced">{t('scenarioAdvanced')}</option>
          </select>
        </label>
      </div>
    );
  }

  if (template.type === 'particle') {
    const current = template as ParticleTemplateState;
    return (
      <div className="field-stack">
        <label className="field">
          <span className="field-label">{t('fieldTypeLabel')}</span>
          <select
            className="select"
            value={current.fieldType}
            onChange={(event) => {
              const nextType = event.target.value as ParticleTemplateState['fieldType'];
              onTemplateChange({
                ...current,
                fieldType: nextType,
                fieldDirection: nextType === 'magnetic' ? 'into-page' : 'upward',
              });
            }}
          >
            <option value="magnetic">{t('fieldMagnetic')}</option>
            <option value="electric">{t('fieldElectric')}</option>
          </select>
        </label>
        <label className="field">
          <span className="field-label">{t('fieldDirectionLabel')}</span>
          <select
            className="select"
            value={current.fieldDirection}
            onChange={(event) =>
              onTemplateChange({
                ...current,
                fieldDirection: event.target.value as ParticleTemplateState['fieldDirection'],
              })
            }
          >
            {current.fieldType === 'magnetic' ? (
              <>
                <option value="into-page">{t('dirIntoPage')}</option>
                <option value="out-of-page">{t('dirOutOfPage')}</option>
              </>
            ) : (
              <>
                <option value="upward">{t('dirUpward')}</option>
                <option value="downward">{t('dirDownward')}</option>
              </>
            )}
          </select>
        </label>
        <label className="field">
          <span className="field-label">{t('chargeLabel')}</span>
          <select
            className="select"
            value={current.chargeSign}
            onChange={(event) =>
              onTemplateChange({
                ...current,
                chargeSign: event.target.value as ParticleTemplateState['chargeSign'],
              })
            }
          >
            <option value="positive">{t('chargePositive')}</option>
            <option value="negative">{t('chargeNegative')}</option>
          </select>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={current.showTrajectory}
            onChange={(event) => onTemplateChange({ ...current, showTrajectory: event.target.checked })}
          />
          <span>{t('showTrajectory')}</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={current.showVelocityVector}
            onChange={(event) => onTemplateChange({ ...current, showVelocityVector: event.target.checked })}
          />
          <span>{t('showVelocityVector')}</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={current.showForceVector}
            onChange={(event) => onTemplateChange({ ...current, showForceVector: event.target.checked })}
          />
          <span>{t('showForceVector')}</span>
        </label>
        <label className="field">
          <span className="field-label">{t('analysisScenario')}</span>
          <select
            className="select"
            value={current.analysisScenario}
            onChange={(event) =>
              onTemplateChange({
                ...current,
                analysisScenario: event.target.value as ParticleTemplateState['analysisScenario'],
              })
            }
          >
            <option value="simple">{t('analysisSimple')}</option>
            <option value="detailed">{t('analysisDetailed')}</option>
          </select>
        </label>
      </div>
    );
  }

  const current = template as CircuitTemplateState;
  const presetMeta = CIRCUIT_PRESET_META[current.preset][locale];

  return (
    <div className="field-stack">
      <label className="field">
        <span className="field-label">{t('circuitPreset')}</span>
        <select
          className="select"
          value={current.preset}
          onChange={(event) =>
            onTemplateChange({
              ...current,
              preset: event.target.value as CircuitTemplateState['preset'],
            })
          }
        >
          {Object.entries(CIRCUIT_PRESET_META).map(([preset, meta]) => (
            <option key={preset} value={preset}>
              {meta[locale].label}
            </option>
          ))}
        </select>
      </label>
      <div className="helper-card">
        <strong>{presetMeta.label}</strong>
        <span>{presetMeta.hint}</span>
      </div>
    </div>
  );
}

function ValidationList({ validation, locale }: { validation: WorkbenchValidationReport; locale: UiLocale }) {
  return (
    <div className="validation-list">
      {validation.items.map((item) => (
        <article key={item.id} className={`validation-item is-${item.severity}`}>
          <div className="validation-item__header">
            <strong>{item.title}</strong>
            <span>{item.severity}</span>
          </div>
          <p>{item.detail}</p>
        </article>
      ))}
      <div className="helper-card">
        <strong>{locale === 'zh-TW' ? '摘要' : 'Summary'}</strong>
        <span>{validation.summary}</span>
      </div>
    </div>
  );
}

export function InspectorPanel({
  document,
  validation,
  svgMarkup,
  irDraft,
  irError,
  tab,
  locale,
  onTabChange,
  onDocumentModeChange,
  onTemplateChange,
  onCanvasChange,
  onIrDraftChange,
  onApplyIr,
  onFormatIr,
  onResetIr,
  onSaveJson,
  onDownloadSvg,
  onCopySvg,
  className = '',
}: InspectorPanelProps) {
  const t = createTranslator(locale);

  return (
    <aside className={`surface surface--inspector ${className}`.trim()}>
      <div className="surface__header surface__header--stacked">
        <div>
          <p className="eyebrow">{locale === 'zh-TW' ? '屬性檢視器' : 'Inspector'}</p>
          <h2>{t('inspectorLabel')}</h2>
        </div>
      </div>

      <div className="inspector-tabs" role="tablist" aria-label={locale === 'zh-TW' ? '檢視器分頁' : 'Inspector tabs'}>
        <TabButton active={tab === 'properties'} label={t('propertiesTab')} onClick={() => onTabChange('properties')} />
        <TabButton active={tab === 'ir'} label={t('irTab')} onClick={() => onTabChange('ir')} />
        <TabButton active={tab === 'svg'} label={t('svgTab')} onClick={() => onTabChange('svg')} />
        <TabButton active={tab === 'validation'} label={t('validationTab')} onClick={() => onTabChange('validation')} />
        <TabButton active={tab === 'export'} label={t('exportTab')} onClick={() => onTabChange('export')} />
      </div>

      <div className="inspector-panel-body">
        {tab === 'properties' ? (
          <div className="field-stack">
            <div className="helper-card">
              <strong>{t('currentFile')}</strong>
              <span>{serializeDocument(document).slice(0, 64)}...</span>
            </div>

            <ModeSelect locale={locale} value={document.mode} onChange={onDocumentModeChange} />

            <div className="divider" />

            <TemplateSettings locale={locale} template={document.template} onTemplateChange={onTemplateChange} />

            <div className="divider" />

            <div className="field-stack">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={document.canvas.showGrid}
                  onChange={(event) => onCanvasChange({ showGrid: event.target.checked })}
                />
                <span>{t('showGrid')}</span>
              </label>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={document.canvas.showLabels}
                  onChange={(event) => onCanvasChange({ showLabels: event.target.checked })}
                />
                <span>{t('showLabels')}</span>
              </label>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={document.canvas.showVectors}
                  onChange={(event) => onCanvasChange({ showVectors: event.target.checked })}
                />
                <span>{t('showVectors')}</span>
              </label>
            </div>
          </div>
        ) : null}

        {tab === 'ir' ? (
          <div className="field-stack">
            <textarea
              className="ir-editor"
              value={irDraft}
              onChange={(event) => onIrDraftChange(event.target.value)}
              spellCheck={false}
            />
            {irError ? <p className="error-text">{irError}</p> : null}
            <div className="action-row">
              <ToolButton icon={<SaveIcon />} label={t('saveIr')} shortcut="Enter" onClick={onApplyIr} />
              <ToolButton icon={<FileIcon />} label={t('formatIr')} onClick={onFormatIr} />
              <ToolButton icon={<ResetIcon />} label={t('resetIr')} onClick={onResetIr} />
            </div>
          </div>
        ) : null}

        {tab === 'svg' ? (
          <div className="field-stack">
            <div className="code-shell">
              <pre className="code-block">{svgMarkup}</pre>
            </div>
          </div>
        ) : null}

        {tab === 'validation' ? <ValidationList validation={validation} locale={locale} /> : null}

        {tab === 'export' ? (
          <div className="field-stack">
            <div className="action-row">
              <ToolButton icon={<FileIcon />} label={t('saveDocument')} shortcut="S" onClick={onSaveJson} />
              <ToolButton icon={<CopySvgShortcutIcon />} label={t('copySvg')} shortcut="⇧C" onClick={onCopySvg} />
              <ToolButton icon={<SaveIcon />} label={t('downloadSvg')} shortcut="⇧D" onClick={onDownloadSvg} />
            </div>
            <p className="panel-note">{t('exportHint')}</p>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function CopySvgShortcutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M8.5 9.5V7.8A2.8 2.8 0 0 1 11.3 5h5.2A2.8 2.8 0 0 1 19.3 7.8V13A2.8 2.8 0 0 1 16.5 15.8H14.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.8h6.8A1.2 1.2 0 0 1 13 11v6.8A1.2 1.2 0 0 1 11.8 19H5a1.2 1.2 0 0 1-1.2-1.2V11A1.2 1.2 0 0 1 5 9.8Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
