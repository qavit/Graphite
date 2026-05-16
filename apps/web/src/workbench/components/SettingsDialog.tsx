import { useEffect, useRef } from 'react';
import { createTranslator, getLocaleLabel } from '../i18n';
import type { UiLocale, UiTheme } from '../types';

interface SettingsDialogProps {
  open: boolean;
  locale: UiLocale;
  theme: UiTheme;
  onClose: () => void;
  onLocaleChange: (locale: UiLocale) => void;
  onThemeChange: (theme: UiTheme) => void;
}

export function SettingsDialog({ open, locale, theme, onClose, onLocaleChange, onThemeChange }: SettingsDialogProps) {
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
    if (e.target === dialogRef.current) {
      onClose();
    }
  }

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
              <select
                className="select"
                value={locale}
                onChange={(e) => onLocaleChange(e.target.value as UiLocale)}
              >
                <option value="zh-TW">{getLocaleLabel('zh-TW')}</option>
                <option value="en-US">{getLocaleLabel('en-US')}</option>
              </select>
            </label>

            <label className="field">
              <span className="field-label">{t('themeLabel')}</span>
              <select
                className="select"
                value={theme}
                onChange={(e) => onThemeChange(e.target.value as UiTheme)}
              >
                <option value="light">{t('themeLight')}</option>
                <option value="dark">{t('themeDark')}</option>
              </select>
            </label>
          </div>
        </section>
      </div>
    </dialog>
  );
}
