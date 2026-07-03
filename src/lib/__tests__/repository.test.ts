import { beforeEach, describe, expect, it } from 'vitest';
import { HabitRepository } from '../repository';
import { createMemoryStore, loadState, type KeyValueStore } from '../storage';
import type { ReminderFrequency } from '../../types';

const daily: ReminderFrequency = { kind: 'daily' };

let store: KeyValueStore;
let repo: HabitRepository;

beforeEach(() => {
  store = createMemoryStore();
  repo = new HabitRepository({ store, now: () => new Date('2026-07-03T08:00:00Z') });
});

describe('Habit CRUD', () => {
  it('建立 / 讀取 / 更新 / 刪除', () => {
    const h = repo.createHabit({ name: '喝水', plant: 'fern', reminder: daily });
    expect(h.id).toBeTruthy();
    expect(repo.getHabit(h.id)?.name).toBe('喝水');

    repo.updateHabit(h.id, { name: '喝八杯水', plant: 'sunflower' });
    expect(repo.getHabit(h.id)?.name).toBe('喝八杯水');
    expect(repo.getHabit(h.id)?.plant).toBe('sunflower');

    repo.deleteHabit(h.id);
    expect(repo.getHabit(h.id)).toBeUndefined();
    expect(repo.listHabits()).toHaveLength(0);
  });

  it('名稱空白時拒絕建立', () => {
    expect(() => repo.createHabit({ name: '  ', plant: 'fern', reminder: daily })).toThrow();
  });

  it('刪除習慣會一併移除其打卡紀錄', () => {
    const h = repo.createHabit({ name: '運動', plant: 'cactus', reminder: daily });
    repo.setCheckIn(h.id, '2026-07-01', true);
    expect(repo.listCheckIns(h.id)).toHaveLength(1);
    repo.deleteHabit(h.id);
    expect(repo.listCheckIns(h.id)).toHaveLength(0);
  });
});

describe('CheckIn', () => {
  it('toggle 預設操作今天，且可反覆切換', () => {
    const h = repo.createHabit({ name: '閱讀', plant: 'bonsai', reminder: daily });
    expect(repo.toggleCheckIn(h.id)).toBe(true); // 2026-07-03
    expect(repo.getCheckIn(h.id, '2026-07-03')?.completed).toBe(true);
    expect(repo.toggleCheckIn(h.id)).toBe(false);
    expect(repo.getCheckIn(h.id, '2026-07-03')?.completed).toBe(false);
  });

  it('同一天只保留一筆 checkin（覆寫而非新增）', () => {
    const h = repo.createHabit({ name: '冥想', plant: 'lavender', reminder: daily });
    repo.setCheckIn(h.id, '2026-07-03', true);
    repo.setCheckIn(h.id, '2026-07-03', false);
    expect(repo.listCheckIns(h.id)).toHaveLength(1);
  });

  it('對不存在的習慣打卡會丟錯', () => {
    expect(() => repo.setCheckIn('nope', '2026-07-03', true)).toThrow();
  });
});

describe('持久化', () => {
  it('寫入後重新載入資料不遺失（模擬重新整理頁面）', () => {
    const h = repo.createHabit({ name: '喝水', plant: 'fern', reminder: daily });
    repo.setCheckIn(h.id, '2026-07-02', true);

    // 用同一個 store 重建 repo = 重新整理頁面
    const reloaded = new HabitRepository({ store });
    expect(reloaded.listHabits()).toHaveLength(1);
    expect(reloaded.getHabit(h.id)?.name).toBe('喝水');
    expect(reloaded.getCheckIn(h.id, '2026-07-02')?.completed).toBe(true);
  });

  it('落地資料帶 schemaVersion', () => {
    repo.createHabit({ name: '喝水', plant: 'fern', reminder: daily });
    expect(loadState(store).schemaVersion).toBe(1);
  });

  it('reset 清空所有資料', () => {
    repo.createHabit({ name: '喝水', plant: 'fern', reminder: daily });
    repo.reset();
    expect(repo.listHabits()).toHaveLength(0);
    expect(loadState(store).habits).toHaveLength(0);
  });

  it('export 回傳深拷貝快照', () => {
    const h = repo.createHabit({ name: '喝水', plant: 'fern', reminder: daily });
    const snap = repo.export();
    snap.habits[0].name = '被竄改';
    expect(repo.getHabit(h.id)?.name).toBe('喝水'); // 內部狀態未被影響
  });
});
