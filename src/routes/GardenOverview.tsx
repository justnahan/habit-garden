import { Link } from 'react-router-dom';
import { useRepository } from '../lib/useRepository';
import { evaluateHabit } from '../lib/growth';
import { EmptyState } from './EmptyState';

const STAGE_LABEL: Record<string, string> = {
  seed: '種子',
  sprout: '發芽',
  growing: '成長',
  blooming: '盛開',
  withered: '枯萎',
};

/**
 * 花園總覽（首頁）。骨架階段：列出習慣與其目前生長階段，證明資料 / 邏輯層可用。
 * 實際植物美術與版面留待後續 stage。
 */
export function GardenOverview() {
  const repo = useRepository();
  const habits = repo.listHabits();

  if (habits.length === 0) return <EmptyState />;

  return (
    <section>
      <h1>我的花園</h1>
      <ul className="habit-grid">
        {habits.map((h) => {
          const status = evaluateHabit(repo.listCheckIns(h.id), h.reminder);
          return (
            <li key={h.id} className="habit-card">
              <Link to={`/habits/${h.id}`}>
                <strong>{h.name}</strong>
                <span className="habit-stage">
                  {STAGE_LABEL[status.stage]}・連續 {status.currentStreak} 天
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <Link className="btn" to="/habits/new">
        ＋ 新增習慣
      </Link>
    </section>
  );
}
