import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { buildDiagramSpec, createDefaultDocument, loadDocumentFromUnknown, readSvgFromSpec, serializeDocument } from './workbench/document';
import { TEMPLATE_CATALOG } from './workbench/catalog';
import { createTranslator } from './workbench/i18n';
import { createWorkbenchState, hydrateWorkbenchState, workbenchReducer } from './workbench/reducer';
import { buildValidationReport } from './workbench/validation';
import { persistStateToStorage, WORKBENCH_STORAGE_KEY } from './workbench/storage';
import { CanvasWorkspace } from './workbench/components/CanvasWorkspace';
import { InspectorPanel } from './workbench/components/InspectorPanel';
import { StatusBar } from './workbench/components/StatusBar';
import { TemplateLibrary } from './workbench/components/TemplateLibrary';
import { TopBar } from './workbench/components/TopBar';
import type { TemplateId, UiLocale, UiTheme, WorkbenchDocument } from './workbench/types';
import './styles.css';

function readInitialState() {
  if (typeof window === 'undefined') {
    return createWorkbenchState();
  }

  try {
    const raw = window.localStorage.getItem(WORKBENCH_STORAGE_KEY);
    return raw ? hydrateWorkbenchState(JSON.parse(raw)) : createWorkbenchState();
  } catch {
    return createWorkbenchState();
  }
}

