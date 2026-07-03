/**
 * 空 / 載入 / 錯誤狀態 —— 每個都有實際插畫，不是一行灰字。
 * 插畫延續刻線標本圖鑑語言。
 */
import type { ReactNode } from 'react';

/** 空狀態插畫：一格還沒貼上標本的空標本紙 + 空盆與待播的種子。 */
export function EmptyGardenArt({ size = 168 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 168 168" fill="none" aria-hidden
      stroke="var(--color-border-strong)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* 標本紙外框 + 角落黏貼標籤 */}
      <rect x="20" y="20" width="128" height="128" rx="3" fill="var(--color-raised)" />
      <path d="M20 44 H148" opacity="0.6" />
      {/* 標籤欄虛線（待填） */}
      <path d="M32 32 H96" stroke="var(--color-accent)" strokeDasharray="2 5" opacity="0.8" />
      {/* 空盆 */}
      <path d="M64 118 H104 L98 138 Q84 142 70 138 Z" fill="var(--color-surface)" />
      <path d="M60 118 H108" />
      {/* 一顆等待播下的種子（朱紅點題） */}
      <path d="M84 92 C90 96 90 104 84 108 C78 104 78 96 84 92 Z" fill="var(--color-accent-soft)" stroke="var(--color-accent)" />
      <path d="M84 108 V116" strokeDasharray="2 4" opacity="0.7" />
    </svg>
  );
}

/** 錯誤狀態插畫：翻倒的盆 + 撒出的土（有情緒但不苛責）。 */
export function ErrorArt({ size = 168 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 168 168" fill="none" aria-hidden
      stroke="var(--color-border-strong)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* 傾倒的盆 */}
      <g transform="rotate(-22 84 100)">
        <path d="M60 92 H108 L100 128 Q84 133 68 128 Z" fill="var(--color-raised)" />
        <path d="M55 92 H113" />
      </g>
      {/* 撒出的土（短刻線） */}
      <g opacity="0.7" strokeWidth="1.6">
        <path d="M104 112 l10 4M110 120 l10 2M100 122 l8 6M118 110 l8 1" stroke="var(--color-stage-withered)" />
      </g>
      {/* 一枚朱紅提示點 */}
      <circle cx="120" cy="128" r="3.4" fill="var(--color-danger)" stroke="none" />
      <path d="M120 118 v6M120 133 v.5" stroke="var(--color-danger)" />
    </svg>
  );
}

interface StateBlockProps {
  art: ReactNode;
  title: string;
  body?: string;
  actions?: ReactNode;
}
function StateBlock({ art, title, body, actions }: StateBlockProps) {
  return (
    <div className="state-block anim-rise">
      <div className="state-block__art">{art}</div>
      <h2 className="state-block__title">{title}</h2>
      {body && <p className="state-block__body">{body}</p>}
      {actions && <div className="state-block__actions">{actions}</div>}
    </div>
  );
}

export function EmptyState({ title = '你的標本冊還是空的', body = '種下第一個習慣，替它挑一株植物；每天澆水，它會在這裡一階一階長大。', actions }: Partial<StateBlockProps>) {
  return <StateBlock art={<EmptyGardenArt />} title={title} body={body} actions={actions} />;
}

export function ErrorState({ title = '這一格沒能長出來', body = '資料讀取時出了點狀況，不是你的錯。重新整理通常就好了。', actions }: Partial<StateBlockProps>) {
  return <StateBlock art={<ErrorArt />} title={title} body={body} actions={actions} />;
}

/** 載入骨架：維持版面穩定的 shimmer，而非置中轉圈。 */
export function LoadingCard() {
  return (
    <div className="card" aria-busy="true" aria-label="載入中">
      <div className="skeleton" style={{ height: 18, width: '55%', marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 96, width: '100%', marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 14, width: '40%' }} />
    </div>
  );
}
