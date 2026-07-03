/**
 * 生長階段判定。
 *
 * 4 個正向階段依「目前連續天數」升級：
 *   種子 seed(0) → 發芽 sprout(1–2) → 成長 growing(3–6) → 盛開 blooming(7+)
 * 第 5 種狀態枯萎 withered：連續錯過期望日達 `witherAfter` 天時觸發，
 * 優先於正向階段（枯萎時 currentStreak 必為 0）。
 *
 * 枯萎只影響「當前視覺狀態」，不會刪除任何歷史 checkin —— 重新打卡後
 * currentStreak 從 0 重新累積，longestStreak 與歷史紀錄保留。
 */

import type {
  CheckIn,
  GrowthStage,
  HabitStatus,
  ReminderFrequency,
} from '../types';
import {
  completedDateSet,
  currentMissedStreak,
  currentStreak,
  longestStreak,
  type StreakOptions,
} from './streak';

export interface GrowthConfig {
  /** 連續錯過幾個期望日後枯萎，預設 3。 */
  witherAfter: number;
  /** 各正向階段的下限門檻（連續天數）。 */
  thresholds: {
    sprout: number; // 進入發芽的最小 streak
    growing: number; // 進入成長的最小 streak
    blooming: number; // 進入盛開的最小 streak
  };
}

export const DEFAULT_GROWTH_CONFIG: GrowthConfig = {
  witherAfter: 3,
  thresholds: { sprout: 1, growing: 3, blooming: 7 },
};

/** 依連續天數 / 錯過天數判定生長階段。 */
export function stageFor(
  streak: number,
  missedStreak: number,
  config: GrowthConfig = DEFAULT_GROWTH_CONFIG,
): GrowthStage {
  if (missedStreak >= config.witherAfter) return 'withered';

  const { sprout, growing, blooming } = config.thresholds;
  if (streak >= blooming) return 'blooming';
  if (streak >= growing) return 'growing';
  if (streak >= sprout) return 'sprout';
  return 'seed';
}

/**
 * 一次算出習慣的完整即時狀態。這是 UI 層唯一需要呼叫的領域入口。
 */
export function evaluateHabit(
  checkins: CheckIn[],
  freq: ReminderFrequency,
  options: StreakOptions = {},
  config: GrowthConfig = DEFAULT_GROWTH_CONFIG,
): HabitStatus {
  const streak = currentStreak(checkins, freq, options);
  const missed = currentMissedStreak(checkins, freq, options);
  const longest = longestStreak(checkins, freq);
  const totalCompleted = completedDateSet(checkins).size;

  return {
    currentStreak: streak,
    longestStreak: Math.max(longest, streak),
    missedStreak: missed,
    stage: stageFor(streak, missed, config),
    totalCompleted,
  };
}
