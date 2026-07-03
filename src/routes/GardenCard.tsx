/**
 * 花園總覽的單張植物卡。
 *
 * 一張卡 = 一個習慣：植物插畫（依當前生長階段渲染）＋ 標本編號 / 名稱 / 學名 ＋
 * 生長階段徽章 ＋ streak ＋ 今日打卡按鈕。
 *
 * 打卡完成的「完成感」回饋同時用三種手段，且都是不吃指標事件的裝飾層，
 * 不會擋住連續快速打卡：
 *   ① 植物容器輕跳（各階段都有回饋，含 seed/sprout）
 *   ② 澆水水珠迸發
 *   ③ 卡片邊界點亮（色彩變化）
 * 以 `waterNonce` 當 remount key，讓動畫在每次「打卡完成」重新播放；取消完成不觸發。
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Habit, HabitStatus } from '../types';
import { Plant } from '../design/plants/Plant';
import { Button, Card, StageBadge } from '../design/components';
import { IconCheck, IconDroplet, IconPencil } from '../design/icons';
import { plantMeta } from '../design/tokens';

interface GardenCardProps {
  /** 圖鑑編號（1-based），供標本標籤顯示 No.。 */
  index: number;
  habit: Habit;
  status: HabitStatus;
  /** 今天是否已完成打卡。 */
  doneToday: boolean;
  /** 切換今日打卡；回傳切換後是否為「已完成」，供觸發完成回饋。 */
  onToggle: () => boolean;
}

export function GardenCard({ index, habit, status, doneToday, onToggle }: GardenCardProps) {
  const [waterNonce, setWaterNonce] = useState(0);
  const pm = plantMeta[habit.plant];
  const withered = status.stage === 'withered';

  const handleToggle = () => {
    const nowDone = onToggle();
    // 只有「打卡完成」才播放澆水成長回饋；取消完成不播。
    if (nowDone) setWaterNonce((n) => n + 1);
  };

  return (
    <Card
      as="li"
      className={`garden-card${doneToday ? ' is-done' : ''}${withered ? ' is-withered' : ''}`}
    >
      <Link
        className="garden-card__edit btn btn--ghost btn--icon btn--sm"
        to={`/habits/${habit.id}/edit`}
        aria-label={`編輯「${habit.name}」`}
        title="編輯習慣"
      >
        <IconPencil size={16} />
      </Link>

      <div className="garden-card__stage">
        {/* key=waterNonce：每次澆水 remount，讓「輕跳」動畫重新播放 */}
        <span
          key={waterNonce}
          className={`garden-card__plant${waterNonce > 0 ? ' is-watering' : ''}`}
        >
          <Plant type={habit.plant} stage={status.stage} size={120} decorative />
        </span>
        {waterNonce > 0 && (
          <div key={`burst-${waterNonce}`} className="garden-card__burst" aria-hidden>
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        )}
      </div>

      <div className="garden-card__body">
        <span className="u-eyebrow">
          No.{String(index).padStart(2, '0')} · {pm.label}
        </span>
        <Link className="garden-card__name" to={`/habits/${habit.id}`}>
          {habit.name}
        </Link>

        <div className="garden-card__meta">
          <StageBadge stage={status.stage} />
          <span className={`garden-card__streak${status.currentStreak > 0 ? ' is-lit' : ''}`}>
            <IconDroplet size={16} />
            <span className="u-numeric">{status.currentStreak}</span> 天
          </span>
        </div>

        <Button
          variant={doneToday ? 'accent' : 'default'}
          className="btn--checkin"
          onClick={handleToggle}
          aria-pressed={doneToday}
          aria-label={
            doneToday ? `取消今天的「${habit.name}」打卡` : `完成今天的「${habit.name}」打卡`
          }
        >
          {doneToday ? (
            <>
              <IconCheck size={18} /> 今天已完成
            </>
          ) : (
            <>
              <IconDroplet size={18} /> 今天打卡
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
