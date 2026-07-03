import { describe, expect, it } from 'vitest';
import {
  SCHEMA_VERSION,
  STORAGE_KEY,
  createMemoryStore,
  emptyState,
  loadState,
  saveState,
} from '../storage';

describe('storage', () => {
  it('空 store 回傳空狀態', () => {
    const store = createMemoryStore();
    expect(loadState(store)).toEqual(emptyState());
  });

  it('save 後 load round-trip 一致', () => {
    const store = createMemoryStore();
    const state = {
      schemaVersion: SCHEMA_VERSION,
      habits: [
        {
          id: 'a',
          name: '喝水',
          plant: 'fern' as const,
          reminder: { kind: 'daily' as const },
          createdAt: '2026-07-01T00:00:00Z',
          updatedAt: '2026-07-01T00:00:00Z',
        },
      ],
      checkins: [],
    };
    saveState(state, store);
    expect(loadState(store)).toEqual(state);
  });

  it('損毀的 JSON 回退為空狀態而非崩潰', () => {
    const store = createMemoryStore();
    store.setItem(STORAGE_KEY, '{ not valid json');
    expect(loadState(store)).toEqual(emptyState());
  });

  it('缺欄位的資料會被正規化', () => {
    const store = createMemoryStore();
    store.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1 }));
    const loaded = loadState(store);
    expect(loaded.habits).toEqual([]);
    expect(loaded.checkins).toEqual([]);
  });
});
