import type { UiLocale, TemplateId, CircuitPresetId } from './types';

export interface TemplateCatalogEntry {
  id: TemplateId;
  group: 'physics' | 'electromagnetism' | 'circuits';
  accent: string;
  title: Record<UiLocale, string>;
  subtitle: Record<UiLocale, string>;
  description: Record<UiLocale, string>;
  tags: string[];
}

export const TEMPLATE_CATALOG: TemplateCatalogEntry[] = [
  {
    id: 'inclined',
    group: 'physics',
    accent: '#0f766e',
    title: {
      'zh-TW': '斜面受力',
      'en-US': 'Inclined Plane',
    },
    subtitle: {
      'zh-TW': '力學 / 向量',
      'en-US': 'Mechanics / vectors',
    },
    description: {
      'zh-TW': '斜面、重力、正向力、摩擦力與角度標註。',
      'en-US': 'Incline, gravity, normal force, friction, and angle labels.',
    },
    tags: ['physics', 'force', 'vector', 'teacher'],
  },
  {
    id: 'particle',
    group: 'electromagnetism',
    accent: '#2563eb',
    title: {
      'zh-TW': '帶電粒子',
      'en-US': 'Charged Particle',
    },
    subtitle: {
      'zh-TW': '電磁學 / 軌跡',
      'en-US': 'Electromagnetism / trajectory',
    },
    description: {
      'zh-TW': '磁場與電場中的粒子偏轉、受力與軌跡。',
      'en-US': 'Particle deflection, force, and trajectory in magnetic or electric fields.',
    },
    tags: ['physics', 'field', 'vector', 'trajectory'],
  },
  {
    id: 'circuit',
    group: 'circuits',
    accent: '#b45309',
    title: {
      'zh-TW': '簡單電路',
      'en-US': 'Simple Circuit',
    },
    subtitle: {
      'zh-TW': '電學 / 元件',
      'en-US': 'Circuits / components',
    },
    description: {
      'zh-TW': '串聯、並聯、開關、電阻與燈泡的標準符號。',
      'en-US': 'Standard symbols for series / parallel circuits, switches, resistors, and bulbs.',
    },
    tags: ['physics', 'circuit', 'symbols', 'teacher'],
  },
];

export const TEMPLATE_GROUP_LABELS: Record<TemplateCatalogEntry['group'], Record<UiLocale, string>> = {
  physics: {
    'zh-TW': '物理',
    'en-US': 'Physics',
  },
  electromagnetism: {
    'zh-TW': '電磁學',
    'en-US': 'Electromagnetism',
  },
  circuits: {
    'zh-TW': '電路',
    'en-US': 'Circuits',
  },
};

export const CIRCUIT_PRESET_META: Record<CircuitPresetId, Record<UiLocale, { label: string; hint: string }>> = {
  seriesFull: {
    'zh-TW': { label: '串聯完整版', hint: '電池、開關、電阻、燈泡' },
    'en-US': { label: 'Full series', hint: 'Battery, switch, resistor, bulb' },
  },
  seriesMinimal: {
    'zh-TW': { label: '串聯簡版', hint: '最少元件，快速出題' },
    'en-US': { label: 'Minimal series', hint: 'Few components for quick problems' },
  },
  seriesOpenSwitch: {
    'zh-TW': { label: '串聯斷路版', hint: '適合通路 / 斷路判讀' },
    'en-US': { label: 'Open switch series', hint: 'Good for circuit open/closed questions' },
  },
  parallelResistorBulb: {
    'zh-TW': { label: '並聯電阻 + 燈泡', hint: '常見基礎並聯圖' },
    'en-US': { label: 'Parallel resistor + bulb', hint: 'Common starter parallel layout' },
  },
  parallelTwoResistors: {
    'zh-TW': { label: '並聯雙電阻', hint: '可比較分流與標註' },
    'en-US': { label: 'Parallel dual resistors', hint: 'Compare current split and labels' },
  },
};

export const TEMPLATE_IDS = TEMPLATE_CATALOG.map((item) => item.id);

