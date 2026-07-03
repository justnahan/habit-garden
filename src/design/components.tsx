/**
 * 基礎元件 primitives —— 全部只吃 system.css 的 class 與 token，不散寫樣式。
 */
import type {
  ButtonHTMLAttributes,
  ElementType,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react';
import type { GrowthStage } from '../types';
import { stageMeta } from './tokens';
import { stageIcon } from './stage-visuals';
import { IconAlert } from './icons';

/* ───────────────────────────── Button ───────────────────────────── */
type BtnVariant = 'default' | 'primary' | 'accent' | 'ghost' | 'danger';
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: 'md' | 'sm';
  iconOnly?: boolean;
}
const variantClass: Record<BtnVariant, string> = {
  default: '',
  primary: 'btn--primary',
  accent: 'btn--accent',
  ghost: 'btn--ghost',
  danger: 'btn--danger',
};
export function Button({ variant = 'default', size = 'md', iconOnly, className, children, ...rest }: ButtonProps) {
  const cls = ['btn', variantClass[variant], size === 'sm' ? 'btn--sm' : '', iconOnly ? 'btn--icon' : '', className]
    .filter(Boolean)
    .join(' ');
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

/* ───────────────────────────── Card ───────────────────────────── */
export function Card({
  interactive,
  flush,
  className,
  children,
  as: As = 'div',
  ...rest
}: { interactive?: boolean; flush?: boolean; as?: ElementType; className?: string; children: ReactNode } & Record<string, unknown>) {
  const cls = ['card', interactive ? 'card--interactive' : '', flush ? 'card--flush' : '', className].filter(Boolean).join(' ');
  return (
    <As className={cls} {...rest}>
      {children}
    </As>
  );
}

/* ───────────────────────────── SpecimenLabel（招牌母題） ─────────────────────────────
 * No. 編號 + 名稱 + 學名（斜體 display）。整站的識別記號。 */
export function SpecimenLabel({ no, name, latin }: { no: number | string; name: string; latin?: string }) {
  const num = typeof no === 'number' ? String(no).padStart(2, '0') : no;
  return (
    <div className="specimen-label">
      <span className="specimen-label__no">No.{num}</span>
      <span className="specimen-label__name">{name}</span>
      {latin && <span className="specimen-label__latin">{latin}</span>}
    </div>
  );
}

/* ───────────────────────────── StageBadge ─────────────────────────────
 * 生長階段徽章：色 + 圖示 + 文字三重編碼（茂盛/枯萎不只靠顏色，過無障礙）。 */
export function StageBadge({ stage, showCaption = false }: { stage: GrowthStage; showCaption?: boolean }) {
  const meta = stageMeta[stage];
  const StageIcon = stageIcon[stage];
  return (
    <span className={`badge ${meta.badgeClass}`} title={meta.caption}>
      <StageIcon size={14} />
      {meta.label}
      {showCaption && <span style={{ opacity: 0.75 }}>· {meta.caption}</span>}
    </span>
  );
}

/* ───────────────────────────── Stat（streak / 數字） ───────────────────────────── */
export function Stat({ value, label, suffix }: { value: number | string; label: string; suffix?: string }) {
  return (
    <div className="stat">
      <span className="stat__value">
        {value}
        {suffix && <span style={{ fontSize: '0.5em', marginLeft: 2 }}>{suffix}</span>}
      </span>
      <span className="stat__label">{label}</span>
    </div>
  );
}

/* ───────────────────────────── Field / Input / Select ───────────────────────────── */
interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
}
export function Field({ label, hint, error, htmlFor, children }: FieldProps) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && !error && <span className="field__hint">{hint}</span>}
      {error && (
        <span className="field__error">
          <IconAlert size={15} />
          {error}
        </span>
      )}
    </div>
  );
}
export function Input({ invalid, ...rest }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input className="input" aria-invalid={invalid || undefined} {...rest} />;
}
export function Select({ invalid, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select className="select" aria-invalid={invalid || undefined} {...rest}>
      {children}
    </select>
  );
}
