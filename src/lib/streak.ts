/**
 * 連續天數（streak）計算。
 *
 * 定義（只計算「期望完成日」= 依 reminder 頻率該做的日子）：
 * - 每天型：每一天都是期望日。
 * - 每週型：只有選定星期是期望日；沒選的日子不影響 streak。
 *
 * 目前連續天數 currentStreak：從今天往回走，遇到期望日就檢查是否完成。
 *   - 完成 → 累計 +1，繼續往回。
 *   - 未完成且該日就是「今天」→ 視為「尚未到期」，不中斷、也不計入。
 *   - 未完成且該日在過去 → 中斷，停止。
 *
 * 這個定義確保：使用者今天還沒打卡，不會讓昨天累積的連續天數瞬間歸零。
 */

import type { CheckIn, ReminderFrequency } from '../types';
import { addDays, diffDays, todayKey, weekdayOf } from './date';

/** 回溯上限，避免資料異常時無限迴圈（約 5 年）。 */
const MAX_LOOKBACK_DAYS = 1830;

export interface StreakOptions {
  /** 以哪一天為「今天」，預設系統當日。傳入方便測試。 */
  today?: string;
  /** 回溯下限（通常是 habit.createdAt 的日期鍵），避免掃到建立前。 */
  since?: string;
}

/** 某個日期鍵是否為該頻率下的期望完成日。 */
export function isExpectedDay(dateKey: string, freq: ReminderFrequency): boolean {
  if (freq.kind === 'daily') return true;
  return freq.days.includes(weekdayOf(dateKey));
}

/** 從一組 checkins 取出「已完成」日期鍵集合。 */
export function completedDateSet(checkins: CheckIn[]): Set<string> {
  const set = new Set<string>();
  for (const c of checkins) {
    if (c.completed) set.add(c.date);
  }
  return set;
}

/** 目前連續完成天數。 */
export function currentStreak(
  checkins: CheckIn[],
  freq: ReminderFrequency,
  options: StreakOptions = {},
): number {
  const today = options.today ?? todayKey();
  const completed = completedDateSet(checkins);
  const lowerBound = options.since;

  let streak = 0;
  let cursor = today;

  for (let i = 0; i < MAX_LOOKBACK_DAYS; i++) {
    if (lowerBound && diffDays(cursor, lowerBound) < 0) break;

    if (isExpectedDay(cursor, freq)) {
      if (completed.has(cursor)) {
        streak += 1;
      } else if (cursor === today) {
        // 今天還沒打卡：尚未到期，跳過不中斷。
      } else {
        break; // 過去的期望日沒完成 → 中斷。
      }
    }
    cursor = addDays(cursor, -1);
  }

  return streak;
}

/**
 * 目前連續錯過的期望日天數。
 * 只看「已到期」的日子（今天不算），從最近一個過去的期望日往回數未完成的長度。
 * 用來判定枯萎。
 */
export function currentMissedStreak(
  checkins: CheckIn[],
  freq: ReminderFrequency,
  options: StreakOptions = {},
): number {
  const today = options.today ?? todayKey();
  const completed = completedDateSet(checkins);
  const lowerBound = options.since;

  let missed = 0;
  let cursor = addDays(today, -1); // 今天尚未到期，從昨天開始看。

  for (let i = 0; i < MAX_LOOKBACK_DAYS; i++) {
    if (lowerBound && diffDays(cursor, lowerBound) < 0) break;

    if (isExpectedDay(cursor, freq)) {
      if (completed.has(cursor)) break; // 遇到已完成的期望日就停。
      missed += 1;
    }
    cursor = addDays(cursor, -1);
  }

  return missed;
}

/**
 * 歷史最長連續天數。只計「期望日」的完成紀錄，與 `currentStreak` 語意一致：
 * 非期望日的打卡（例如 weekly 只選週一卻多打了週二）不計入，避免歷史最長虛高。
 * 兩個相鄰完成日之間若「中間都不是期望日」仍視為連續。
 */
export function longestStreak(
  checkins: CheckIn[],
  freq: ReminderFrequency,
): number {
  const completed = completedDateSet(checkins);
  if (completed.size === 0) return 0;

  // 先過濾出期望日的完成紀錄，再排序（YYYY-MM-DD 字串排序即時間排序）。
  const days = [...completed]
    .filter((d) => isExpectedDay(d, freq))
    .sort();
  if (days.length === 0) return 0;
  let best = 0;
  let run = 0;
  let prev: string | null = null;

  for (const day of days) {
    if (prev === null) {
      run = 1;
    } else if (isContiguousExpected(prev, day, freq)) {
      run += 1;
    } else {
      run = 1;
    }
    best = Math.max(best, run);
    prev = day;
  }

  return best;
}

/**
 * prev 與 next 之間，是否「沒有任何未完成的期望日」（即中間的期望日都不存在）。
 * next 一定晚於 prev；只需檢查 (prev, next) 開區間內是否有期望日。
 */
function isContiguousExpected(
  prev: string,
  next: string,
  freq: ReminderFrequency,
): boolean {
  let cursor = addDays(prev, 1);
  while (cursor < next) {
    if (isExpectedDay(cursor, freq)) return false;
    cursor = addDays(cursor, 1);
  }
  return true;
}
