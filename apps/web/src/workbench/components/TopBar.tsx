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
  SaveIcon,
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
  fileLabel,
  mode,
}: TopBarProps) {
  const modeLabel =
    mode === 'teacher'
      ? locale === 'zh-TW'
        ? '教師版'
        : 'Teacher'
      : mode === 'student'
        ? locale === 'zh-TW'
          ? '學生版'
          : 'Student'
        : locale === 'zh-TW'
          ? '極簡版'
          : 'Minimal';

  return (
    <header className="topbar">
      <div className="brand-block">
        <div className="brand-mark">Graphite</div>
        <div className="brand-copy">
          <div className="brand-title">{locale === 'zh-TW' ? 'Teacher Workbench' : 'Teacher Workbench'}</div>
          <div className="brand-subtitle">{locale === 'zh-TW' ? '可編輯、可驗證的 STEM 教學圖工作台' : 'Editable, validated STEM teaching diagrams'}</div>
        </div>
      </div>

      <div className="topbar-center">
        <div className="file-pill">
          <FileIcon />
          <span>{fileLabel}</span>
        </div>
        <div className="mode-pill">{modeLabel}</div>
        <div className="status-pill">{status}</div>
      </div>

      <div className="topbar-actions">
        <ToolButton icon={<PencilIcon />} label={locale === 'zh-TW' ? '新文件' : 'New'} shortcut="⌘N" onClick={onNewDocument} />
        <ToolButton icon={<FolderOpenIcon />} label={locale === 'zh-TW' ? '開啟 JSON' : 'Open JSON'} shortcut="⌘O" onClick={onOpenDocument} />
        <ToolButton icon={<SaveIcon />} label={locale === 'zh-TW' ? '儲存 JSON' : 'Save JSON'} shortcut="⌘S" onClick={onSaveDocument} />
        <ToolButton icon={<CopyIcon />} label={locale === 'zh-TW' ? '複製 SVG' : 'Copy SVG'} shortcut="⌘⇧C" onClick={onCopySvg} />
        <ToolButton icon={<DownloadIcon />} label={locale === 'zh-TW' ? '下載 SVG' : 'Download SVG'} shortcut="⌘⇧D" onClick={onDownloadSvg} />
        <ToolButton
          icon={theme === 'light' ? <MoonIcon /> : <SunIcon />}
          label={theme === 'light' ? (locale === 'zh-TW' ? '切換深色' : 'Dark theme') : (locale === 'zh-TW' ? '切換淺色' : 'Light theme')}
          onClick={onToggleTheme}
        />
        <ToolButton
          icon={<LanguageIcon />}
          label={locale === 'zh-TW' ? '切換語言' : 'Toggle language'}
          shortcut="⌘⇧L"
          onClick={onToggleLocale}
        />
        <ToolButton
          icon={<PanelIcon />}
          label={locale === 'zh-TW' ? '切換檢視器' : 'Toggle inspector'}
          shortcut="⌘I"
          active={inspectorOpen}
          onClick={onToggleInspector}
        />
      </div>
    </header>
  );
}
