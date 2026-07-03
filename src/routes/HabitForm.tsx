/**
 * 新增 / 編輯習慣表單。
 *
 * 同一個元件依網址有無 :id 切換「新增 / 編輯」：
 *   /habits/new        新增
 *   /habits/:id/edit   編輯（含刪除，刪除有二次確認避免誤刪）
 *
 * 欄位：名稱、植物種類（5 選 1，即時預覽）、提醒頻率（每天 / 每週指定星期）。
 * 純邏輯（驗證、payload 轉換）抽在 `lib/habitForm`，此處只管畫面與互動。
 * 所有樣式走 design system token / class，不自造色值。
 */
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useHabitStore } from '../lib/useRepository';
import { PLANT_TYPES, type Weekday } from '../types';
import { Button, Field, Input } from '../design/components';
import { Plant } from '../design/plants/Plant';
import { ErrorState } from '../design/states';
import { ConfirmDialog } from '../design/Dialog';
import { plantMeta } from '../design/tokens';
import { IconCheck, IconPlus, IconTrash } from '../design/icons';
import {
  DEFAULT_FORM_VALUES,
  WEEKDAYS,
  WEEKDAY_LABELS,
  fromHabit,
  hasErrors,
  toPayload,
  toggleDay,
  validateHabitForm,
  type HabitFormValues,
} from '../lib/habitForm';
import './habit-form.css';

export function HabitForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const repo = useHabitStore();

  const existing = id ? repo.getHabit(id) : undefined;
  const notFound = Boolean(id) && !existing;

  const [values, setValues] = useState<HabitFormValues>(() =>
    existing ? fromHabit(existing) : DEFAULT_FORM_VALUES,
  );
  const [submitted, setSubmitted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // 編輯一個不存在（例如已被刪除）的習慣：給設計過的錯誤狀態，而非白畫面。
  if (notFound) {
    return (
      <ErrorState
        title="找不到這個習慣"
        body="它可能已經被刪除了。回到花園看看其他還在生長的植物吧。"
        actions={
          <Link className="btn" to="/">
            ← 返回花園
          </Link>
        }
      />
    );
  }

  const editing = Boolean(existing);
  const errors = validateHabitForm(values);
  // 只有送出後才紅字標錯，避免使用者剛進表單就被錯誤訊息轟炸。
  const shown = submitted ? errors : {};

  const patch = (partial: Partial<HabitFormValues>) =>
    setValues((v) => ({ ...v, ...partial }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors(errors)) return;
    const payload = toPayload(values);
    if (existing) repo.updateHabit(existing.id, payload);
    else repo.createHabit(payload);
    navigate('/');
  };

  const handleDelete = () => {
    if (existing) repo.deleteHabit(existing.id);
    setConfirmOpen(false);
    navigate('/');
  };

  return (
    <section className="habit-form">
      <header className="habit-form__head">
        <span className="u-eyebrow">{editing ? '編輯標本' : '播下新種子'}</span>
        <h1 className="habit-form__title">{editing ? '編輯習慣' : '新增習慣'}</h1>
      </header>

      <form className="habit-form__grid" onSubmit={handleSubmit} noValidate>
        {/* 即時預覽：讓使用者一眼看到選定植物長什麼樣 */}
        <aside className="habit-form__preview" aria-hidden>
          <div className="habit-form__preview-stage">
            <Plant type={values.plant} stage="growing" size={132} decorative />
          </div>
          <p className="habit-form__preview-name">
            {plantMeta[values.plant].label}
            <span className="u-latin"> · {plantMeta[values.plant].latin}</span>
          </p>
        </aside>

        <div className="habit-form__fields">
          <Field
            label="習慣名稱"
            htmlFor="habit-name"
            hint="例如：每天喝 8 杯水、睡前閱讀 10 分鐘"
            error={shown.name}
          >
            <Input
              id="habit-name"
              value={values.name}
              maxLength={40}
              placeholder="想養成什麼習慣？"
              invalid={Boolean(shown.name)}
              onChange={(e) => patch({ name: e.target.value })}
              autoFocus={!editing}
            />
          </Field>

          {/* 植物種類：5 選 1 的視覺 radiogroup（不只文字，附插畫剪影） */}
          <Field label="植物種類">
            <div className="plant-choices" role="radiogroup" aria-label="植物種類">
              {PLANT_TYPES.map((type) => {
                const selected = values.plant === type;
                return (
                  <button
                    type="button"
                    key={type}
                    role="radio"
                    aria-checked={selected}
                    className={`plant-choice${selected ? ' is-selected' : ''}`}
                    onClick={() => patch({ plant: type })}
                  >
                    <span className="plant-choice__art">
                      <Plant type={type} stage="growing" size={56} decorative />
                    </span>
                    <span className="plant-choice__label">{plantMeta[type].label}</span>
                  </button>
                );
              })}
            </div>
          </Field>

          {/* 提醒頻率：每天 / 每週指定星期 */}
          <Field label="提醒頻率" error={shown.days}>
            <div className="segmented" role="radiogroup" aria-label="提醒頻率">
              <button
                type="button"
                role="radio"
                aria-checked={values.kind === 'daily'}
                className={`segmented__btn${values.kind === 'daily' ? ' is-active' : ''}`}
                onClick={() => patch({ kind: 'daily' })}
              >
                每天
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={values.kind === 'weekly'}
                className={`segmented__btn${values.kind === 'weekly' ? ' is-active' : ''}`}
                onClick={() => patch({ kind: 'weekly' })}
              >
                每週指定
              </button>
            </div>

            {values.kind === 'weekly' && (
              <div className="weekday-picker" role="group" aria-label="每週哪幾天">
                {WEEKDAYS.map((day) => {
                  const on = values.days.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      aria-pressed={on}
                      aria-label={`星期${WEEKDAY_LABELS[day]}`}
                      className={`weekday${on ? ' is-on' : ''}`}
                      onClick={() =>
                        patch({ days: toggleDay(values.days, day as Weekday) })
                      }
                    >
                      {WEEKDAY_LABELS[day]}
                    </button>
                  );
                })}
              </div>
            )}
          </Field>

          <div className="habit-form__actions">
            <div className="habit-form__actions-main">
              <Button type="submit" variant="accent">
                {editing ? <IconCheck size={18} /> : <IconPlus size={18} />}
                {editing ? '儲存變更' : '種下這個習慣'}
              </Button>
              <Link className="btn btn--ghost" to="/">
                取消
              </Link>
            </div>

            {editing && (
              <Button
                type="button"
                variant="danger"
                className="habit-form__delete"
                onClick={() => setConfirmOpen(true)}
              >
                <IconTrash size={18} /> 刪除習慣
              </Button>
            )}
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        danger
        title={`確定要刪除「${existing?.name ?? ''}」嗎？`}
        body="這株植物與它的所有打卡紀錄都會一併移除，這個動作無法復原。"
        confirmLabel="刪除"
        cancelLabel="先留著"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  );
}
