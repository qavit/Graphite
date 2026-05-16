import { useEffect, useMemo, useRef, useState } from 'react';
import { createTranslator } from '../i18n';
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
  const listRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);
  const t = createTranslator(locale);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      return;
    }
    setActiveIndex(0);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

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

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const cmd = filteredCommands[activeIndex];
      if (cmd) {
        cmd.run();
        onClose();
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  }

  if (!open) {
    return null;
  }

  // Build rows: insert group headers before first item of each group
  const rows: Array<{ type: 'group'; label: string } | { type: 'item'; command: CommandPaletteItem; index: number }> = [];
  let lastGroup: string | null = null;
  filteredCommands.forEach((command, index) => {
    if (command.group !== lastGroup) {
      rows.push({ type: 'group', label: command.group });
      lastGroup = command.group;
    }
    rows.push({ type: 'item', command, index });
  });

  return (
    <div className="command-palette-backdrop" role="presentation" onClick={onClose}>
      <section
        className="command-palette"
        role="dialog"
        aria-modal="true"
        aria-label={t('commandPaletteTitle')}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="command-palette__header">
          <div>
            <p className="eyebrow">{t('commandPaletteTitle')}</p>
            <h2>{t('commandPaletteSubtitle')}</h2>
          </div>
          <span className="command-palette__hint">{t('commandPaletteHint')}</span>
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
            placeholder={t('commandPalettePlaceholder')}
          />
        </label>

        <div ref={listRef} className="command-palette__list" role="listbox">
          {rows.length === 0 ? (
            <p className="empty-state">{t('commandPaletteEmpty')}</p>
          ) : (
            rows.map((row) => {
              if (row.type === 'group') {
                return (
                  <div key={`group-${row.label}`} className="command-group-header" role="presentation">
                    {row.label}
                  </div>
                );
              }
              const { command, index } = row;
              const isActive = index === activeIndex;
              return (
                <button
                  key={command.id}
                  ref={isActive ? activeItemRef : null}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`command-item${isActive ? ' is-active' : ''}`}
                  onMouseEnter={() => setActiveIndex(index)}
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
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
