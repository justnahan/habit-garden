/**
 * 核心資料模型。
 *
 * 這些型別是整個 App 的資料契約，同時對應 `docs/schema/*.schema.json`。
 * 欄位設計刻意保持「可平移到真實資料庫」：使用字串 id、ISO 時間、
 * 以及與時區無關的本地日期字串（YYYY-MM-DD）。
 */

/** 可選的植物種類（MVP 先給 5 種）。 */
export type PlantType =
  | 'sunflower'
  | 'cactus'
  | 'bonsai'
  | 'lavender'
  | 'fern';

export const PLANT_TYPES: readonly PlantType[] = [
  'sunflower',
  'cactus',
  'bonsai',
  'lavender',
  'fern',
];

/** 星期：0 = 週日 … 6 = 週六（與 JS `Date.getDay()` 對齊）。 */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * 提醒 / 期望頻率。
 * - `daily`：每天都是「期望完成日」。
 * - `weekly`：只有 `days` 內的星期才是「期望完成日」。
 *
 * 用 tagged union 是為了讓 streak / 生長邏輯能明確判斷某天是否該被計算。
 */
export type ReminderFrequency =
  | { kind: 'daily' }
  | { kind: 'weekly'; days: Weekday[] };

/** 生長階段：4 個正向階段 + 枯萎狀態。 */
export type GrowthStage =
  | 'seed' // 種子
  | 'sprout' // 發芽
  | 'growing' // 成長
  | 'blooming' // 盛開 / 茂盛
  | 'withered'; // 枯萎

export const GROWTH_STAGES: readonly GrowthStage[] = [
  'seed',
  'sprout',
  'growing',
  'blooming',
  'withered',
];

/** 習慣本體。 */
export interface Habit {
  id: string;
  name: string;
  plant: PlantType;
  reminder: ReminderFrequency;
  /** 建立時間，ISO 8601 字串。 */
  createdAt: string;
  /** 最後更新時間，ISO 8601 字串。 */
  updatedAt: string;
}

/** 單次打卡紀錄。同一個 habit 同一天最多一筆。 */
export interface CheckIn {
  id: string;
  habitId: string;
  /** 本地日期字串 YYYY-MM-DD（不含時區）。 */
  date: string;
  /** 該天是否完成。允許保留 false 紀錄以表達「明確取消」。 */
  completed: boolean;
  /** 建立 / 最後修改時間，ISO 8601 字串。 */
  updatedAt: string;
}

/** 由領域邏輯計算出的習慣即時狀態（不落地，衍生自 checkins）。 */
export interface HabitStatus {
  /** 目前連續完成天數（只計算期望日）。 */
  currentStreak: number;
  /** 歷史最長連續天數。 */
  longestStreak: number;
  /** 目前連續錯過的期望日天數（今天尚未到期不算錯過）。 */
  missedStreak: number;
  /** 生長階段。 */
  stage: GrowthStage;
  /** 累計完成的打卡次數。 */
  totalCompleted: number;
}
