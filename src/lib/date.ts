/**
 * 與時區無關的日期工具。
 *
 * 全 App 以「本地日期字串」YYYY-MM-DD 作為一天的唯一鍵，避免把 UTC 時間戳
 * 直接拿來比較造成的跨時區 / 跨日錯誤。所有換算都在本地時區的「當天中午」
 * 進行，藉此避開 DST 邊界問題。
 */

import type { Weekday } from '../types';

/** 將 Date 轉成本地日期鍵 YYYY-MM-DD。 */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 今天的日期鍵。 */
export function todayKey(now: Date = new Date()): string {
  return toDateKey(now);
}

/**
 * 把日期鍵解析成本地時區「當天中午」的 Date。
 * 用中午而非午夜可避免 DST 讓某天少一小時而跨日的問題。
 */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/** 在日期鍵上加減天數，回傳新的日期鍵。 */
export function addDays(key: string, days: number): string {
  const base = parseDateKey(key);
  base.setDate(base.getDate() + days);
  return toDateKey(base);
}

/** 日期鍵對應的星期（0 = 週日 … 6 = 週六）。 */
export function weekdayOf(key: string): Weekday {
  return parseDateKey(key).getDay() as Weekday;
}

/** a 與 b 之間相差的天數（a - b，可為負）。 */
export function diffDays(aKey: string, bKey: string): number {
  const a = parseDateKey(aKey).getTime();
  const b = parseDateKey(bKey).getTime();
  return Math.round((a - b) / 86_400_000);
}

/** 是否為合法的 YYYY-MM-DD 日期鍵。 */
export function isDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = parseDateKey(value);
  return toDateKey(parsed) === value;
}
