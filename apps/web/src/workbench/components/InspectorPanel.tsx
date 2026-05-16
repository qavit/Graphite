import { useMemo } from 'react';
import { CIRCUIT_PRESET_META } from '../catalog';
import { createTranslator, getLocaleLabel } from '../i18n';
import { serializeDocument } from '../document';
import type {
  CanvasState,
  CircuitTemplateState,
  InspectorTab,
  InclinedTemplateState,
  ParticleTemplateState,
  TemplateState,
  UiLocale,
  UiTheme,
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
  onDocumentLocaleChange: (locale: UiLocale) => void;
  onDocumentThemeChange: (theme: UiTheme) => void;
  onTemplateChange: (template: TemplateState) => void;
  onCanvasChange: (patch: Partial<CanvasState>) => void;
  onIrDraftChange: (value: string) => void;
  onApplyIr: () => void;
  onFormatIr: () => void;
  onResetIr: () => void;
  onSaveJson: () => void;
  onDownloadSvg: () => void;
  onCopySvg: () => void;
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
  if (template.type === 'inclined') {
    const current = template as InclinedTemplateState;
    return (
      <div className="field-stack">
        <label className="field">
          <span className="field-label">{locale === 'zh-TW' ? '角度' : 'Angle'}</span>
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
          <span className="field-label">{locale === 'zh-TW' ? '分析情境' : 'Analysis scenario'}</span>
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
            <option value="simple">{locale === 'zh-TW' ? '基礎受力圖' : 'Basic free-body diagram'}</option>
            <option value="friction">{locale === 'zh-TW' ? '含摩擦力' : 'Include friction'}</option>
            <option value="advanced">{locale === 'zh-TW' ? '完整分析' : 'Full analysis'}</option>
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
          <span className="field-label">{locale === 'zh-TW' ? '場類型' : 'Field type'}</span>
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
            <option value="magnetic">{locale === 'zh-TW' ? '磁場' : 'Magnetic field'}</option>
            <option value="electric">{locale === 'zh-TW' ? '電場' : 'Electric field'}</option>
          </select>
        </label>
        <label className="field">
          <span className="field-label">{locale === 'zh-TW' ? '場方向' : 'Field direction'}</span>
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
                <option value="into-page">{locale === 'zh-TW' ? '入紙面' : 'Into the page'}</option>
                <option value="out-of-page">{locale === 'zh-TW' ? '出紙面' : 'Out of the page'}</option>
              </>
            ) : (
              <>
                <option value="upward">{locale === 'zh-TW' ? '向上' : 'Upward'}</option>
                <option value="downward">{locale === 'zh-TW' ? '向下' : 'Downward'}</option>
              </>
            )}
          </select>
        </label>
        <label className="field">
          <span className="field-label">{locale === 'zh-TW' ? '電荷' : 'Charge'}</span>
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
            <option value="positive">{locale === 'zh-TW' ? '正電' : 'Positive'}</option>
            <option value="negative">{locale === 'zh-TW' ? '負電' : 'Negative'}</option>
          </select>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={current.showTrajectory}
            onChange={(event) => onTemplateChange({ ...current, showTrajectory: event.target.checked })}
          />
          <span>{locale === 'zh-TW' ? '顯示軌跡' : 'Show trajectory'}</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={current.showVelocityVector}
            onChange={(event) => onTemplateChange({ ...current, showVelocityVector: event.target.checked })}
          />
          <span>{locale === 'zh-TW' ? '顯示速度向量' : 'Show velocity vector'}</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={current.showForceVector}
            onChange={(event) => onTemplateChange({ ...current, showForceVector: event.target.checked })}
          />
          <span>{locale === 'zh-TW' ? '顯示受力向量' : 'Show force vector'}</span>
        </label>
        <label className="field">
          <span className="field-label">{locale === 'zh-TW' ? '分析情境' : 'Analysis scenario'}</span>
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
            <option value="simple">{locale === 'zh-TW' ? '簡單' : 'Simple'}</option>
            <option value="detailed">{locale === 'zh-TW' ? '詳細' : 'Detailed'}</option>
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
        <span className="field-label">{locale === 'zh-TW' ? '電路預設' : 'Circuit preset'}</span>
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
  onDocumentLocaleChange,
  onDocumentThemeChange,
  onTemplateChange,
  onCanvasChange,
  onIrDraftChange,
  onApplyIr,
  onFormatIr,
  onResetIr,
  onSaveJson,
  onDownloadSvg,
  onCopySvg,
}: InspectorPanelProps) {
  const t = createTranslator(locale);

  return (
    <aside className="surface surface--inspector">
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

            <label className="field">
              <span className="field-label">{locale === 'zh-TW' ? '語言' : 'Language'}</span>
              <select className="select" value={document.locale} onChange={(event) => onDocumentLocaleChange(event.target.value as UiLocale)}>
                <option value="zh-TW">{getLocaleLabel('zh-TW')}</option>
                <option value="en-US">{getLocaleLabel('en-US')}</option>
              </select>
            </label>

            <label className="field">
              <span className="field-label">{locale === 'zh-TW' ? '主題' : 'Theme'}</span>
              <select className="select" value={document.theme} onChange={(event) => onDocumentThemeChange(event.target.value as UiTheme)}>
                <option value="light">{locale === 'zh-TW' ? '淺色' : 'Light'}</option>
                <option value="dark">{locale === 'zh-TW' ? '深色' : 'Dark'}</option>
              </select>
            </label>

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
                <span>{locale === 'zh-TW' ? '顯示格線' : 'Show grid'}</span>
              </label>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={document.canvas.showLabels}
                  onChange={(event) => onCanvasChange({ showLabels: event.target.checked })}
                />
                <span>{locale === 'zh-TW' ? '顯示標註' : 'Show labels'}</span>
              </label>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={document.canvas.showVectors}
                  onChange={(event) => onCanvasChange({ showVectors: event.target.checked })}
                />
                <span>{locale === 'zh-TW' ? '顯示向量' : 'Show vectors'}</span>
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
