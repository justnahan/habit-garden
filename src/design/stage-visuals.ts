/**
 * 生長階段 → house 圖示的映射（非顏色的區辨方式之一）。
 * 抽出獨立檔，讓 icons.tsx 維持「只 export 元件」（react-refresh 友善）。
 */
import type { GrowthStage } from '../types';
import { IconSeed, IconSprout, IconLeaf, IconFlower, IconWilt } from './icons';

export const stageIcon: Record<GrowthStage, typeof IconLeaf> = {
  seed: IconSeed,
  sprout: IconSprout,
  growing: IconLeaf,
  blooming: IconFlower,
  withered: IconWilt,
};
