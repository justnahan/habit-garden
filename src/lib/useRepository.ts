/**
 * 提供全 App 共用的單一 HabitRepository 實例，並在寫入後觸發重繪。
 */
import { createContext, useCallback, useContext, useSyncExternalStore } from 'react';
import { HabitRepository } from './repository';

export const RepositoryContext = createContext<HabitRepository | null>(null);

export function useRepository(): HabitRepository {
  const repo = useContext(RepositoryContext);
  if (!repo) {
    throw new Error('useRepository 必須在 RepositoryContext.Provider 之內使用');
  }
  return repo;
}

/**
 * 訂閱 repository 變更並回傳實例。任何打卡 / 新增 / 刪除等寫入後，使用此 hook 的
 * 元件會自動重繪。以 `getRevision()`（單調遞增數字）當 snapshot，確保資料未變時
 * 回傳穩定值，避免 `useSyncExternalStore` 進入無限重繪。
 */
export function useHabitStore(): HabitRepository {
  const repo = useRepository();
  const subscribe = useCallback(
    (onChange: () => void) => repo.subscribe(onChange),
    [repo],
  );
  const getSnapshot = useCallback(() => repo.getRevision(), [repo]);
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return repo;
}
