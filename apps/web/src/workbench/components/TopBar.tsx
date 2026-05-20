import { useEffect, useRef, useState } from 'react';
import { createTranslator } from '../i18n';
import type { DiagramSpec } from '@graphite/diagram-spec';
import type { UiLocale, UiTheme } from '../types';
import {
  CommandIcon,
  CopyIcon,
  DownloadIcon,
  LanguageIcon,
  MoonIcon,
  SettingsIcon,
  SunIcon,
} from './icons';
import { ToolButton } from './ToolButton';

type DocStatus = 'valid' | 'warning' | 'error';

interface TopBarProps {
  locale: UiLocale;
  theme: UiTheme;
  fileLabel: string;
  docTitle: string;
  docStatus: DocStatus;
  spec: DiagramSpec | null;
  templateName: string;
  onTitleChange: (title: string) => void;
  onNewDocument: () => void;
  onOpenDocument: () => void;
  onSaveDocument: () => void;
  onCopySvg: () => void;
  onDownloadSvg: () => void;
  onOpenCommandPalette: () => void;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  onToggleLocale: () => void;
}

function FilenamePopover({
  locale,
  fileLabel,
  docTitle,
  docStatus,
  spec,
  templateName,
  onTitleChange,
  onNewDocument,
  onOpenDocument,
  onSaveDocument,
  onClose,
}: {
  locale: UiLocale;
  fileLabel: string;
  docTitle: string;
  docStatus: DocStatus;
  spec: DiagramSpec | null;
  templateName: string;
  onTitleChange: (title: string) => void;
  onNewDocument: () => void;
  onOpenDocument: () => void;
  onSaveDocument: () => void;
  onClose: () => void;
}) {
  const t = createTranslator(locale);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const statusLabel = docStatus === 'valid' ? t('docStatusValid') : docStatus === 'warning' ? t('docStatusWarning') : t('docStatusError');

  return (
    <div className="filename-popover">
      <div className="filename-popover__section">
        <label className="filename-popover__label">{locale === 'zh-TW' ? '文件名稱' : 'Document name'}</label>
        <input
          ref={inputRef}
          className="filename-popover__input"
          type="text"
          value={docTitle}
          placeholder={fileLabel}
          onChange={(e) => onTitleChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') onClose(); }}
        />
      </div>

      <div className="filename-popover__meta">
        <div className="filename-popover__meta-row">
          <span>{locale === 'zh-TW' ? '模板' : 'Template'}</span>
          <strong>{templateName}</strong>
        </div>
        {spec && (
          <>
            <div className="filename-popover__meta-row">
              <span>{locale === 'zh-TW' ? '畫布' : 'Canvas'}</span>
              <strong>{spec.canvas.width} × {spec.canvas.height}</strong>
            </div>
            <div className="filename-popover__meta-row">
              <span>{locale === 'zh-TW' ? '元素' : 'Elements'}</span>
              <strong>{spec.elements.length}</strong>
            </div>
          </>
        )}
        <div className="filename-popover__meta-row">
          <span>{locale === 'zh-TW' ? '狀態' : 'Status'}</span>
          <strong className={`doc-status-badge doc-status-badge--${docStatus}`}>{statusLabel}</strong>
        </div>
      </div>

      <div className="filename-popover__actions">
        <button type="button" className="filename-popover__action-btn" onClick={() => { onNewDocument(); onClose(); }}>
          {locale === 'zh-TW' ? '新文件' : 'New'}
        </button>
        <button type="button" className="filename-popover__action-btn" onClick={() => { onOpenDocument(); onClose(); }}>
          {locale === 'zh-TW' ? '開啟 JSON' : 'Open JSON'}
        </button>
        <button type="button" className="filename-popover__action-btn" onClick={() => { onSaveDocument(); onClose(); }}>
          {locale === 'zh-TW' ? '儲存 JSON' : 'Save JSON'}
        </button>
      </div>
    </div>
  );
}

function ExportDropdown({
  locale,
  onCopySvg,
  onDownloadSvg,
  onClose,
}: {
  locale: UiLocale;
  onCopySvg: () => void;
  onDownloadSvg: () => void;
  onClose: () => void;
}) {
  return (
    <div className="export-dropdown">
      <button
        type="button"
        className="export-dropdown__item"
        onClick={() => { onCopySvg(); onClose(); }}
      >
        <CopyIcon />
        <span>{locale === 'zh-TW' ? '複製 SVG' : 'Copy SVG'}</span>
        <kbd>⌘⇧C</kbd>
      </button>
      <button
        type="button"
        className="export-dropdown__item"
        onClick={() => { onDownloadSvg(); onClose(); }}
      >
        <DownloadIcon />
        <span>{locale === 'zh-TW' ? '下載 SVG' : 'Download SVG'}</span>
        <kbd>⌘⇧D</kbd>
      </button>
    </div>
  );
}

export function TopBar({
  locale,
  theme,
  fileLabel,
  docTitle,
  docStatus,
  spec,
  templateName,
  onTitleChange,
  onNewDocument,
  onOpenDocument,
  onSaveDocument,
  onCopySvg,
  onDownloadSvg,
  onOpenCommandPalette,
  onOpenSettings,
  onToggleTheme,
  onToggleLocale,
}: TopBarProps) {
  const t = createTranslator(locale);
  const [filenameOpen, setFilenameOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const filenameRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filenameOpen && !exportOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (filenameOpen && filenameRef.current && !filenameRef.current.contains(e.target as Node)) {
        setFilenameOpen(false);
      }
      if (exportOpen && exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [filenameOpen, exportOpen]);

  const displayName = docTitle.trim() || fileLabel;

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <div className="brand-mark" aria-label="Graphite">G</div>
      </div>

      <div className="topbar-center">
        <div className="filename-anchor" ref={filenameRef}>
          <button
            type="button"
            className={`filename-btn${filenameOpen ? ' is-open' : ''}`}
            onClick={() => { setFilenameOpen((o) => !o); setExportOpen(false); }}
            title={locale === 'zh-TW' ? '文件資訊' : 'Document info'}
          >
            <span className="filename-btn__name">{displayName}</span>
            <span className="filename-btn__caret" aria-hidden="true">▾</span>
          </button>
          {filenameOpen && (
            <FilenamePopover
              locale={locale}
              fileLabel={fileLabel}
              docTitle={docTitle}
              docStatus={docStatus}
              spec={spec}
              templateName={templateName}
              onTitleChange={onTitleChange}
              onNewDocument={onNewDocument}
              onOpenDocument={onOpenDocument}
              onSaveDocument={onSaveDocument}
              onClose={() => setFilenameOpen(false)}
            />
          )}
        </div>

        <div className={`doc-status-badge doc-status-badge--${docStatus}`} aria-live="polite">
          {docStatus === 'valid' ? t('docStatusValid') : docStatus === 'warning' ? t('docStatusWarning') : t('docStatusError')}
        </div>
      </div>

      <div className="topbar-actions">
        <div className="export-anchor" ref={exportRef}>
          <button
            type="button"
            className={`export-cta${exportOpen ? ' is-open' : ''}`}
            onClick={() => { setExportOpen((o) => !o); setFilenameOpen(false); }}
          >
            <DownloadIcon />
            <span>{locale === 'zh-TW' ? '匯出' : 'Export'}</span>
            <span className="export-cta__caret" aria-hidden="true">▾</span>
          </button>
          {exportOpen && (
            <ExportDropdown
              locale={locale}
              onCopySvg={onCopySvg}
              onDownloadSvg={onDownloadSvg}
              onClose={() => setExportOpen(false)}
            />
          )}
        </div>

        <div className="topbar-divider" aria-hidden="true" />

        <ToolButton
          iconOnly
          icon={theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          label={theme === 'dark' ? t('toggleThemeLight') : t('toggleThemeDark')}
          onClick={onToggleTheme}
        />
        <ToolButton
          iconOnly
          icon={<LanguageIcon />}
          label={t('toggleLanguage')}
          onClick={onToggleLocale}
        />
        <ToolButton
          iconOnly
          icon={<SettingsIcon />}
          label={t('settingsTitle')}
          shortcut="⌘,"
          onClick={onOpenSettings}
        />
        <ToolButton
          iconOnly
          icon={<CommandIcon />}
          label={t('openCommandPalette')}
          shortcut="⌘/"
          onClick={onOpenCommandPalette}
        />
      </div>
    </header>
  );
}
