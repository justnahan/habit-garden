import { Link } from 'react-router-dom';
import { useHabitStore } from '../lib/useRepository';
import { evaluateHabit } from '../lib/growth';
import { toDateKey, todayKey } from '../lib/date';
import { EmptyState } from '../design/states';
import { IconPlus } from '../design/icons';
import { GardenCard } from './GardenCard';
import './garden.css';

/**
 * 花園總覽（首頁）—— 核心畫面。
 *
 * 所有習慣以植物形式呈現，依「當前連續天數」對應生長階段（盛開 / 成長 / 枯萎
 * 一眼可辨）。每張卡可切換今日打卡，打卡即時觸發植物成長回饋。
 *
 * 用 `useHabitStore` 訂閱 repository：任何打卡 / 資料變更後自動重繪，
 * 生長階段與 streak 永遠反映最新事實。
 */
export function GardenOverview() {
  const repo = useHabitStore();
  const habits = repo.listHabits();
  const today = todayKey();

  if (habits.length === 0) {
    return (
      <EmptyState
        actions={
          <Link className="btn btn--accent" to="/habits/new">
            <IconPlus size={18} /> 種下第一個習慣
          </Link>
        }
      />
    );
  }

  const rows = habits.map((habit, i) => ({
    index: i + 1,
    habit,
    // 以建立日為 streak / 枯萎回溯下限：剛建立、還沒打卡的習慣是「種子」而非「枯萎」，
    // 不會把建立前的日子誤算成連續錯過。
    status: evaluateHabit(repo.listCheckIns(habit.id), habit.reminder, {
      since: toDateKey(new Date(habit.createdAt)),
    }),
    doneToday: repo.getCheckIn(habit.id, today)?.completed ?? false,
  }));

  const doneCount = rows.filter((r) => r.doneToday).length;
  const bloomCount = rows.filter((r) => r.status.stage === 'blooming').length;

  return (
    <section className="garden">
      <header className="garden-head">
        <div className="garden-head__titles">
          <span className="u-eyebrow">Herbarium · 標本冊</span>
          <h1 className="garden-head__title">我的花園</h1>
          <p className="garden-head__summary">
            共 <span className="u-numeric">{habits.length}</span> 個習慣 · 今天完成{' '}
            <span className="u-numeric">{doneCount}</span>/
            <span className="u-numeric">{habits.length}</span>
            {bloomCount > 0 && (
              <>
                {' '}· 盛開 <span className="u-numeric">{bloomCount}</span>
              </>
            )}
          </p>
        </div>
        <Link className="btn btn--accent" to="/habits/new">
          <IconPlus size={18} /> 新增習慣
        </Link>
      </header>

      <ul className="garden-grid">
        {rows.map(({ index, habit, status, doneToday }) => (
          <GardenCard
            key={habit.id}
            index={index}
            habit={habit}
            status={status}
            doneToday={doneToday}
            onToggle={() => repo.toggleCheckIn(habit.id, today)}
          />
        ))}
      </ul>
    </section>
  );
}
