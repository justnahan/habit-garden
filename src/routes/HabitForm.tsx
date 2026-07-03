import { Link, useParams } from 'react-router-dom';

/**
 * 新增 / 編輯習慣表單（骨架佔位）。
 * 依有無 :id 判斷是新增還是編輯，實際表單欄位與驗證留待後續 stage。
 */
export function HabitForm() {
  const { id } = useParams();
  const mode = id ? '編輯' : '新增';

  return (
    <section>
      <h1>{mode}習慣</h1>
      <p className="placeholder">
        表單欄位（名稱、植物種類、提醒頻率）將於後續 stage 實作。
      </p>
      <Link className="btn" to="/">
        ← 返回花園
      </Link>
    </section>
  );
}
