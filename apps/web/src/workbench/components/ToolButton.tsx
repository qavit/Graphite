import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ToolButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  label: string;
  shortcut?: string;
  active?: boolean;
  compact?: boolean;
  /** Hide the visible label; label is still exposed via title/aria-label for accessibility. */
  iconOnly?: boolean;
}

export function ToolButton({
  icon,
  label,
  shortcut,
  active = false,
  compact = false,
  iconOnly = false,
  className = '',
  children,
  ...props
}: ToolButtonProps) {
  const title = shortcut ? `${label} (${shortcut})` : label;

  return (
    <button
      {...props}
      type={props.type ?? 'button'}
      className={`tool-button ${active ? 'is-active' : ''} ${compact ? 'is-compact' : ''} ${iconOnly ? 'is-icon-only' : ''} ${className}`.trim()}
      title={title}
      aria-label={label}
    >
      {icon ? <span className="tool-button__icon">{icon}</span> : null}
      {!iconOnly && <span className="tool-button__label">{children ?? label}</span>}
      {!iconOnly && shortcut ? <kbd className="tool-button__shortcut">{shortcut}</kbd> : null}
    </button>
  );
}
