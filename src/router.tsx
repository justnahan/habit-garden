import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { GardenOverview } from './routes/GardenOverview';
import { HabitForm } from './routes/HabitForm';
import { HabitDetail } from './routes/HabitDetail';
import { Settings } from './routes/Settings';
import { Onboarding } from './routes/Onboarding';
import { EmptyState } from './routes/EmptyState';
import { StyleGuide } from './routes/StyleGuide';

/**
 * 6 個核心畫面的路由骨架。內容為佔位，供後續 stage 疊上實際 UI。
 *
 *   /onboarding      首次引導
 *   /                花園總覽（首頁）
 *   /habits/new      新增 / 編輯習慣表單
 *   /habits/:id      習慣詳情
 *   /settings        設定
 *   /empty           空狀態（骨架階段先獨立成路由方便預覽）
 */
export const router = createBrowserRouter([
  { path: '/onboarding', element: <Onboarding /> },
  { path: '/design', element: <StyleGuide /> },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <GardenOverview /> },
      { path: 'habits/new', element: <HabitForm /> },
      { path: 'habits/:id/edit', element: <HabitForm /> },
      { path: 'habits/:id', element: <HabitDetail /> },
      { path: 'settings', element: <Settings /> },
      { path: 'empty', element: <EmptyState /> },
    ],
  },
]);
