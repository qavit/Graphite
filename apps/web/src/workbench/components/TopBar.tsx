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
  onToggleInspector: () => void;
  onOpenCommandPalette: () => void;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  onToggleLocale: () => void;
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
  onToggleInspector,
  onOpenCommandPalette,
  onOpenSettings,
  onToggleTheme,
  onToggleLocale,
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
        <div className="topbar-group">
          <ToolButton iconOnly icon={<PencilIcon />} label={t('newDocument')} shortcut="⌘N" onClick={onNewDocument} />
          <ToolButton iconOnly icon={<FolderOpenIcon />} label={t('openDocument')} shortcut="⌘O" onClick={onOpenDocument} />
          <ToolButton iconOnly icon={<SaveIcon />} label={t('saveDocument')} shortcut="⌘S" onClick={onSaveDocument} />
        </div>

        <div className="topbar-divider" aria-hidden="true" />

        <div className="topbar-group">
          <ToolButton iconOnly icon={<CopyIcon />} label={t('copySvg')} shortcut="⌘⇧C" onClick={onCopySvg} />
          <ToolButton iconOnly icon={<DownloadIcon />} label={t('downloadSvg')} shortcut="⌘⇧D" onClick={onDownloadSvg} />
        </div>

        <div className="topbar-divider" aria-hidden="true" />

        <div className="topbar-group">
          <ToolButton
            iconOnly
            icon={<PanelIcon />}
            label={t('toggleInspector')}
            shortcut="⌘I"
            active={inspectorOpen}
            onClick={onToggleInspector}
          />
          <ToolButton
            iconOnly
            icon={<SearchIcon />}
            label={t('openCommandPalette')}
            shortcut="⌘/"
            onClick={onOpenCommandPalette}
          />
        </div>

        <div className="topbar-actions-right">
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
            onClick={onOpenSettings}
          />
        </div>
      </div>
    </header>
  );
}
