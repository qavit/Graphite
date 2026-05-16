import { createTranslator } from '../i18n';
import type { UiLocale, UiTheme, WorkbenchDocument } from '../types';
import {
  CopyIcon,
  DownloadIcon,
  FileIcon,
  FolderOpenIcon,
  LanguageIcon,
  MoonIcon,
  PanelIcon,
  PencilIcon,
  SearchIcon,
  SaveIcon,
  SettingsIcon,
  SunIcon,
} from './icons';
import { ToolButton } from './ToolButton';

interface TopBarProps {
  locale: UiLocale;
  theme: UiTheme;
  inspectorOpen: boolean;
  status: string;
  onNewDocument: () => void;
  onOpenDocument: () => void;
  onSaveDocument: () => void;
  onCopySvg: () => void;
  onDownloadSvg: () => void;
  onToggleTheme: () => void;
  onToggleLocale: () => void;
  onToggleInspector: () => void;
  onOpenCommandPalette: () => void;
  onOpenSettings: () => void;
  fileLabel: string;
  mode: WorkbenchDocument['mode'];
}

export function TopBar({
  locale,
  theme,
  inspectorOpen,
  status,
  onNewDocument,
  onOpenDocument,
  onSaveDocument,
  onCopySvg,
  onDownloadSvg,
  onToggleTheme,
  onToggleLocale,
  onToggleInspector,
  onOpenCommandPalette,
  onOpenSettings,
  fileLabel,
  mode,
}: TopBarProps) {
  const t = createTranslator(locale);
  const modeLabels: Record<WorkbenchDocument['mode'], string> = {
    teacher: t('modeTeacher'),
    student: t('modeStudent'),
    minimal: t('modeMinimal'),
  };

  return (
    <header className="topbar">
      <div className="brand-block">
        <div className="brand-mark">Graphite</div>
        <div className="brand-copy">
          <div className="brand-title">{t('workbenchTitle')}</div>
          <div className="brand-subtitle">{t('brandSubtitle')}</div>
        </div>
      </div>

      <div className="topbar-center">
        <div className="file-pill">
          <FileIcon />
          <span>{fileLabel}</span>
        </div>
        <div className="mode-pill">{modeLabels[mode]}</div>
        <div className="status-pill">{status}</div>
      </div>

      <div className="topbar-actions">
        <ToolButton icon={<PencilIcon />} label={t('newDocument')} shortcut="⌘N" onClick={onNewDocument} />
        <ToolButton icon={<FolderOpenIcon />} label={t('openDocument')} shortcut="⌘O" onClick={onOpenDocument} />
        <ToolButton icon={<SaveIcon />} label={t('saveDocument')} shortcut="⌘S" onClick={onSaveDocument} />
        <ToolButton icon={<CopyIcon />} label={t('copySvg')} shortcut="⌘⇧C" onClick={onCopySvg} />
        <ToolButton icon={<DownloadIcon />} label={t('downloadSvg')} shortcut="⌘⇧D" onClick={onDownloadSvg} />
        <ToolButton
          icon={theme === 'light' ? <MoonIcon /> : <SunIcon />}
          label={theme === 'light' ? t('toggleThemeDark') : t('toggleThemeLight')}
          onClick={onToggleTheme}
        />
        <ToolButton
          icon={<LanguageIcon />}
          label={t('toggleLanguage')}
          shortcut="⌘⇧L"
          onClick={onToggleLocale}
        />
        <ToolButton
          icon={<PanelIcon />}
          label={t('toggleInspector')}
          shortcut="⌘I"
          active={inspectorOpen}
          onClick={onToggleInspector}
        />
        <ToolButton
          icon={<SearchIcon />}
          label={t('openCommandPalette')}
          shortcut="⌘/"
          onClick={onOpenCommandPalette}
        />
        <ToolButton
          icon={<SettingsIcon />}
          label={t('settingsTitle')}
          onClick={onOpenSettings}
        />
      </div>
    </header>
  );
}
