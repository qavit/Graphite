import { useEffect, useMemo, useRef } from 'react';
import type { UiLocale } from '../types';
import { SearchIcon } from './icons';

export interface CommandPaletteItem {
  id: string;
  label: string;
  detail: string;
  group: string;
  shortcut?: string;
  keywords: string[];
  run: () => void;
}

interface CommandPaletteProps {
  locale: UiLocale;
  open: boolean;
  query: string;
  commands: CommandPaletteItem[];
  onClose: () => void;
  onQueryChange: (query: string) => void;
}

export function CommandPalette({ locale, open, query, commands, onClose, onQueryChange }: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  const filteredCommands = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) {
      return commands;
    }

    return commands.filter((command) => {
      const haystack = [command.label, command.detail, command.group, ...command.keywords].join(' ').toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });
  }, [commands, query]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="command-palette-backdrop" role="presentation" onClick={onClose}>
      <section className="command-palette" role="dialog" aria-modal="true" aria-label={locale === 'zh-TW' ? '命令面板' : 'Command palette'} onClick={(event) => event.stopPropagation()}>
        <div className="command-palette__header">
          <div>
            <p className="eyebrow">{locale === 'zh-TW' ? '命令面板' : 'Command Palette'}</p>
            <h2>{locale === 'zh-TW' ? '快速操作' : 'Quick actions'}</h2>
          </div>
          <span className="command-palette__hint">{locale === 'zh-TW' ? '按 Esc 關閉' : 'Press Esc to close'}</span>
        </div>

        <label className="search-field command-palette__search">
          <span className="search-field__icon">
            <SearchIcon />
          </span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={locale === 'zh-TW' ? '搜尋命令、快捷操作或面板' : 'Search commands, shortcuts, or panels'}
          />
        </label>

        <div className="command-palette__list">
          {filteredCommands.length === 0 ? (
            <p className="empty-state">{locale === 'zh-TW' ? '找不到符合的命令。' : 'No matching commands.'}</p>
          ) : (
            filteredCommands.map((command) => (
              <button
                key={command.id}
                type="button"
                className="command-item"
                onClick={() => {
                  command.run();
                  onClose();
                }}
              >
                <span className="command-item__meta">
                  <strong>{command.label}</strong>
                  <span>{command.detail}</span>
                </span>
                <span className="command-item__group">{command.group}</span>
                {command.shortcut ? <kbd className="tool-button__shortcut">{command.shortcut}</kbd> : null}
              </button>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
