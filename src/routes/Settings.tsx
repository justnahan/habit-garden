import { Link } from 'react-router-dom';

/**
 * 設定頁（骨架佔位）：主題、通知提醒、資料匯出 / 重置等，留待後續 stage。
 */
export function Settings() {
  return (
    <section>
      <h1>設定</h1>
      <ul className="settings-list">
        <li>外觀主題（深色模式）— 待實作</li>
        <li>提醒設定 — 待實作</li>
        <li>資料匯出 / 重置 — 待實作</li>
      </ul>
      <Link className="btn" to="/">
        ← 返回花園
      </Link>
    </section>
  );
}
