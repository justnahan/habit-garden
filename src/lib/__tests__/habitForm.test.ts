import { describe, expect, it } from 'vitest';
import type { Habit } from '../../types';
import {
  DEFAULT_FORM_VALUES,
  fromHabit,
  hasErrors,
  toPayload,
  toReminder,
  toggleDay,
  validateHabitForm,
  type HabitFormValues,
} from '../habitForm';

const base: HabitFormValues = { ...DEFAULT_FORM_VALUES, name: '喝水' };

function makeHabit(reminder: Habit['reminder']): Habit {
  return {
    id: 'h1',
    name: '運動',
    plant: 'cactus',
    reminder,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
  };
}

describe('validateHabitForm', () => {
  it('名稱空白（含純空格）時報錯', () => {
    expect(hasErrors(validateHabitForm({ ...base, name: '' }))).toBe(true);
    expect(hasErrors(validateHabitForm({ ...base, name: '   ' }))).toBe(true);
    expect(validateHabitForm({ ...base, name: '   ' }).name).toBeTruthy();
  });

  it('合法的每天習慣無錯', () => {
    expect(hasErrors(validateHabitForm(base))).toBe(false);
  });

  it('weekly 沒選任何一天時報錯', () => {
    const v: HabitFormValues = { ...base, kind: 'weekly', days: [] };
    expect(validateHabitForm(v).days).toBeTruthy();
    expect(hasErrors(validateHabitForm(v))).toBe(true);
  });

  it('weekly 有選天數時無錯', () => {
    const v: HabitFormValues = { ...base, kind: 'weekly', days: [1, 3] };
    expect(hasErrors(validateHabitForm(v))).toBe(false);
  });
});

describe('toReminder / toPayload', () => {
  it('daily 轉成 { kind: daily }', () => {
    expect(toReminder({ ...base, kind: 'daily' })).toEqual({ kind: 'daily' });
  });

  it('weekly 會排序並去重星期', () => {
    const v: HabitFormValues = { ...base, kind: 'weekly', days: [5, 1, 1, 3] };
    expect(toReminder(v)).toEqual({ kind: 'weekly', days: [1, 3, 5] });
  });

  it('toPayload 會 trim 名稱', () => {
    expect(toPayload({ ...base, name: '  跑步  ' }).name).toBe('跑步');
  });
});

describe('toggleDay', () => {
  it('未選則加入、已選則移除', () => {
    expect(toggleDay([1, 3], 5)).toEqual([1, 3, 5]);
    expect(toggleDay([1, 3, 5], 3)).toEqual([1, 5]);
  });
});

describe('fromHabit', () => {
  it('daily 習慣帶回 daily 並保留預設天數供切換', () => {
    const v = fromHabit(makeHabit({ kind: 'daily' }));
    expect(v.kind).toBe('daily');
    expect(v.name).toBe('運動');
    expect(v.plant).toBe('cactus');
    expect(v.days.length).toBeGreaterThan(0);
  });

  it('weekly 習慣帶回排序後的天數', () => {
    const v = fromHabit(makeHabit({ kind: 'weekly', days: [6, 2, 4] }));
    expect(v.kind).toBe('weekly');
    expect(v.days).toEqual([2, 4, 6]);
  });
});
