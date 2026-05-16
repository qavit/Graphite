import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { buildDiagramSpec, createDefaultDocument, loadDocumentFromUnknown, readSvgFromSpec, serializeDocument } from './workbench/document';
import { TEMPLATE_CATALOG } from './workbench/catalog';
import { createTranslator } from './workbench/i18n';
import { createWorkbenchState, hydrateWorkbenchState, workbenchReducer } from './workbench/reducer';
import { buildValidationReport } from './workbench/validation';
import { persistStateToStorage, WORKBENCH_STORAGE_KEY } from './workbench/storage';
import { CanvasWorkspace } from './workbench/components/CanvasWorkspace';
import { CommandPalette, type CommandPaletteItem } from './workbench/components/CommandPalette';
import { InspectorPanel } from './workbench/components/InspectorPanel';
import { StatusBar } from './workbench/components/StatusBar';
import { TemplateLibrary } from './workbench/components/TemplateLibrary';
import { TopBar } from './workbench/components/TopBar';
import { ToolButton } from './workbench/components/ToolButton';
import { FolderOpenIcon, InspectIcon, SearchIcon } from './workbench/components/icons';
import type { InspectorTab, TemplateId, UiLocale, UiTheme, WorkbenchDocument } from './workbench/types';
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
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [mobilePanel, setMobilePanel] = useState<'templates' | 'inspector' | null>(null);

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

  const handleOpenCommandPalette = useCallback(() => {
    setCommandQuery('');
    setCommandPaletteOpen(true);
  }, []);

  const handleCloseCommandPalette = useCallback(() => {
    setCommandPaletteOpen(false);
  }, []);

  const handleToggleTemplatesPanel = useCallback(() => {
    setMobilePanel((current) => (current === 'templates' ? null : 'templates'));
  }, []);

  const handleToggleInspectorPanel = useCallback(() => {
    dispatch({ type: 'ui/inspectorOpen', open: true });
    setMobilePanel((current) => (current === 'inspector' ? null : 'inspector'));
  }, []);

  const handleTemplateSelect = useCallback((templateId: TemplateId) => {
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
  }, [state.document.locale]);

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

  const handleInspectorTabChange = useCallback((tab: typeof state.inspectorTab) => {
    dispatch({ type: 'ui/inspectorTab', tab });
  }, []);

  const commandPaletteItems = useMemo<CommandPaletteItem[]>(
    () => [
      {
        id: 'new-document',
        label: state.document.locale === 'zh-TW' ? '新文件' : 'New document',
        detail: state.document.locale === 'zh-TW' ? '建立空白工作台' : 'Create a blank workbench',
        group: state.document.locale === 'zh-TW' ? '檔案' : 'File',
        shortcut: '⌘N',
        keywords: ['new', 'document', 'file'],
        run: handleNewDocument,
      },
      {
        id: 'open-json',
        label: state.document.locale === 'zh-TW' ? '開啟 JSON' : 'Open JSON',
        detail: state.document.locale === 'zh-TW' ? '載入本機工作台文件' : 'Load a local workbench file',
        group: state.document.locale === 'zh-TW' ? '檔案' : 'File',
        shortcut: '⌘O',
        keywords: ['open', 'json', 'file'],
        run: handleOpenDocument,
      },
      {
        id: 'save-json',
        label: state.document.locale === 'zh-TW' ? '儲存 JSON' : 'Save JSON',
        detail: state.document.locale === 'zh-TW' ? '下載目前 IR 文件' : 'Download the current IR document',
        group: state.document.locale === 'zh-TW' ? '檔案' : 'File',
        shortcut: '⌘S',
        keywords: ['save', 'json', 'document'],
        run: handleSaveDocument,
      },
      {
        id: 'copy-svg',
        label: state.document.locale === 'zh-TW' ? '複製 SVG' : 'Copy SVG',
        detail: state.document.locale === 'zh-TW' ? '複製目前 SVG 到剪貼簿' : 'Copy the current SVG to the clipboard',
        group: state.document.locale === 'zh-TW' ? '匯出' : 'Export',
        shortcut: '⌘⇧C',
        keywords: ['copy', 'svg', 'export'],
        run: handleCopySvg,
      },
      {
        id: 'download-svg',
        label: state.document.locale === 'zh-TW' ? '下載 SVG' : 'Download SVG',
        detail: state.document.locale === 'zh-TW' ? '匯出目前圖面為 SVG' : 'Export the current diagram as SVG',
        group: state.document.locale === 'zh-TW' ? '匯出' : 'Export',
        shortcut: '⌘⇧D',
        keywords: ['download', 'svg', 'export'],
        run: handleDownloadSvg,
      },
      {
        id: 'toggle-theme',
        label: state.document.theme === 'light'
          ? state.document.locale === 'zh-TW'
            ? '切換深色'
            : 'Dark theme'
          : state.document.locale === 'zh-TW'
            ? '切換淺色'
            : 'Light theme',
        detail: state.document.locale === 'zh-TW' ? '切換介面主題' : 'Switch the interface theme',
        group: state.document.locale === 'zh-TW' ? '介面' : 'UI',
        shortcut: '⌘⇧L',
        keywords: ['theme', 'dark', 'light'],
        run: handleToggleTheme,
      },
      {
        id: 'toggle-language',
        label: state.document.locale === 'zh-TW' ? '切換語言' : 'Toggle language',
        detail: state.document.locale === 'zh-TW' ? '在繁中與 English 之間切換' : 'Switch between zh-TW and English',
        group: state.document.locale === 'zh-TW' ? '介面' : 'UI',
        shortcut: '⌘L',
        keywords: ['language', 'locale', 'i18n'],
        run: handleToggleLocale,
      },
      {
        id: 'toggle-inspector',
        label: state.document.locale === 'zh-TW' ? '切換檢視器' : 'Toggle inspector',
        detail: state.document.locale === 'zh-TW' ? '顯示或隱藏右側檢視器' : 'Show or hide the right inspector',
        group: state.document.locale === 'zh-TW' ? '介面' : 'UI',
        shortcut: '⌘I',
        keywords: ['inspector', 'panel', 'sidebar'],
        run: handleToggleInspector,
      },
      {
        id: 'show-templates-drawer',
        label: state.document.locale === 'zh-TW' ? '模板抽屜' : 'Templates drawer',
        detail: state.document.locale === 'zh-TW' ? '在手機上打開模板面板' : 'Open the mobile template sheet',
        group: state.document.locale === 'zh-TW' ? '面板' : 'Panels',
        shortcut: 'T',
        keywords: ['templates', 'library', 'drawer'],
        run: handleToggleTemplatesPanel,
      },
      {
        id: 'show-inspector-drawer',
        label: state.document.locale === 'zh-TW' ? '檢視器抽屜' : 'Inspector drawer',
        detail: state.document.locale === 'zh-TW' ? '在手機上打開右側檢視器' : 'Open the mobile inspector sheet',
        group: state.document.locale === 'zh-TW' ? '面板' : 'Panels',
        shortcut: 'I',
        keywords: ['inspector', 'drawer', 'panel'],
        run: handleToggleInspectorPanel,
      },
      {
        id: 'toggle-grid',
        label: state.document.locale === 'zh-TW' ? '切換格線' : 'Toggle grid',
        detail: state.document.locale === 'zh-TW' ? '顯示或隱藏畫布格線' : 'Show or hide canvas grid',
        group: state.document.locale === 'zh-TW' ? '畫布' : 'Canvas',
        shortcut: 'G',
        keywords: ['grid', 'canvas'],
        run: () => handleCanvasPatch({ showGrid: !state.document.canvas.showGrid }),
      },
      {
        id: 'toggle-labels',
        label: state.document.locale === 'zh-TW' ? '切換標註' : 'Toggle labels',
        detail: state.document.locale === 'zh-TW' ? '顯示或隱藏標註' : 'Show or hide labels',
        group: state.document.locale === 'zh-TW' ? '畫布' : 'Canvas',
        shortcut: 'L',
        keywords: ['labels', 'canvas'],
        run: () => handleCanvasPatch({ showLabels: !state.document.canvas.showLabels }),
      },
      {
        id: 'toggle-vectors',
        label: state.document.locale === 'zh-TW' ? '切換向量' : 'Toggle vectors',
        detail: state.document.locale === 'zh-TW' ? '顯示或隱藏向量提示' : 'Show or hide vector overlays',
        group: state.document.locale === 'zh-TW' ? '畫布' : 'Canvas',
        shortcut: 'V',
        keywords: ['vectors', 'canvas'],
        run: () => handleCanvasPatch({ showVectors: !state.document.canvas.showVectors }),
      },
      {
        id: 'mode-select',
        label: state.document.locale === 'zh-TW' ? '選取模式' : 'Select mode',
        detail: state.document.locale === 'zh-TW' ? '切換到一般選取互動' : 'Switch to selection mode',
        group: state.document.locale === 'zh-TW' ? '畫布' : 'Canvas',
        shortcut: 'S',
        keywords: ['select', 'mode'],
        run: () => handleCanvasPatch({ interactionMode: 'select' }),
      },
      {
        id: 'mode-pan',
        label: state.document.locale === 'zh-TW' ? '平移模式' : 'Pan mode',
        detail: state.document.locale === 'zh-TW' ? '切換到畫布平移' : 'Switch to canvas panning',
        group: state.document.locale === 'zh-TW' ? '畫布' : 'Canvas',
        shortcut: 'Space',
        keywords: ['pan', 'mode'],
        run: () => handleCanvasPatch({ interactionMode: 'pan' }),
      },
      ...TEMPLATE_CATALOG.map((template) => ({
        id: `template-${template.id}`,
        label: template.title[state.document.locale],
        detail: template.description[state.document.locale],
        group: state.document.locale === 'zh-TW' ? '模板' : 'Templates',
        shortcut: undefined,
        keywords: [...template.tags, template.id],
        run: () => handleTemplateSelect(template.id),
      })),
      {
        id: 'inspector-properties',
        label: state.document.locale === 'zh-TW' ? '屬性分頁' : 'Properties tab',
        detail: state.document.locale === 'zh-TW' ? '開啟右側屬性編輯' : 'Open the properties tab',
        group: state.document.locale === 'zh-TW' ? '檢視器' : 'Inspector',
        shortcut: '1',
        keywords: ['properties', 'inspector', 'tab'],
        run: () => handleInspectorTabChange('properties'),
      },
      {
        id: 'inspector-ir',
        label: state.document.locale === 'zh-TW' ? 'IR 分頁' : 'IR tab',
        detail: state.document.locale === 'zh-TW' ? '開啟 IR JSON 編輯器' : 'Open the IR JSON editor',
        group: state.document.locale === 'zh-TW' ? '檢視器' : 'Inspector',
        shortcut: '2',
        keywords: ['ir', 'json', 'inspector'],
        run: () => handleInspectorTabChange('ir'),
      },
      {
        id: 'inspector-svg',
        label: state.document.locale === 'zh-TW' ? 'SVG 分頁' : 'SVG tab',
        detail: state.document.locale === 'zh-TW' ? '查看輸出的 SVG' : 'View the generated SVG',
        group: state.document.locale === 'zh-TW' ? '檢視器' : 'Inspector',
        shortcut: '3',
        keywords: ['svg', 'inspector'],
        run: () => handleInspectorTabChange('svg'),
      },
      {
        id: 'inspector-validation',
        label: state.document.locale === 'zh-TW' ? '驗證分頁' : 'Validation tab',
        detail: state.document.locale === 'zh-TW' ? '查看檢查結果' : 'View the validation report',
        group: state.document.locale === 'zh-TW' ? '檢視器' : 'Inspector',
        shortcut: '4',
        keywords: ['validation', 'inspector'],
        run: () => handleInspectorTabChange('validation'),
      },
      {
        id: 'inspector-export',
        label: state.document.locale === 'zh-TW' ? '匯出分頁' : 'Export tab',
        detail: state.document.locale === 'zh-TW' ? '查看匯出動作' : 'Open export actions',
        group: state.document.locale === 'zh-TW' ? '檢視器' : 'Inspector',
        shortcut: '5',
        keywords: ['export', 'inspector'],
        run: () => handleInspectorTabChange('export'),
      },
    ],
    [
      handleCanvasPatch,
      handleCopySvg,
      handleDownloadSvg,
      handleInspectorTabChange,
      handleNewDocument,
      handleOpenDocument,
      handleSaveDocument,
      handleTemplateSelect,
      handleToggleInspector,
      handleToggleInspectorPanel,
      handleToggleLocale,
      handleToggleTemplatesPanel,
      handleToggleTheme,
      state.document.canvas.showGrid,
      state.document.canvas.showLabels,
      state.document.canvas.showVectors,
      state.document.locale,
      state.document.template,
      state.document.theme,
    ],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName ?? '';
      const isTypingTarget =
        tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT' || Boolean(target?.isContentEditable);
      const key = event.key.toLowerCase();
      const mod = event.metaKey || event.ctrlKey;

      if (mod && key === '/') {
        event.preventDefault();
        setCommandQuery('');
        setCommandPaletteOpen((open) => !open);
        return;
      }

      if (commandPaletteOpen) {
        if (key === 'escape') {
          event.preventDefault();
          handleCloseCommandPalette();
        }
        return;
      }

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
    commandPaletteOpen,
    handleCloseCommandPalette,
    state.document.canvas,
    state.document.locale,
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
        onOpenCommandPalette={handleOpenCommandPalette}
        fileLabel={fileLabel}
        mode={state.document.mode}
      />

      <div className="mobile-dock" aria-label={t('mobileTemplates')}>
        <ToolButton
          icon={<FolderOpenIcon />}
          label={t('mobileTemplates')}
          active={mobilePanel === 'templates'}
          onClick={handleToggleTemplatesPanel}
          compact
        />
        <ToolButton
          icon={<InspectIcon />}
          label={t('mobileInspector')}
          active={mobilePanel === 'inspector'}
          onClick={handleToggleInspectorPanel}
          compact
        />
        <ToolButton
          icon={<SearchIcon />}
          label={t('mobileCommands')}
          onClick={handleOpenCommandPalette}
          compact
        />
      </div>

      <div className="workspace-grid">
        <TemplateLibrary
          locale={state.document.locale}
          value={state.templateSearch}
          selectedTemplateId={state.document.template.type}
          onSearchChange={(query) => dispatch({ type: 'ui/templateSearch', query })}
          onTemplateSelect={handleTemplateSelect}
          className={`mobile-sheet mobile-sheet--templates ${mobilePanel === 'templates' ? 'is-open' : ''}`}
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
            className={`mobile-sheet mobile-sheet--inspector ${mobilePanel === 'inspector' ? 'is-open' : ''}`}
          />
        ) : null}
      </div>

      <CommandPalette
        locale={state.document.locale}
        open={commandPaletteOpen}
        query={commandQuery}
        commands={commandPaletteItems}
        onClose={handleCloseCommandPalette}
        onQueryChange={setCommandQuery}
      />

      <StatusBar locale={state.document.locale} status={statusText} validation={validation} />

      <input ref={fileInputRef} type="file" accept="application/json,.json" hidden onChange={handleOpenFileChange} />
    </div>
  );
}

export default App;
