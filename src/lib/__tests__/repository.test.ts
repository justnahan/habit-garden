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

  it('拒絕非 YYYY-MM-DD 的髒日期鍵', () => {
    const h = repo.createHabit({ name: '喝水', plant: 'fern', reminder: daily });
    expect(() => repo.setCheckIn(h.id, '2026/07/03', true)).toThrow();
    expect(() => repo.setCheckIn(h.id, '2026-13-40', true)).toThrow();
    expect(() => repo.setCheckIn(h.id, 'today', true)).toThrow();
  });
});

describe('reminder 驗證', () => {
  it('拒絕 weekly.days 為空陣列', () => {
    expect(() =>
      repo.createHabit({ name: '運動', plant: 'cactus', reminder: { kind: 'weekly', days: [] } }),
    ).toThrow();
  });

  it('拒絕 weekly.days 重複', () => {
    expect(() =>
      repo.createHabit({
        name: '運動',
        plant: 'cactus',
        reminder: { kind: 'weekly', days: [1, 1, 3] },
      }),
    ).toThrow();
  });

  it('updateHabit 改成非法 weekly 也會被擋', () => {
    const h = repo.createHabit({ name: '運動', plant: 'cactus', reminder: daily });
    expect(() => repo.updateHabit(h.id, { reminder: { kind: 'weekly', days: [] } })).toThrow();
    // 原本的 reminder 不應被改動
    expect(repo.getHabit(h.id)?.reminder).toEqual(daily);
  });

  it('接受合法的 weekly', () => {
    const h = repo.createHabit({
      name: '運動',
      plant: 'cactus',
      reminder: { kind: 'weekly', days: [1, 3, 5] },
    });
    expect(h.reminder).toEqual({ kind: 'weekly', days: [1, 3, 5] });
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

describe('變更訂閱（React 重繪來源）', () => {
  it('打卡 / 新增 / 刪除都會通知訂閱者並遞增 revision', () => {
    let notified = 0;
    const base = repo.getRevision();
    const unsubscribe = repo.subscribe(() => {
      notified += 1;
    });

    const h = repo.createHabit({ name: '喝水', plant: 'fern', reminder: daily });
    repo.toggleCheckIn(h.id, '2026-07-03'); // 打卡完成
    repo.toggleCheckIn(h.id, '2026-07-03'); // 取消，仍是一次寫入
    repo.deleteHabit(h.id);

    expect(notified).toBe(4);
    expect(repo.getRevision()).toBe(base + 4);
    unsubscribe();
  });

  it('reset 也會通知（清空後畫面要回到空狀態）', () => {
    let notified = 0;
    repo.subscribe(() => {
      notified += 1;
    });
    repo.reset();
    expect(notified).toBe(1);
  });

  it('解除訂閱後不再收到通知', () => {
    let notified = 0;
    const unsubscribe = repo.subscribe(() => {
      notified += 1;
    });
    unsubscribe();
    repo.createHabit({ name: '運動', plant: 'cactus', reminder: daily });
    expect(notified).toBe(0);
  });

  it('未寫入時 revision 保持穩定（避免無限重繪）', () => {
    const before = repo.getRevision();
    repo.listHabits();
    repo.getRevision();
    expect(repo.getRevision()).toBe(before);
  });
});
