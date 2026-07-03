import { useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { HabitRepository } from './lib/repository';
import { RepositoryContext } from './lib/useRepository';

/** App 根元件：建立單一 repository 實例並掛上路由。 */
export function App() {
  const repo = useMemo(() => new HabitRepository(), []);
  return (
    <RepositoryContext.Provider value={repo}>
      <RouterProvider router={router} />
    </RepositoryContext.Provider>
  );
}
