/**
 * 提供全 App 共用的單一 HabitRepository 實例。
 *
 * 骨架階段先用最小 context。之後畫面接上時，可在此擴充 subscribe / 重繪機制。
 */
import { createContext, useContext } from 'react';
import { HabitRepository } from './repository';

export const RepositoryContext = createContext<HabitRepository | null>(null);

export function useRepository(): HabitRepository {
  const repo = useContext(RepositoryContext);
  if (!repo) {
    throw new Error('useRepository 必須在 RepositoryContext.Provider 之內使用');
  }
  return repo;
}
