import { describe, expect, it } from 'vitest';
import type { CheckIn, ReminderFrequency } from '../../types';
import { DEFAULT_GROWTH_CONFIG, evaluateHabit, stageFor } from '../growth';

const daily: ReminderFrequency = { kind: 'daily' };

function ci(date: string, completed = true): CheckIn {
  return { id: date, habitId: 'h', date, completed, updatedAt: date };
}

function range(from: string, days: number): CheckIn[] {
  const out: CheckIn[] = [];
  const [y, m, d] = from.split('-').map(Number);
  for (let i = 0; i < days; i++) {
    const dt = new Date(y, m - 1, d + i, 12);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    out.push(ci(key));
  }
  return out;
}

describe('stageFor', () => {
  it('依連續天數升級：seed → sprout → growing → blooming', () => {
    expect(stageFor(0, 0)).toBe('seed');
    expect(stageFor(1, 0)).toBe('sprout');
    expect(stageFor(2, 0)).toBe('sprout');
    expect(stageFor(3, 0)).toBe('growing');
    expect(stageFor(6, 0)).toBe('growing');
    expect(stageFor(7, 0)).toBe('blooming');
    expect(stageFor(30, 0)).toBe('blooming');
  });

  it('連續錯過達門檻 → 枯萎，且優先於正向階段', () => {
    expect(stageFor(0, 3)).toBe('withered');
    expect(stageFor(0, 5)).toBe('withered');
  });

  it('錯過未達門檻仍是 seed', () => {
    expect(stageFor(0, 2)).toBe('seed');
  });

  it('可自訂門檻設定', () => {
    const cfg = { witherAfter: 2, thresholds: { sprout: 1, growing: 2, blooming: 3 } };
    expect(stageFor(0, 2, cfg)).toBe('withered');
    expect(stageFor(3, 0, cfg)).toBe('blooming');
  });
});

describe('evaluateHabit', () => {
  it('綜合回傳 streak / longest / missed / stage / total', () => {
    const checkins = range('2026-07-01', 7); // 7 連到 7/7
    const status = evaluateHabit(checkins, daily, { today: '2026-07-07' });
    expect(status.currentStreak).toBe(7);
    expect(status.longestStreak).toBe(7);
    expect(status.missedStreak).toBe(0);
    expect(status.stage).toBe('blooming');
    expect(status.totalCompleted).toBe(7);
  });

  it('中斷後判定為枯萎但保留歷史最長', () => {
    // 一段 8 連（6/1–6/8）後長期中斷，today=7/03
    const checkins = range('2026-06-01', 8);
    const status = evaluateHabit(checkins, daily, { today: '2026-07-03' });
    expect(status.currentStreak).toBe(0);
    expect(status.longestStreak).toBe(8); // 歷史保留
    expect(status.missedStreak).toBeGreaterThanOrEqual(DEFAULT_GROWTH_CONFIG.witherAfter);
    expect(status.stage).toBe('withered');
    expect(status.totalCompleted).toBe(8);
  });

  it('長期中斷後今天重新打卡 → 立刻脫離枯萎（方案 A：一打卡即復活）', () => {
    // 一段舊紀錄後長期中斷，直到今天 7/3 才重新打卡。
    const checkins = [...range('2026-06-01', 3), ci('2026-07-03')];
    const status = evaluateHabit(checkins, daily, { today: '2026-07-03' });

    expect(status.currentStreak).toBe(1); // 今天這 1 天
    expect(status.missedStreak).toBeGreaterThanOrEqual(
      DEFAULT_GROWTH_CONFIG.witherAfter,
    ); // 過去確實累積了足以枯萎的錯過
    expect(status.stage).not.toBe('withered'); // 但今天已澆水 → 不再枯萎
    expect(status.stage).toBe('sprout'); // 回到起點重新長
  });

  it('中斷後重新開始：只重置當前連續天數，不刪歷史紀錄', () => {
    // 6/1–6/5 連 5 天，中斷數天，7/2、7/3 重新開始 2 天，today=7/3
    const checkins = [...range('2026-06-01', 5), ...range('2026-07-02', 2)];
    const status = evaluateHabit(checkins, daily, { today: '2026-07-03' });

    // 當前連續只從重啟後算起
    expect(status.currentStreak).toBe(2);
    // 歷史最長仍保留 5，證明歷史沒被清掉
    expect(status.longestStreak).toBe(5);
    // 全部完成次數 = 5 + 2，歷史紀錄完整保留
    expect(status.totalCompleted).toBe(7);
    // 已重新開始，不再是枯萎
    expect(status.stage).toBe('sprout');
  });
});