function downloadText(filename: string, content: string, mime = 'application/json;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function copyText(content: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(content);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = content;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

function nextLocale(locale: UiLocale): UiLocale {
  return locale === 'zh-TW' ? 'en-US' : 'zh-TW';
}

function nextTheme(theme: UiTheme): UiTheme {
  return theme === 'light' ? 'dark' : 'light';
}

function App() {
  const [state, dispatch] = useReducer(workbenchReducer, undefined, readInitialState);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = useMemo(() => createTranslator(state.document.locale), [state.document.locale]);

  const specResult = useMemo(() => {
    try {
      const spec = buildDiagramSpec(state.document);
      return { spec, error: null as string | null };
    } catch (cause) {
      return {
        spec: null,
        error: cause instanceof Error ? cause.message : 'Diagram generation failed.',
      };
    }
  }, [state.document]);

  const svgMarkup = useMemo(() => (specResult.spec ? readSvgFromSpec(specResult.spec) : ''), [specResult.spec]);

  const validation = useMemo(() => {
    if (!specResult.spec) {
      return {
        status: 'warning' as const,
        summary: t('statusReady'),
        items: [],
      };
    }

    return buildValidationReport(state.document, specResult.spec);
  }, [specResult.spec, state.document, t]);

  const readyStatus = t('statusReady');
  const statusText = specResult.error ?? (state.status === 'Workbench ready' ? readyStatus : state.status);
  const fileLabel = useMemo(() => {
    const template = TEMPLATE_CATALOG.find((entry) => entry.id === state.document.template.type as TemplateId);
    return template ? `${template.title[state.document.locale]}.json` : 'graphite-workbench.json';
  }, [state.document.locale, state.document.template.type]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    persistStateToStorage(window.localStorage, {
      document: state.document,
      inspectorTab: state.inspectorTab,
      templateSearch: state.templateSearch,
      inspectorOpen: state.inspectorOpen,
    });
  }, [state.document, state.inspectorTab, state.templateSearch, state.inspectorOpen]);

  useEffect(() => {
    dispatch({ type: 'ui/irDraft', draft: serializeDocument(state.document), error: null });
  }, [state.document]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.lang = state.document.locale;
    document.body.dataset.theme = state.document.theme;
    document.title = `${t('appTitle')} | ${t('workbenchTitle')}`;
  }, [state.document.locale, state.document.theme, t]);

  useEffect(() => {
    if (!state.status || state.status === readyStatus) {
      return;
    }

    const timer = window.setTimeout(() => {
      dispatch({ type: 'ui/status', status: readyStatus });
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [state.status, readyStatus]);

  const handleNewDocument = useCallback(() => {
    const document = createDefaultDocument();
    dispatch({ type: 'document/reset', document });
    dispatch({ type: 'ui/status', status: t('statusReady') });
  }, [t]);

  const handleOpenDocument = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSaveDocument = useCallback(() => {
    downloadText('graphite-workbench.json', serializeDocument(state.document));
    dispatch({ type: 'ui/status', status: state.document.locale === 'zh-TW' ? 'JSON 已儲存。' : 'JSON saved.' });
  }, [state.document]);

  const handleCopySvg = useCallback(async () => {
    if (!svgMarkup) {
      return;
    }

    try {
      await copyText(svgMarkup);
      dispatch({ type: 'ui/status', status: state.document.locale === 'zh-TW' ? 'SVG 已複製到剪貼簿。' : 'SVG copied to clipboard.' });
    } catch (cause) {
      dispatch({
        type: 'ui/status',
        status: cause instanceof Error ? cause.message : state.document.locale === 'zh-TW' ? '複製失敗。' : 'Copy failed.',
      });
    }
  }, [svgMarkup, state.document.locale]);

  const handleDownloadSvg = useCallback(() => {
    if (!svgMarkup) {
      return;
    }

    const filename = `${fileLabel.replace(/\.json$/i, '')}.svg`;
    downloadText(filename, svgMarkup, 'image/svg+xml;charset=utf-8');
    dispatch({ type: 'ui/status', status: state.document.locale === 'zh-TW' ? 'SVG 已下載。' : 'SVG downloaded.' });
  }, [svgMarkup, fileLabel, state.document.locale]);

  const handleToggleTheme = useCallback(() => {
    dispatch({ type: 'document/theme', theme: nextTheme(state.document.theme) });
  }, [state.document.theme]);

  const handleToggleLocale = useCallback(() => {
    dispatch({ type: 'document/locale', locale: nextLocale(state.document.locale) });
  }, [state.document.locale]);

  const handleToggleInspector = useCallback(() => {
    dispatch({ type: 'ui/inspectorOpen', open: !state.inspectorOpen });
  }, [state.inspectorOpen]);

  function handleTemplateSelect(templateId: TemplateId) {
    switch (templateId) {
      case 'inclined':
        dispatch({ type: 'document/template', template: { type: 'inclined', angle: 30, scenario: 'friction' } });
        break;
      case 'particle':
        dispatch({
          type: 'document/template',
          template: {
            type: 'particle',
            fieldType: 'magnetic',
            fieldDirection: 'into-page',
            chargeSign: 'positive',
            showTrajectory: true,
            showForceVector: true,
            showVelocityVector: true,
            analysisScenario: 'detailed',
          },
        });
        break;
      case 'circuit':
        dispatch({ type: 'document/template', template: { type: 'circuit', preset: 'seriesFull' } });
        break;
    }

    dispatch({ type: 'ui/status', status: state.document.locale === 'zh-TW' ? '已切換模板。' : 'Template changed.' });
  }

  function handleTemplateUpdate(template: WorkbenchDocument['template']) {
    dispatch({ type: 'document/template', template });
  }

  const handleCanvasPatch = useCallback((patch: Partial<WorkbenchDocument['canvas']>) => {
    dispatch({ type: 'document/canvas', patch });
  }, []);

  function handleIrDraftChange(value: string) {
    dispatch({ type: 'ui/irDraft', draft: value, error: null });
  }

  function handleApplyIr() {
    try {
      const parsed = JSON.parse(state.irDraft);
      const nextDocument = loadDocumentFromUnknown(parsed, state.document);
      dispatch({ type: 'document/reset', document: nextDocument });
      dispatch({ type: 'ui/status', status: state.document.locale === 'zh-TW' ? 'IR 已套用。' : 'IR applied.' });
    } catch (cause) {
      const error = cause instanceof Error ? cause.message : 'Invalid JSON';
      dispatch({ type: 'ui/irDraft', draft: state.irDraft, error });
      dispatch({ type: 'ui/status', status: error });
    }
  }

  function handleFormatIr() {
    try {
      const formatted = JSON.stringify(JSON.parse(state.irDraft), null, 2);
      dispatch({ type: 'ui/irDraft', draft: formatted, error: null });
      dispatch({ type: 'ui/status', status: state.document.locale === 'zh-TW' ? 'IR 已格式化。' : 'IR formatted.' });
    } catch (cause) {
      const error = cause instanceof Error ? cause.message : 'Invalid JSON';
      dispatch({ type: 'ui/irDraft', draft: state.irDraft, error });
      dispatch({ type: 'ui/status', status: error });
    }
  }

  function handleResetIr() {
    dispatch({ type: 'ui/irDraft', draft: serializeDocument(state.document), error: null });
    dispatch({ type: 'ui/status', status: state.document.locale === 'zh-TW' ? 'IR 已重設。' : 'IR reset.' });
  }

  function handleOpenFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    file
      .text()
      .then((text) => {
        const nextDocument = loadDocumentFromUnknown(JSON.parse(text), state.document);
        dispatch({ type: 'document/reset', document: nextDocument });
        dispatch({
          type: 'ui/status',
          status: state.document.locale === 'zh-TW' ? `已開啟 ${file.name}` : `Opened ${file.name}`,
        });
      })
      .catch((cause) => {
        dispatch({
          type: 'ui/status',
          status: cause instanceof Error ? cause.message : state.document.locale === 'zh-TW' ? '開啟失敗。' : 'Open failed.',
        });
      });
  }

  function handleInspectorTabChange(tab: typeof state.inspectorTab) {
    dispatch({ type: 'ui/inspectorTab', tab });
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName ?? '';
      const isTypingTarget =
        tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT' || Boolean(target?.isContentEditable);
      const key = event.key.toLowerCase();
      const mod = event.metaKey || event.ctrlKey;

      if (mod && key === 'n') {
        event.preventDefault();
        handleNewDocument();
        return;
      }

      if (mod && key === 'o') {
        event.preventDefault();
        handleOpenDocument();
        return;
      }

      if (mod && key === 's' && event.shiftKey) {
        event.preventDefault();
        handleDownloadSvg();
        return;
      }

      if (mod && key === 's' && !event.shiftKey) {
        event.preventDefault();
        handleSaveDocument();
        return;
      }

      if (mod && event.shiftKey && key === 'c') {
        event.preventDefault();
        handleCopySvg();
        return;
      }

      if (mod && key === 'i') {
        event.preventDefault();
        handleToggleInspector();
        return;
      }

      if (isTypingTarget) {
        return;
      }

      if (key === 'g') {
        event.preventDefault();
        handleCanvasPatch({ showGrid: !state.document.canvas.showGrid });
        return;
      }

      if (key === 'l') {
        event.preventDefault();
        handleCanvasPatch({ showLabels: !state.document.canvas.showLabels });
        return;
      }

      if (key === 'v') {
        event.preventDefault();
        handleCanvasPatch({ showVectors: !state.document.canvas.showVectors });
        return;
      }

      if (key === ' ') {
        event.preventDefault();
        handleCanvasPatch({
          interactionMode: state.document.canvas.interactionMode === 'select' ? 'pan' : 'select',
        });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    state.document.canvas,
    state.document.locale,
    state.inspectorOpen,
    handleNewDocument,
    handleOpenDocument,
    handleSaveDocument,
    handleDownloadSvg,
    handleCopySvg,
    handleToggleInspector,
    handleCanvasPatch,
  ]);

  return (
    <div className="app-shell" data-theme={state.document.theme} data-inspector-open={state.inspectorOpen ? 'true' : 'false'}>
      <TopBar
        locale={state.document.locale}
        theme={state.document.theme}
        inspectorOpen={state.inspectorOpen}
        status={statusText}
        onNewDocument={handleNewDocument}
        onOpenDocument={handleOpenDocument}
        onSaveDocument={handleSaveDocument}
        onCopySvg={handleCopySvg}
        onDownloadSvg={handleDownloadSvg}
        onToggleTheme={handleToggleTheme}
        onToggleLocale={handleToggleLocale}
        onToggleInspector={handleToggleInspector}
        fileLabel={fileLabel}
        mode={state.document.mode}
      />

      <div className="workspace-grid">
        <TemplateLibrary
          locale={state.document.locale}
          value={state.templateSearch}
          selectedTemplateId={state.document.template.type}
          onSearchChange={(query) => dispatch({ type: 'ui/templateSearch', query })}
          onTemplateSelect={handleTemplateSelect}
        />

        <CanvasWorkspace
          locale={state.document.locale}
          spec={specResult.spec}
          svgMarkup={svgMarkup}
          template={state.document.template}
          canvas={state.document.canvas}
          validation={validation}
          onInteractionModeChange={(interactionMode) => dispatch({ type: 'document/canvas', patch: { interactionMode } })}
          onZoomIn={() => dispatch({ type: 'document/canvas', patch: { zoom: Math.min(2, Number((state.document.canvas.zoom + 0.1).toFixed(2))) } })}
          onZoomOut={() => dispatch({ type: 'document/canvas', patch: { zoom: Math.max(0.5, Number((state.document.canvas.zoom - 0.1).toFixed(2))) } })}
          onFit={() => dispatch({ type: 'document/canvas', patch: { zoom: 1 } })}
          onToggleGrid={() => handleCanvasPatch({ showGrid: !state.document.canvas.showGrid })}
          onToggleLabels={() => handleCanvasPatch({ showLabels: !state.document.canvas.showLabels })}
          onToggleVectors={() => handleCanvasPatch({ showVectors: !state.document.canvas.showVectors })}
        />

        {state.inspectorOpen ? (
          <InspectorPanel
            document={state.document}
            validation={validation}
            svgMarkup={svgMarkup}
            irDraft={state.irDraft}
            irError={state.irError}
            tab={state.inspectorTab}
            locale={state.document.locale}
            onTabChange={handleInspectorTabChange}
            onDocumentModeChange={(mode) => dispatch({ type: 'document/mode', mode })}
            onDocumentLocaleChange={(locale) => dispatch({ type: 'document/locale', locale })}
            onDocumentThemeChange={(theme) => dispatch({ type: 'document/theme', theme })}
            onTemplateChange={handleTemplateUpdate}
            onCanvasChange={handleCanvasPatch}
            onIrDraftChange={handleIrDraftChange}
            onApplyIr={handleApplyIr}
            onFormatIr={handleFormatIr}
            onResetIr={handleResetIr}
            onSaveJson={handleSaveDocument}
            onDownloadSvg={handleDownloadSvg}
            onCopySvg={handleCopySvg}
          />
        ) : null}
      </div>

      <StatusBar locale={state.document.locale} status={statusText} validation={validation} />

      <input ref={fileInputRef} type="file" accept="application/json,.json" hidden onChange={handleOpenFileChange} />
    </div>
  );
}

export default App;
