import { useEffect, useRef } from 'react';
import { createTranslator, getLocaleLabel } from '../i18n';
import type { AppSettings, UiDensity } from '../settings';
import type { InspectorTab, UiLocale, UiTheme } from '../types';

interface SettingsDialogProps {
  open: boolean;
  locale: UiLocale;
  theme: UiTheme;
  settings: AppSettings;
  onClose: () => void;
  onLocaleChange: (locale: UiLocale) => void;
  onThemeChange: (theme: UiTheme) => void;
  onSettingsChange: (settings: AppSettings) => void;
}

const INSPECTOR_TABS: InspectorTab[] = ['properties', 'ir', 'svg', 'validation', 'export'];
const ZOOM_OPTIONS = [0.5, 0.75, 1, 1.5, 2] as const;

export function SettingsDialog({
  open,
  locale,
  theme,
  settings,
  onClose,
  onLocaleChange,
  onThemeChange,
  onSettingsChange,
}: SettingsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const t = createTranslator(locale);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      el.showModal();
    } else {
      el.close();
    }
  }, [open]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    el.addEventListener('cancel', onCancel);
    return () => el.removeEventListener('cancel', onCancel);
  }, [onClose]);

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) onClose();
  }

  function patch(partial: Partial<AppSettings>) {
    onSettingsChange({ ...settings, ...partial });
  }

  const tabLabels: Record<InspectorTab, string> = {
    properties: t('propertiesTab'),
    ir: t('irTab'),
    svg: t('svgTab'),
    validation: t('validationTab'),
    export: t('exportTab'),
  };

  return (
    <dialog ref={dialogRef} className="settings-dialog" onClick={handleBackdropClick} aria-label={t('settingsTitle')}>
      <div className="settings-dialog__panel">
        <div className="settings-dialog__header">
          <h2>{t('settingsTitle')}</h2>
          <button type="button" className="settings-dialog__close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <section className="settings-dialog__section">
          <h3>{t('settingsGeneral')}</h3>
          <div className="field-stack">
            <label className="field">
              <span className="field-label">{t('languageLabel')}</span>
              <select className="select" value={locale} onChange={(e) => onLocaleChange(e.target.value as UiLocale)}>
                <option value="zh-TW">{getLocaleLabel('zh-TW')}</option>
                <option value="en-US">{getLocaleLabel('en-US')}</option>
              </select>
            </label>
            <label className="field">
              <span className="field-label">{t('themeLabel')}</span>
              <select className="select" value={theme} onChange={(e) => onThemeChange(e.target.value as UiTheme)}>
                <option value="light">{t('themeLight')}</option>
                <option value="dark">{t('themeDark')}</option>
              </select>
            </label>
            <label className="field">
              <span className="field-label">{t('settingDensity')}</span>
              <select
                className="select"
                value={settings.uiDensity}
                onChange={(e) => patch({ uiDensity: e.target.value as UiDensity })}
              >
                <option value="comfortable">{t('densityComfortable')}</option>
                <option value="compact">{t('densityCompact')}</option>
              </select>
            </label>
          </div>
        </section>

        <section className="settings-dialog__section">
          <h3>{t('settingsEditor')}</h3>
          <div className="field-stack">
            <label className="field">
              <span className="field-label">{t('settingDefaultTab')}</span>
              <select
                className="select"
                value={settings.defaultInspectorTab}
                onChange={(e) => patch({ defaultInspectorTab: e.target.value as InspectorTab })}
              >
                {INSPECTOR_TABS.map((tab) => (
                  <option key={tab} value={tab}>{tabLabels[tab]}</option>
                ))}
              </select>
            </label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.showTooltips}
                onChange={(e) => patch({ showTooltips: e.target.checked })}
              />
              <span>{t('settingShowTooltips')}</span>
            </label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.showShortcuts}
                onChange={(e) => patch({ showShortcuts: e.target.checked })}
              />
              <span>{t('settingShowShortcuts')}</span>
            </label>
          </div>
        </section>

        <section className="settings-dialog__section">
          <h3>{t('settingsCanvas')}</h3>
          <div className="field-stack">
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.defaultShowGrid}
                onChange={(e) => patch({ defaultShowGrid: e.target.checked })}
              />
              <span>{t('settingDefaultGrid')}</span>
            </label>
            <label className="field">
              <span className="field-label">{t('settingDefaultZoom')}</span>
              <select
                className="select"
                value={settings.defaultZoom}
                onChange={(e) => patch({ defaultZoom: Number(e.target.value) })}
              >
                {ZOOM_OPTIONS.map((z) => (
                  <option key={z} value={z}>{Math.round(z * 100)}%</option>
                ))}
              </select>
            </label>
            <label className="toggle settings-toggle--disabled">
              <input type="checkbox" checked={false} disabled />
              <span>{t('settingSnap')}</span>
            </label>
          </div>
        </section>
      </div>
    </dialog>
  );
}
