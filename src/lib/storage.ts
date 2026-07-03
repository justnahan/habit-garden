/**
 * localStorage 持久層。
 *
 * 封裝讀寫、序列化、版本欄位與錯誤處理，對上層只暴露 `loadState` / `saveState`。
 * 保留 `schemaVersion` 以便未來搬移到真實 DB 或做資料遷移。
 * 任何解析失敗都回退到空狀態而非讓 App 崩潰（但會在 console 警告）。
 */

import type { CheckIn, Habit } from '../types';

export const STORAGE_KEY = 'habit-garden/v1';
export const SCHEMA_VERSION = 1;

/** 落地在 localStorage 的整體資料形狀。 */
export interface PersistedState {
  schemaVersion: number;
  habits: Habit[];
  checkins: CheckIn[];
}

export function emptyState(): PersistedState {
  return { schemaVersion: SCHEMA_VERSION, habits: [], checkins: [] };
}

/**
 * 允許在非瀏覽器環境（測試、SSR）注入替身 storage。
 * 只需符合 Web Storage 讀寫子集。
 */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function defaultStore(): KeyValueStore | null {
  try {
    if (typeof localStorage !== 'undefined') return localStorage;
  } catch {
    // 存取 localStorage 可能因隱私設定丟例外。
  }
  return null;
}

/** 記憶體版 store，供沒有 localStorage 的環境使用。 */
export function createMemoryStore(): KeyValueStore {
  const map = new Map<string, string>();
  return {
    getItem: (k) => (map.has(k) ? map.get(k)! : null),
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

/** 把未知資料遷移 / 正規化成目前版本。目前只有 v1，之後在此擴充。 */
function migrate(raw: unknown): PersistedState {
  if (!raw || typeof raw !== 'object') return emptyState();
  const obj = raw as Partial<PersistedState>;
  const habits = Array.isArray(obj.habits) ? obj.habits : [];
  const checkins = Array.isArray(obj.checkins) ? obj.checkins : [];
  return { schemaVersion: SCHEMA_VERSION, habits, checkins };
}

/** 讀取整體狀態；不存在或損毀時回傳空狀態。 */
export function loadState(store: KeyValueStore | null = defaultStore()): PersistedState {
  if (!store) return emptyState();
  const rawStr = store.getItem(STORAGE_KEY);
  if (!rawStr) return emptyState();
  try {
    return migrate(JSON.parse(rawStr));
  } catch (err) {
    console.warn('[habit-garden] 無法解析儲存資料，已回退為空狀態。', err);
    return emptyState();
  }
}

/** 寫入整體狀態。 */
export function saveState(
  state: PersistedState,
  store: KeyValueStore | null = defaultStore(),
): void {
  if (!store) return;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('[habit-garden] 無法寫入儲存資料（可能已滿或受限）。', err);
  }
}

/** 清空所有資料（設定頁「重置」用）。 */
export function clearState(store: KeyValueStore | null = defaultStore()): void {
  if (!store) return;
  try {
    store.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[habit-garden] 無法清除儲存資料。', err);
  }
}
