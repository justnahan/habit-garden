/**
 * 對外的乾淨 CRUD API。
 *
 * Repository 把「localStorage 儲存格式」與「UI 操作」隔開：UI 只呼叫語意化方法
 * （新增習慣、切換打卡…），不直接碰 storage 的 shape。所有寫入都會即時落地。
 *
 * 為了可測試，建構子可注入 store 與 clock（時間來源）。
 */

import type {
  CheckIn,
  Habit,
  PlantType,
  ReminderFrequency,
} from '../types';
import { newId } from './id';
import { todayKey } from './date';
import {
  clearState,
  emptyState,
  loadState,
  saveState,
  type KeyValueStore,
  type PersistedState,
} from './storage';

export interface CreateHabitInput {
  name: string;
  plant: PlantType;
  reminder: ReminderFrequency;
}

export type UpdateHabitInput = Partial<CreateHabitInput>;

export interface RepositoryOptions {
  store?: KeyValueStore | null;
  /** 時間來源，預設 `() => new Date()`，測試可注入固定時鐘。 */
  now?: () => Date;
}

export class HabitRepository {
  private state: PersistedState;
  private readonly store: KeyValueStore | null | undefined;
  private readonly now: () => Date;

  constructor(options: RepositoryOptions = {}) {
    this.store = options.store;
    this.now = options.now ?? (() => new Date());
    this.state =
      options.store === undefined ? loadState() : loadState(options.store);
  }

  private persist(): void {
    if (this.store === undefined) saveState(this.state);
    else saveState(this.state, this.store);
  }

  private iso(): string {
    return this.now().toISOString();
  }

  // ---- Habit CRUD --------------------------------------------------------

  listHabits(): Habit[] {
    return [...this.state.habits];
  }

  getHabit(id: string): Habit | undefined {
    return this.state.habits.find((h) => h.id === id);
  }

  createHabit(input: CreateHabitInput): Habit {
    const name = input.name.trim();
    if (!name) throw new Error('習慣名稱不可為空');

    const ts = this.iso();
    const habit: Habit = {
      id: newId(),
      name,
      plant: input.plant,
      reminder: input.reminder,
      createdAt: ts,
      updatedAt: ts,
    };
    this.state.habits.push(habit);
    this.persist();
    return habit;
  }

  updateHabit(id: string, patch: UpdateHabitInput): Habit {
    const habit = this.getHabit(id);
    if (!habit) throw new Error(`找不到習慣：${id}`);

    if (patch.name !== undefined) {
      const name = patch.name.trim();
      if (!name) throw new Error('習慣名稱不可為空');
      habit.name = name;
    }
    if (patch.plant !== undefined) habit.plant = patch.plant;
    if (patch.reminder !== undefined) habit.reminder = patch.reminder;
    habit.updatedAt = this.iso();

    this.persist();
    return habit;
  }

  /** 刪除習慣，連同其打卡紀錄一併清除。 */
  deleteHabit(id: string): void {
    this.state.habits = this.state.habits.filter((h) => h.id !== id);
    this.state.checkins = this.state.checkins.filter((c) => c.habitId !== id);
    this.persist();
  }

  // ---- CheckIn CRUD ------------------------------------------------------

  listCheckIns(habitId: string): CheckIn[] {
    return this.state.checkins.filter((c) => c.habitId === habitId);
  }

  getCheckIn(habitId: string, date: string): CheckIn | undefined {
    return this.state.checkins.find(
      (c) => c.habitId === habitId && c.date === date,
    );
  }

  /**
   * 設定某天的完成狀態（新增或覆寫）。回傳該筆 checkin。
   */
  setCheckIn(habitId: string, date: string, completed: boolean): CheckIn {
    if (!this.getHabit(habitId)) throw new Error(`找不到習慣：${habitId}`);

    const existing = this.getCheckIn(habitId, date);
    if (existing) {
      existing.completed = completed;
      existing.updatedAt = this.iso();
      this.persist();
      return existing;
    }

    const checkin: CheckIn = {
      id: newId(),
      habitId,
      date,
      completed,
      updatedAt: this.iso(),
    };
    this.state.checkins.push(checkin);
    this.persist();
    return checkin;
  }

  /**
   * 切換某天的完成狀態；預設為今天。回傳切換後是否為完成。
   */
  toggleCheckIn(habitId: string, date: string = todayKey(this.now())): boolean {
    const existing = this.getCheckIn(habitId, date);
    const next = existing ? !existing.completed : true;
    this.setCheckIn(habitId, date, next);
    return next;
  }

  // ---- 匯出 / 重置 -------------------------------------------------------

  /** 匯出整體狀態（設定頁 JSON 匯出用）。 */
  export(): PersistedState {
    return structuredCloneSafe(this.state);
  }

  /** 清空所有資料。 */
  reset(): void {
    this.state = emptyState();
    if (this.store === undefined) clearState();
    else clearState(this.store);
  }
}

/** structuredClone 的安全版本（不可用時退回 JSON round-trip）。 */
function structuredCloneSafe<T>(value: T): T {
  try {
    if (typeof structuredClone === 'function') return structuredClone(value);
  } catch {
    // fall through
  }
  return JSON.parse(JSON.stringify(value)) as T;
}
