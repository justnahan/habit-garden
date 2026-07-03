/**
 * 新增 / 編輯習慣表單的純邏輯層。
 *
 * 把「表單狀態 → 驗證 → 轉成 repository 可吃的 payload」抽成不依賴 React 的
 * 純函式，讓核心規則（名稱必填、weekly 至少選一天）能被單元測試涵蓋，
 * 元件層只負責畫面與互動。驗證規則刻意對齊 repository 的寫入驗證，
 * 讓 UI 能在送出前先擋、且與底層保持一致。
 */

import type { Habit, PlantType, ReminderFrequency, Weekday } from '../types';

export type ReminderKind = ReminderFrequency['kind'];

export interface HabitFormValues {
  name: string;
  plant: PlantType;
  kind: ReminderKind;
  /** 僅 weekly 時有意義；儲存為未排序集合，送出時再排序去重。 */
  days: Weekday[];
}

export interface HabitFormErrors {
  name?: string;
  days?: string;
}

/** 星期短標籤（0 = 週日 … 6 = 週六，對齊 `Date.getDay()`）。 */
export const WEEKDAY_LABELS: readonly string[] = ['日', '一', '二', '三', '四', '五', '六'];

export const WEEKDAYS: readonly Weekday[] = [0, 1, 2, 3, 4, 5, 6];

/** 新增模式的預設值：向日葵、每天提醒。 */
export const DEFAULT_FORM_VALUES: HabitFormValues = {
  name: '',
  plant: 'sunflower',
  kind: 'daily',
  days: [1, 2, 3, 4, 5],
};

/** 由既有 habit 反推表單初值（編輯模式）。 */
export function fromHabit(habit: Habit): HabitFormValues {
  return {
    name: habit.name,
    plant: habit.plant,
    kind: habit.reminder.kind,
    days:
      habit.reminder.kind === 'weekly'
        ? [...habit.reminder.days].sort((a, b) => a - b)
        : [...DEFAULT_FORM_VALUES.days],
  };
}

/**
 * 驗證表單。回傳的物件只有「有錯的欄位」才有 key，
 * 搭配 `hasErrors` 判斷是否可送出。
 */
export function validateHabitForm(values: HabitFormValues): HabitFormErrors {
  const errors: HabitFormErrors = {};
  if (!values.name.trim()) errors.name = '幫這個習慣取個名字吧';
  if (values.kind === 'weekly' && values.days.length === 0) {
    errors.days = '每週提醒至少要選一天';
  }
  return errors;
}

export function hasErrors(errors: HabitFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** 把表單狀態轉成 repository 可吃的提醒頻率（weekly 排序去重）。 */
export function toReminder(values: HabitFormValues): ReminderFrequency {
  if (values.kind === 'daily') return { kind: 'daily' };
  const days = Array.from(new Set(values.days)).sort((a, b) => a - b);
  return { kind: 'weekly', days };
}

/** 切換 weekly 的某一天（有則移除、無則加入）。 */
export function toggleDay(days: Weekday[], day: Weekday): Weekday[] {
  return days.includes(day) ? days.filter((d) => d !== day) : [...days, day];
}

export interface HabitPayload {
  name: string;
  plant: PlantType;
  reminder: ReminderFrequency;
}

/** 表單狀態 → 建立 / 更新 payload（name 已 trim）。 */
export function toPayload(values: HabitFormValues): HabitPayload {
  return {
    name: values.name.trim(),
    plant: values.plant,
    reminder: toReminder(values),
  };
}
