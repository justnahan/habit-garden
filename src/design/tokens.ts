/**
 * 設計 token 的程式化入口。
 *
 * 單一真實來源是 `tokens.css` 的三層 CSS 變數；本檔把「語意 token」包成
 * 可被 TS/React 匯入的 `var(--…)` 參照，讓元件不用散寫 magic value，
 * 也能在 style 物件、SVG、canvas 中引用同一套 token。
 *
 *   import { token } from '@/design/tokens';
 *   <div style={{ color: token.text, background: token.surface }} />
 */

/** 回傳指向某語意 token 的 CSS 變數參照字串。 */
export const cssVar = (name: string): string => `var(--${name})`;

/** 語意 token（②system 層）。值都是 CSS 變數參照，隨深/淺色模式自動切換。 */
export const token = {
  // 底層次
  canvas: cssVar('color-canvas'),
  surface: cssVar('color-surface'),
  raised: cssVar('color-raised'),
  sunken: cssVar('color-sunken'),
  // 文字
  text: cssVar('color-text'),
  textMuted: cssVar('color-text-muted'),
  textFaint: cssVar('color-text-faint'),
  // 邊界
  border: cssVar('color-border'),
  borderStrong: cssVar('color-border-strong'),
  rule: cssVar('color-rule'),
  // 品牌 / accent
  primary: cssVar('color-primary'),
  accent: cssVar('color-accent'),
  accentSoft: cssVar('color-accent-soft'),
  // 語意狀態
  success: cssVar('color-success'),
  warning: cssVar('color-warning'),
  danger: cssVar('color-danger'),
  info: cssVar('color-info'),
  // 間距
  space: (step: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9): string => cssVar(`space-${step}`),
  // 形狀
  radiusSm: cssVar('radius-sm'),
  radiusMd: cssVar('radius-md'),
  radiusLg: cssVar('radius-lg'),
  radiusFull: cssVar('radius-full'),
} as const;

import type { GrowthStage, PlantType } from '../types';

/** 生長階段的視覺語意 token 名（映射到 `--color-stage-*`）。 */
export const stageColorVar: Record<GrowthStage, string> = {
  seed: cssVar('color-stage-seed'),
  sprout: cssVar('color-stage-sprout'),
  growing: cssVar('color-stage-growing'),
  blooming: cssVar('color-stage-blooming'),
  withered: cssVar('color-stage-withered'),
};

/** 階段的中文標籤與一句語調文案（清楚但不苛責）。 */
export const stageMeta: Record<
  GrowthStage,
  { label: string; caption: string; badgeClass: string }
> = {
  seed: { label: '種子', caption: '播下了，等待第一次澆水', badgeClass: 'badge--seed' },
  sprout: { label: '發芽', caption: '冒出頭了，繼續保持', badgeClass: 'badge--sprout' },
  growing: { label: '成長', caption: '穩穩往上長', badgeClass: 'badge--growing' },
  blooming: { label: '盛開', caption: '茂盛盛開，狀態極佳', badgeClass: 'badge--blooming' },
  withered: { label: '枯萎', caption: '有點乾了，今天澆個水就好', badgeClass: 'badge--withered' },
};

/** 植物種類的中文名 + 學名（標本標籤用；學名走 display italic）。 */
export const plantMeta: Record<PlantType, { label: string; latin: string }> = {
  sunflower: { label: '向日葵', latin: 'Helianthus' },
  cactus: { label: '仙人掌', latin: 'Cactaceae' },
  bonsai: { label: '小松盆栽', latin: 'Pinus bonsai' },
  lavender: { label: '薰衣草', latin: 'Lavandula' },
  fern: { label: '蕨', latin: 'Polypodiopsida' },
};
