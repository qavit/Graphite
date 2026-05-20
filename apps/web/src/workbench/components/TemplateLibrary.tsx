import type { ChangeEvent, CSSProperties } from 'react';
import { TEMPLATE_GROUP_LABELS, TEMPLATE_CATALOG } from '../catalog';
import type { TemplateId, UiLocale } from '../types';
import { SearchIcon } from './icons';

interface TemplateLibraryProps {
  locale: UiLocale;
  value: string;
  selectedTemplateId: TemplateId;
  onSearchChange: (value: string) => void;
  onTemplateSelect: (templateId: TemplateId) => void;
  className?: string;
}

function matchesQuery(locale: UiLocale, query: string, templateId: TemplateId): boolean {
  if (!query.trim()) {
    return true;
  }

  const template = TEMPLATE_CATALOG.find((entry) => entry.id === templateId);
  if (!template) {
    return false;
  }

  const haystack = [
    template.title[locale],
    template.subtitle[locale],
    template.description[locale],
    ...template.tags,
  ]
    .join(' ')
    .toLowerCase();

  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .every((token) => haystack.includes(token));
}

export function TemplateLibrary({
  locale,
  value,
  selectedTemplateId,
  onSearchChange,
  onTemplateSelect,
  className = '',
}: TemplateLibraryProps) {
  const filteredTemplates = TEMPLATE_CATALOG.filter((entry) => matchesQuery(locale, value, entry.id));
  const groupedTemplates = filteredTemplates.reduce<Record<string, typeof filteredTemplates>>((acc, template) => {
    acc[template.group] ??= [];
    acc[template.group].push(template);
    return acc;
  }, {});

  const groups = Object.keys(groupedTemplates) as Array<keyof typeof TEMPLATE_GROUP_LABELS>;

  return (
    <section className={`surface surface--sidebar ${className}`.trim()}>
      <div className="surface__header">
        <h2 className="surface__title">{locale === 'zh-TW' ? '模板庫' : 'Templates'}</h2>
      </div>

      <label className="search-field">
        <span className="search-field__icon">
          <SearchIcon />
        </span>
        <input
          type="search"
          value={value}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value)}
          placeholder={locale === 'zh-TW' ? '搜尋模板、標籤或用途' : 'Search templates, tags, or purpose'}
        />
      </label>

      <div className="template-groups">
        {groups.length === 0 ? (
          <p className="empty-state">{locale === 'zh-TW' ? '沒有符合的模板。' : 'No templates match this search.'}</p>
        ) : (
          groups.map((group) => (
            <section key={group} className="template-group">
              <div className="template-group__header">
                <h3>{TEMPLATE_GROUP_LABELS[group][locale]}</h3>
                <span>{group}</span>
              </div>
              <div className="template-list">
                {groupedTemplates[group].map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    className={`template-card ${selectedTemplateId === template.id ? 'is-active' : ''}`}
                    onClick={() => onTemplateSelect(template.id)}
                    style={{ '--accent': template.accent } as CSSProperties}
                    aria-pressed={selectedTemplateId === template.id}
                  >
                    <span className="template-card__subtitle">{template.subtitle[locale]}</span>
                    <span className="template-card__title">{template.title[locale]}</span>
                    <span className="template-card__description">{template.description[locale]}</span>
                    <span className="template-card__tags">
                      {template.tags.map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </section>
  );
}
