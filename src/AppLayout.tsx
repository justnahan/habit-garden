import { NavLink, Outlet } from 'react-router-dom';

/**
 * 共用外框：頂部標題 + 導覽列 + 內容出口。
 * 骨架階段用最小樣式，僅確保 6 畫面可互相導航。
 */
export function AppLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-logo">🌱 習慣花園</span>
        <nav className="app-nav">
          <NavLink to="/" end>
            花園
          </NavLink>
          <NavLink to="/habits/new">新增</NavLink>
          <NavLink to="/settings">設定</NavLink>
          <NavLink to="/onboarding">引導</NavLink>
          <NavLink to="/empty">空狀態</NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
