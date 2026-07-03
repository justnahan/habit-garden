import { describe, expect, it } from 'vitest';
import type { CheckIn, ReminderFrequency } from '../../types';
import {
  currentMissedStreak,
  currentStreak,
  isExpectedDay,
  longestStreak,
} from '../streak';

const daily: ReminderFrequency = { kind: 'daily' };

/** 建一筆 checkin 的小工具。 */
function ci(date: string, completed = true): CheckIn {
  return { id: date, habitId: 'h', date, completed, updatedAt: date };
}

/** 產生 [from..to] 連續日期的已完成 checkins。 */
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

describe('isExpectedDay', () => {
  it('daily 每天都是期望日', () => {
    expect(isExpectedDay('2026-07-01', daily)).toBe(true);
  });

  it('weekly 只有選定星期才是期望日', () => {
    // 2026-07-01 是週三(3)，2026-07-02 週四(4)
    const midweek: ReminderFrequency = { kind: 'weekly', days: [3] };
    expect(isExpectedDay('2026-07-01', midweek)).toBe(true);
    expect(isExpectedDay('2026-07-02', midweek)).toBe(false);
  });
});

describe('currentStreak — daily', () => {
  it('沒有任何打卡時為 0', () => {
    expect(currentStreak([], daily, { today: '2026-07-03' })).toBe(0);
  });

  it('今天打卡且連續三天 → 3', () => {
    const checkins = range('2026-07-01', 3); // 1,2,3
    expect(currentStreak(checkins, daily, { today: '2026-07-03' })).toBe(3);
  });

  it('今天還沒打卡，但昨天往前連續三天 → 維持 3（不歸零）', () => {
    const checkins = range('2026-06-30', 3); // 6/30,7/1,7/2
    expect(currentStreak(checkins, daily, { today: '2026-07-03' })).toBe(3);
  });

  it('過去某天漏打卡會中斷 streak', () => {
    // 完成 7/1、7/3，缺 7/2；today=7/3 → 只算到今天回推到 7/2 中斷 = 1
    const checkins = [ci('2026-07-01'), ci('2026-07-03')];
    expect(currentStreak(checkins, daily, { today: '2026-07-03' })).toBe(1);
  });

  it('completed=false 的紀錄不算完成', () => {
    const checkins = [ci('2026-07-03', false)];
    expect(currentStreak(checkins, daily, { today: '2026-07-03' })).toBe(0);
  });
});

describe('currentStreak — weekly', () => {
  it('只計期望日，非期望日不中斷', () => {
    // 每週一三五：2026-07 月 週三=1,8,15…；週五=3,10…；週一=6,13…
    const freq: ReminderFrequency = { kind: 'weekly', days: [1, 3, 5] };
    // 完成 7/1(三)、7/3(五)、7/6(一)，today=7/6
    const checkins = [ci('2026-07-01'), ci('2026-07-03'), ci('2026-07-06')];
    expect(currentStreak(checkins, freq, { today: '2026-07-06' })).toBe(3);
  });

  it('缺一個期望日會中斷', () => {
    const freq: ReminderFrequency = { kind: 'weekly', days: [1, 3, 5] };
    // 缺 7/3(五)，完成 7/1、7/6，today=7/6 → 從 7/6 往回，7/5 非期望，7/3 期望但未完成 → 中斷 = 1
    const checkins = [ci('2026-07-01'), ci('2026-07-06')];
    expect(currentStreak(checkins, freq, { today: '2026-07-06' })).toBe(1);
  });
});

describe('currentMissedStreak', () => {
  it('連續錯過的期望日天數（不含今天）', () => {
    // 最後完成 6/29，today=7/3 → 錯過 6/30,7/1,7/2 = 3
    const checkins = [ci('2026-06-29')];
    expect(currentMissedStreak(checkins, daily, { today: '2026-07-03' })).toBe(3);
  });

  it('昨天完成 → 錯過 0', () => {
    const checkins = [ci('2026-07-02')];
    expect(currentMissedStreak(checkins, daily, { today: '2026-07-03' })).toBe(0);
  });
});

describe('longestStreak', () => {
  it('回傳歷史最長區段而非目前區段', () => {
    // 一段 5 連（6/1–6/5），中斷後一段 2 連（6/10–6/11）
    const checkins = [...range('2026-06-01', 5), ...range('2026-06-10', 2)];
    expect(longestStreak(checkins, daily)).toBe(5);
  });
});
