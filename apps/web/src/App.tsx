import React, { useEffect, useMemo, useState } from 'react';
import { renderToSVG } from '@graphite/render-svg';
import {
  generateInclinedPlane,
  generateChargedParticleMotion,
  generateSimpleCircuit,
  simpleCircuitPresets,
  type InclinedPlaneParams,
  type ChargedParticleParams,
  type SimpleCircuitParams,
} from '@graphite/templates';
import type { DiagramSpec, ViewMode } from '@graphite/diagram-spec';
import './styles.css';

type TemplateId = 'inclined' | 'particle' | 'circuit';
type CircuitPresetId = keyof typeof simpleCircuitPresets;

type TemplateCard = {
  id: TemplateId;
  title: string;
  subtitle: string;
  description: string;
  accent: string;
};

const TEMPLATE_CARDS: TemplateCard[] = [
  {
    id: 'inclined',
    title: '斜面受力',
    subtitle: '力學 / 向量',
    description: '斜面、重力、正向力、摩擦力與角度標註。',
    accent: '#0f766e',
  },
  {
    id: 'particle',
    title: '帶電粒子',
    subtitle: '電磁學 / 軌跡',
    description: '磁場與電場中的粒子偏轉、受力與軌跡。',
    accent: '#2563eb',
  },
  {
    id: 'circuit',
    title: '簡單電路',
    subtitle: '電學 / 元件',
    description: '串聯、並聯、開關、電阻與燈泡的標準符號。',
    accent: '#b45309',
  },
];

const MODE_OPTIONS: Array<{
  id: ViewMode;
  label: string;
  hint: string;
}> = [
  { id: 'teacher', label: '教師版', hint: '完整標註與解題提示' },
  { id: 'student', label: '學生版', hint: '保留空白與提示框' },
  { id: 'minimal', label: '極簡版', hint: '只保留核心圖形' },
];

const CIRCUIT_PRESET_OPTIONS: Array<{
  id: CircuitPresetId;
  label: string;
  hint: string;
}> = [
  { id: 'seriesFull', label: '串聯完整版', hint: '電池、開關、電阻、燈泡' },
  { id: 'seriesMinimal', label: '串聯簡版', hint: '最少元件，快速出題' },
  { id: 'seriesOpenSwitch', label: '串聯斷路版', hint: '適合通路 / 斷路判讀' },
  { id: 'parallelResistorBulb', label: '並聯電阻 + 燈泡', hint: '常見基礎並聯圖' },
  { id: 'parallelTwoResistors', label: '並聯雙電阻', hint: '可比較分流與標註' },
];

function buildSpec(
  templateId: TemplateId,
  mode: ViewMode,
  angle: number,
  scenario: InclinedPlaneParams['analysisScenario'],
  fieldType: ChargedParticleParams['fieldType'],
  fieldDirection: ChargedParticleParams['fieldDirection'],
  chargeSign: ChargedParticleParams['chargeSign'],
  showTrajectory: boolean,
  showForceVector: boolean,
  showVelocityVector: boolean,
  analysisScenario: ChargedParticleParams['analysisScenario'],
  circuitPreset: CircuitPresetId,
): DiagramSpec {
  if (templateId === 'inclined') {
    const params: InclinedPlaneParams = {
      angle,
      showLabels: true,
      labelLocale: 'zh-TW',
      analysisScenario: scenario,
    };
    return generateInclinedPlane(params, mode);
  }

  if (templateId === 'particle') {
    const params: ChargedParticleParams = {
      fieldType,
      fieldDirection,
      chargeSign,
      showTrajectory,
      showForceVector,
      showVelocityVector,
      analysisScenario,
      labelLocale: 'zh-TW',
    };
    return generateChargedParticleMotion(params, mode);
  }

  const params: SimpleCircuitParams = simpleCircuitPresets[circuitPreset]();
  return generateSimpleCircuit(params, mode);
}

