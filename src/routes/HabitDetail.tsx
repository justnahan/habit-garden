import { Link, useParams } from 'react-router-dom';
import { useRepository } from '../lib/useRepository';
import { evaluateHabit } from '../lib/growth';

/**
 * 習慣詳情（骨架佔位）。顯示基本狀態，歷史月曆檢視留待後續 stage。
 */
export function HabitDetail() {
  const { id } = useParams();
  const repo = useRepository();
  const habit = id ? repo.getHabit(id) : undefined;

  if (!habit) {
    return (
      <section>
        <h1>找不到這個習慣</h1>
        <Link className="btn" to="/">
          ← 返回花園
        </Link>
      </section>
    );
  }

  const status = evaluateHabit(repo.listCheckIns(habit.id), habit.reminder);

  return (
    <section>
      <h1>{habit.name}</h1>
      <dl className="habit-stats">
        <div>
          <dt>目前連續</dt>
          <dd>{status.currentStreak} 天</dd>
        </div>
        <div>
          <dt>最長連續</dt>
          <dd>{status.longestStreak} 天</dd>
        </div>
        <div>
          <dt>累計完成</dt>
          <dd>{status.totalCompleted} 次</dd>
        </div>
      </dl>
      <p className="placeholder">月曆歷史檢視將於後續 stage 實作。</p>
      <div className="detail-actions">
        <Link className="btn" to={`/habits/${habit.id}/edit`}>
          編輯
        </Link>
        <Link className="btn" to="/">
          ← 返回花園
        </Link>
      </div>
    </section>
  );
}
