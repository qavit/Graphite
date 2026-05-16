import type { UiLocale, WorkbenchValidationReport } from '../types';

interface StatusBarProps {
  locale: UiLocale;
  status: string;
  validation: WorkbenchValidationReport;
}

export function StatusBar({ locale, status, validation }: StatusBarProps) {
  return (
    <footer className="statusbar">
      <span className="statusbar__badge">{status}</span>
      <span>{locale === 'zh-TW' ? '驗證' : 'Validation'}: {validation.summary}</span>
      <span className="statusbar__meta">
        {validation.status === 'success' ? 'OK' : 'Review'}
      </span>
    </footer>
  );
}
