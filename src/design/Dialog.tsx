/**
 * 確認對話框 —— 用原生 `<dialog>` 的 showModal，天生具備焦點鎖定、Esc 關閉與
 * inert 背景，比自造 overlay 更符合無障礙，且不必自己管 tab trap。
 *
 * 目前用於「刪除習慣」的二次確認（避免誤刪）。做成通用元件，之後其他破壞性
 * 操作也能複用。
 */
import { useEffect, useId, useRef } from 'react';
import { Button } from './components';
import { IconAlert } from './icons';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 破壞性操作時，確認鈕走 danger 樣式。 */
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = '確認',
  cancelLabel = '取消',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const bodyId = useId();

  // 同步 open 狀態到原生 dialog（showModal 才會有 modal 焦點鎖定與背景 inert）。
  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    else if (!open && dlg.open) dlg.close();
  }, [open]);

  // Esc / 原生 cancel → 交給呼叫端關閉（阻止預設的直接 close，維持單一狀態源）。
  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onCancel();
    };
    dlg.addEventListener('cancel', handleCancel);
    return () => dlg.removeEventListener('cancel', handleCancel);
  }, [onCancel]);

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby={titleId}
      aria-describedby={body ? bodyId : undefined}
      // 點背景（dialog 本體，非內容）視為取消。
      onClick={(e) => {
        if (e.target === ref.current) onCancel();
      }}
    >
      <div className="dialog__panel">
        <div className={`dialog__icon${danger ? ' dialog__icon--danger' : ''}`} aria-hidden>
          <IconAlert size={22} />
        </div>
        <h2 id={titleId} className="dialog__title">
          {title}
        </h2>
        {body && (
          <p id={bodyId} className="dialog__body">
            {body}
          </p>
        )}
        <div className="dialog__actions">
          <Button variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} autoFocus>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
