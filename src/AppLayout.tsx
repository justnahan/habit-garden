import { NavLink, Outlet } from 'react-router-dom';
import { IconSprout } from './design/icons';

/**
 * 共用外框：頂部標題 + 導覽列 + 內容出口。
 * 骨架階段用最小樣式，僅確保各畫面可互相導航。
 * logo 用 house 刻線圖示，不用 emoji（design system 的 chrome icon 規範）。
 */
export function AppLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-logo" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <IconSprout size={20} /> 習慣花園
        </span>
        <nav className="app-nav">
          <NavLink to="/" end>
            花園
          </NavLink>
          <NavLink to="/habits/new">新增</NavLink>
          <NavLink to="/settings">設定</NavLink>
          <NavLink to="/onboarding">引導</NavLink>
          <NavLink to="/design">設計系統</NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
