import { Link } from 'react-router-dom';

/**
 * 空狀態（骨架佔位）：尚未建立任何習慣時的引導畫面。
 * 實際插圖與文案留待後續 stage；此處先確保有非空白的引導內容。
 */
export function EmptyState() {
  return (
    <section className="empty-state">
      <div className="empty-illustration" aria-hidden>
        🪴
      </div>
      <h1>你的花園還是空的</h1>
      <p>種下第一個習慣，開始讓花園慢慢長大吧。</p>
      <Link className="btn" to="/habits/new">
        ＋ 新增第一個習慣
      </Link>
    </section>
  );
}