function saveFile(name: string, content: string, mime = 'image/svg+xml;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

function App() {
  const [templateId, setTemplateId] = useState<TemplateId>('inclined');
  const [mode, setMode] = useState<ViewMode>('teacher');
  const [angle, setAngle] = useState(30);
  const [scenario, setScenario] = useState<InclinedPlaneParams['analysisScenario']>('friction');

  const [fieldType, setFieldType] = useState<ChargedParticleParams['fieldType']>('magnetic');
  const [fieldDirection, setFieldDirection] = useState<ChargedParticleParams['fieldDirection']>('into-page');
  const [chargeSign, setChargeSign] = useState<ChargedParticleParams['chargeSign']>('positive');
  const [showTrajectory, setShowTrajectory] = useState(true);
  const [showForceVector, setShowForceVector] = useState(true);
  const [showVelocityVector, setShowVelocityVector] = useState(true);
  const [particleScenario, setParticleScenario] = useState<ChargedParticleParams['analysisScenario']>('detailed');

  const [circuitPreset, setCircuitPreset] = useState<CircuitPresetId>('seriesFull');

  const [status, setStatus] = useState('已載入 Graphite 工作台。');

  useEffect(() => {
    if (!status) return;
    const timer = window.setTimeout(() => setStatus(''), 2400);
    return () => window.clearTimeout(timer);
  }, [status]);

  const templateCard = TEMPLATE_CARDS.find((item) => item.id === templateId) ?? TEMPLATE_CARDS[0];

  const circuitSummary = CIRCUIT_PRESET_OPTIONS.find((item) => item.id === circuitPreset) ?? CIRCUIT_PRESET_OPTIONS[0];

  const { spec, error } = useMemo(() => {
    try {
      return {
        spec: buildSpec(
          templateId,
          mode,
          angle,
          scenario,
          fieldType,
          fieldDirection,
          chargeSign,
          showTrajectory,
          showForceVector,
          showVelocityVector,
          particleScenario,
          circuitPreset,
        ),
        error: null as string | null,
      };
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Unknown render error';
      return { spec: null as DiagramSpec | null, error: message };
    }
  }, [
    templateId,
    mode,
    angle,
    scenario,
    fieldType,
    fieldDirection,
    chargeSign,
    showTrajectory,
    showForceVector,
    showVelocityVector,
    particleScenario,
    circuitPreset,
  ]);

  const svgMarkup = useMemo(() => {
    if (!spec) return '';
    return renderToSVG(spec);
  }, [spec]);

  const specTitle = spec?.metadata.title ?? templateCard.title;
  const previewFilename = `graphite-${templateId}-${mode}.svg`;

  const handleDownload = () => {
    if (!svgMarkup) return;
    saveFile(previewFilename, svgMarkup);
    setStatus(`已下載 ${previewFilename}`);
  };

  const handleCopy = async () => {
    if (!svgMarkup) return;
    try {
      await copyText(svgMarkup);
      setStatus('SVG 已複製到剪貼簿。');
    } catch (copyError) {
      const message = copyError instanceof Error ? copyError.message : 'Copy failed';
      setStatus(`複製失敗：${message}`);
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">Graphite</div>
          <div className="brand-copy">
            <div className="brand-title">Teacher Workbench</div>
            <div className="brand-subtitle">Editable vector diagrams for STEM teachers</div>
          </div>
        </div>

        <div className="topbar-actions">
          <button type="button" className="ghost-button" onClick={handleCopy} disabled={!svgMarkup}>
            Copy SVG
          </button>
          <button type="button" className="primary-button" onClick={handleDownload} disabled={!svgMarkup}>
            Download SVG
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <section className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-kicker">Templates</div>
                <h2>Choose a diagram family</h2>
              </div>
            </div>

            <div className="template-list" role="tablist" aria-label="Diagram templates">
              {TEMPLATE_CARDS.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  className={`template-card ${templateId === card.id ? 'is-active' : ''}`}
                  onClick={() => setTemplateId(card.id)}
                  style={{ '--accent': card.accent } as React.CSSProperties}
                >
                  <span className="template-card__subtitle">{card.subtitle}</span>
                  <span className="template-card__title">{card.title}</span>
                  <span className="template-card__description">{card.description}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-kicker">Mode</div>
                <h2>Teacher / student output</h2>
              </div>
            </div>

            <div className="segmented" role="tablist" aria-label="View mode">
              {MODE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`segment ${mode === option.id ? 'is-active' : ''}`}
                  onClick={() => setMode(option.id)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.hint}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-kicker">Parameters</div>
                <h2>{templateCard.title} settings</h2>
              </div>
            </div>

            {templateId === 'inclined' && (
              <div className="field-stack">
                <label className="field">
                  <span className="field-label">Angle</span>
                  <span className="field-value">{angle}°</span>
                </label>
                <input
                  className="range"
                  type="range"
                  min="0"
                  max="90"
                  value={angle}
                  onChange={(event) => setAngle(Number(event.target.value))}
                />

                <label className="field">
                  <span className="field-label">Analysis scenario</span>
                  <select
                    className="select"
                    value={scenario}
                    onChange={(event) => setScenario(event.target.value as InclinedPlaneParams['analysisScenario'])}
                  >
                    <option value="simple">Basic free-body diagram</option>
                    <option value="friction">Include friction</option>
                    <option value="advanced">Full analysis</option>
                  </select>
                </label>
              </div>
            )}

            {templateId === 'particle' && (
              <div className="field-stack">
                <label className="field">
                  <span className="field-label">Field type</span>
                  <select
                    className="select"
                    value={fieldType}
                    onChange={(event) => {
                      const nextType = event.target.value as ChargedParticleParams['fieldType'];
                      setFieldType(nextType);
                      setFieldDirection(nextType === 'magnetic' ? 'into-page' : 'upward');
                    }}
                  >
                    <option value="magnetic">Magnetic field</option>
                    <option value="electric">Electric field</option>
                  </select>
                </label>

                <label className="field">
                  <span className="field-label">Field direction</span>
                  <select
                    className="select"
                    value={fieldDirection}
                    onChange={(event) => setFieldDirection(event.target.value as ChargedParticleParams['fieldDirection'])}
                  >
                    {fieldType === 'magnetic' ? (
                      <>
                        <option value="into-page">Into the page</option>
                        <option value="out-of-page">Out of the page</option>
                      </>
                    ) : (
                      <>
                        <option value="upward">Upward</option>
                        <option value="downward">Downward</option>
                      </>
                    )}
                  </select>
                </label>

                <label className="field">
                  <span className="field-label">Charge sign</span>
                  <select
                    className="select"
                    value={chargeSign}
                    onChange={(event) => setChargeSign(event.target.value as ChargedParticleParams['chargeSign'])}
                  >
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                  </select>
                </label>

                <label className="toggle">
                  <input type="checkbox" checked={showTrajectory} onChange={(event) => setShowTrajectory(event.target.checked)} />
                  <span>Show trajectory</span>
                </label>

                <label className="toggle">
                  <input type="checkbox" checked={showVelocityVector} onChange={(event) => setShowVelocityVector(event.target.checked)} />
                  <span>Show velocity vector</span>
                </label>

                <label className="toggle">
                  <input type="checkbox" checked={showForceVector} onChange={(event) => setShowForceVector(event.target.checked)} />
                  <span>Show force vector</span>
                </label>

                <label className="field">
                  <span className="field-label">Analysis scenario</span>
                  <select
                    className="select"
                    value={particleScenario}
                    onChange={(event) => setParticleScenario(event.target.value as ChargedParticleParams['analysisScenario'])}
                  >
                    <option value="simple">Simple</option>
                    <option value="detailed">Detailed</option>
                  </select>
                </label>
              </div>
            )}

            {templateId === 'circuit' && (
              <div className="field-stack">
                <label className="field">
                  <span className="field-label">Preset</span>
                  <select
                    className="select"
                    value={circuitPreset}
                    onChange={(event) => setCircuitPreset(event.target.value as CircuitPresetId)}
                  >
                    {CIRCUIT_PRESET_OPTIONS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="helper-card">
                  <strong>{circuitSummary.label}</strong>
                  <span>{circuitSummary.hint}</span>
                </div>
              </div>
            )}
          </section>

          <section className="panel panel--muted">
            <div className="panel-header">
              <div>
                <div className="panel-kicker">Export</div>
                <h2>Vector output first</h2>
              </div>
            </div>

            <div className="export-actions">
              <button type="button" className="ghost-button" onClick={handleCopy} disabled={!svgMarkup}>
                Copy SVG
              </button>
              <button type="button" className="primary-button" onClick={handleDownload} disabled={!svgMarkup}>
                Download SVG
              </button>
            </div>
            <p className="panel-note">
              SVG is the source of truth for this workspace. PDF and PNG remain outside the browser UI for now.
            </p>
          </section>
        </aside>

        <main className="preview-area">
          <section className="preview-card">
            <div className="preview-header">
              <div>
                <div className="panel-kicker">Preview</div>
                <h1>{specTitle}</h1>
              </div>

              <div className="preview-metrics">
                <span className="metric-chip">{spec?.canvas.width ?? 0} × {spec?.canvas.height ?? 0}</span>
                <span className="metric-chip">{spec?.elements.length ?? 0} elements</span>
                <span className="metric-chip">{mode}</span>
              </div>
            </div>

            <div className="preview-summary">
              <div className="summary-block">
                <span className="summary-label">Template</span>
                <strong>{templateCard.title}</strong>
                <span>{templateCard.subtitle}</span>
              </div>
              <div className="summary-block">
                <span className="summary-label">Mode</span>
                <strong>{MODE_OPTIONS.find((item) => item.id === mode)?.label ?? mode}</strong>
                <span>{MODE_OPTIONS.find((item) => item.id === mode)?.hint}</span>
              </div>
              <div className="summary-block">
                <span className="summary-label">Export file</span>
                <strong>{previewFilename}</strong>
                <span>SVG only in browser UI</span>
              </div>
            </div>

            <div className="paper-shell">
              {error ? (
                <div className="error-state">
                  <strong>Diagram generation failed.</strong>
                  <span>{error}</span>
                </div>
              ) : (
                <div className="paper-frame">
                  <div
                    className="paper-content"
                    aria-label="SVG preview"
                    dangerouslySetInnerHTML={{ __html: svgMarkup }}
                  />
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      <footer className="statusbar" aria-live="polite">
        <span className="statusbar__badge">Ready</span>
        <span>{status || 'Workspace idle.'}</span>
      </footer>
    </div>
  );
}

export default App;
