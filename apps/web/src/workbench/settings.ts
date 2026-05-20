import type { InspectorTab } from './types';

export type UiDensity = 'comfortable' | 'compact';

export interface AppSettings {
  defaultInspectorTab: InspectorTab;
  showTooltips: boolean;
  showShortcuts: boolean;
  defaultShowGrid: boolean;
  defaultZoom: number;
  snapEnabled: boolean; // stub
  uiDensity: UiDensity;
  svgIncludeMetadata: boolean;
  svgInlineStyles: boolean;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  defaultInspectorTab: 'properties',
  showTooltips: true,
  showShortcuts: true,
  defaultShowGrid: true,
  defaultZoom: 1,
  snapEnabled: false,
  uiDensity: 'comfortable',
  svgIncludeMetadata: true,
  svgInlineStyles: true,
};

export const APP_SETTINGS_KEY = 'graphite-app-settings';

export function readAppSettings(): AppSettings {
  try {
    const raw = window.localStorage.getItem(APP_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_APP_SETTINGS };
    const p = JSON.parse(raw);
    const validTabs: InspectorTab[] = ['properties', 'ir', 'svg', 'validation', 'export'];
    const validZooms = [0.5, 0.75, 1, 1.5, 2];
    return {
      defaultInspectorTab: validTabs.includes(p.defaultInspectorTab) ? p.defaultInspectorTab : DEFAULT_APP_SETTINGS.defaultInspectorTab,
      showTooltips: typeof p.showTooltips === 'boolean' ? p.showTooltips : DEFAULT_APP_SETTINGS.showTooltips,
      showShortcuts: typeof p.showShortcuts === 'boolean' ? p.showShortcuts : DEFAULT_APP_SETTINGS.showShortcuts,
      defaultShowGrid: typeof p.defaultShowGrid === 'boolean' ? p.defaultShowGrid : DEFAULT_APP_SETTINGS.defaultShowGrid,
      defaultZoom: validZooms.includes(p.defaultZoom) ? p.defaultZoom : DEFAULT_APP_SETTINGS.defaultZoom,
      snapEnabled: typeof p.snapEnabled === 'boolean' ? p.snapEnabled : DEFAULT_APP_SETTINGS.snapEnabled,
      uiDensity: p.uiDensity === 'compact' ? 'compact' : 'comfortable',
      svgIncludeMetadata: typeof p.svgIncludeMetadata === 'boolean' ? p.svgIncludeMetadata : DEFAULT_APP_SETTINGS.svgIncludeMetadata,
      svgInlineStyles: typeof p.svgInlineStyles === 'boolean' ? p.svgInlineStyles : DEFAULT_APP_SETTINGS.svgInlineStyles,
    };
  } catch {
    return { ...DEFAULT_APP_SETTINGS };
  }
}

export function writeAppSettings(settings: AppSettings): void {
  try {
    window.localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}
