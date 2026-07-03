/**
 * 產生穩定的唯一 id。優先用 `crypto.randomUUID`，環境不支援時退回一個
 * 足夠唯一的字串（本機端 App、無多人衝突需求，故不需嚴格 UUID）。
 */
export function newId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    // 忽略，走 fallback。
  }
  const rand = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${time}-${rand}`;
}
