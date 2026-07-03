/**
 * 設計系統 style tile / 元件展示頁（YUN-11 交付的可預覽入口）。
 * 開場原型＝index-as-content 圖鑑卡牆，非行銷 hero。
 */
import { useEffect, useState } from 'react';
import './styleguide.css';
import { GROWTH_STAGES, PLANT_TYPES } from '../types';
import { plantMeta, stageMeta } from '../design/tokens';
import { Plant } from '../design/plants/Plant';
import {
  Button,
  Card,
  Field,
  Input,
  Select,
  SpecimenLabel,
  StageBadge,
  Stat,
} from '../design/components';
import { EmptyState, ErrorState, LoadingCard } from '../design/states';
import {
  IconPlus,
  IconDroplet,
  IconPencil,
  IconTrash,
  IconMoon,
  IconSun,
  IconBook,
} from '../design/icons';

const SWATCHES: { role: string; var: string; hex: string }[][] = [
  [
    { role: '主色 · 墨綠', var: '--color-primary', hex: '#1B4530' },
    { role: 'Accent · 朱紅', var: '--color-accent', hex: '#C8431F' },
  ],
  [
    { role: '成功 · 茂盛', var: '--color-success', hex: '#235539' },
    { role: '警示 · 芥黃', var: '--color-warning', hex: '#BE8A2C' },
    { role: '危險 · 胭脂', var: '--color-danger', hex: '#9E2B3F' },
    { role: '資訊 · 標本靛', var: '--color-info', hex: '#3C5A73' },
  ],
  [
    { role: '種子', var: '--color-stage-seed', hex: '#6E7A6F' },
    { role: '發芽', var: '--color-stage-sprout', hex: '#4E8767' },
    { role: '成長', var: '--color-stage-growing', hex: '#235539' },
    { role: '盛開', var: '--color-stage-blooming', hex: '#C8431F' },
    { role: '枯萎', var: '--color-stage-withered', hex: '#7A5A44' },
  ],
  [
    { role: '畫布 · 標本紙', var: '--color-canvas', hex: '#FBFCF9' },
    { role: '卡片面', var: '--color-surface', hex: '#FFFFFF' },
    { role: '凹陷', var: '--color-sunken', hex: '#E9ECE3' },
    { role: '文字', var: '--color-text', hex: '#17251C' },
    { role: '次要文字', var: '--color-text-muted', hex: '#47554C' },
    { role: '邊界 / 格線', var: '--color-border', hex: '#D5DBCC' },
  ],
];

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    return () => document.documentElement.removeAttribute('data-theme');
  }, [dark]);
  return [dark, () => setDark((d) => !d)] as const;
}

export function StyleGuide() {
  const [dark, toggleTheme] = useTheme();
  // 「打卡示範」：重新觸發抽長招牌動效
  const [growTick, setGrowTick] = useState(0);

  return (
    <div className="sg">
      <header className="sg-top">
        <div>
          <p className="u-eyebrow">HabitGarden · 設計系統 No.01</p>
          <h1 className="sg-top__title">植物標本圖鑑</h1>
          <p className="sg-top__id">
            每個習慣是一張標本卡（<span className="u-numeric">No.</span> 編號 ＋ 學名標籤 ＋ 刻線植物插畫），連續天數讓刻線植物一階一階抽長；<b style={{ color: 'var(--color-accent)' }}>朱紅</b>是唯一的手工上色。底色是方格標本紙，不是療癒系米白鼠尾草。
          </p>
          <p className="sg-top__anchor u-eyebrow">
            錨點：19 世紀植物標本圖鑑 / 種子目錄 · 刻意避開 sage 綠＋米白＋大圓角＋葉子插畫
          </p>
        </div>
        <Button variant="ghost" onClick={toggleTheme} aria-pressed={dark}>
          {dark ? <IconSun size={18} /> : <IconMoon size={18} />}
          {dark ? '亮色' : '深色'}模式
        </Button>
      </header>

      {/* ── 生長階段圖鑑（招牌）── */}
      <section className="sg-section">
        <header>
          <h2>生長階段圖鑑</h2>
          <p>5 種植物 × 5 階段。茂盛＝直立＋綻放，枯萎＝下垂＋斷莖＋乾燥短線——灰階下也能區辨，不只靠顏色。</p>
        </header>
        <div className="sg-atlas">
          <span />
          {GROWTH_STAGES.map((s) => (
            <span key={s} className="sg-atlas__head">
              {stageMeta[s].label}
            </span>
          ))}
          {PLANT_TYPES.map((t) => (
            <div key={t} style={{ display: 'contents' }}>
              <div className="sg-atlas__row-label">
                {plantMeta[t].label}
                <span className="u-latin">{plantMeta[t].latin}</span>
              </div>
              {GROWTH_STAGES.map((s) => (
                <div key={s} className="sg-atlas__cell">
                  <Plant type={t} stage={s} size={88} grew={s === 'blooming' && growTick > 0} key={`${s}-${growTick}`} />
                  <StageBadge stage={s} />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="sg-row" style={{ marginTop: 'var(--space-5)' }}>
          <Button variant="accent" onClick={() => setGrowTick((n) => n + 1)}>
            <IconDroplet size={18} /> 打卡示範（重播「抽長」招牌動效）
          </Button>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)' }}>
            尊重 prefers-reduced-motion：關閉動效時退化為靜態。
          </span>
        </div>
      </section>

      {/* ── 色彩系統 ── */}
      <section className="sg-section">
        <header>
          <h2>色彩系統</h2>
          <p>三層 token（reference → system → component）。品牌雙色有觀點；語意色各自不同色相，不一色多義。</p>
        </header>
        {[
          ['品牌', 0],
          ['語意狀態', 1],
          ['生長階段', 2],
          ['中性 · 標本紙', 3],
        ].map(([label, idx]) => (
          <div key={label as string} style={{ marginBottom: 'var(--space-5)' }}>
            <p className="u-eyebrow" style={{ marginBottom: 'var(--space-3)' }}>{label}</p>
            <div className="sg-swatches">
              {SWATCHES[idx as number].map((sw) => (
                <div key={sw.var} className="sg-swatch">
                  <div className="sg-swatch__chip" style={{ background: `var(${sw.var})` }} />
                  <div className="sg-swatch__meta">
                    <span className="sg-swatch__role">{sw.role}</span>
                    <span className="sg-swatch__hex">{sw.hex}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── 字體排版 ── */}
      <section className="sg-section">
        <header>
          <h2>字體與排版</h2>
          <p>內文 Noto Sans TC（現代黑體，絕不 fallback 襯線）；學名與數字走 Fraunces display italic。字級對比敢拉到 3–4 倍。</p>
        </header>
        <div className="sg-type-sample">
          <div style={{ fontSize: 'var(--text-4xl)', fontWeight: 700 }}>連續 <span className="u-numeric">128</span> 天</div>
          <small>display / 4xl 48px · 大數字用 Fraunces tabular-nums</small>
        </div>
        <div className="sg-type-sample">
          <h3 style={{ fontSize: 'var(--text-2xl)' }}>今天想澆哪一株？</h3>
          <small>heading / 2xl 28px · Noto Sans TC Bold</small>
        </div>
        <div className="sg-type-sample">
          <p>把「養成習慣」種成一座花園：每天完成就澆一次水，植物會一階一階長大；漏掉幾天它會枯萎提醒你，但歷史不會歸零。</p>
          <small>body / base 16px · line-height 1.6</small>
        </div>
        <div className="sg-type-sample">
          <span className="u-latin" style={{ fontSize: 'var(--text-lg)' }}>Helianthus annuus</span>
          <br />
          <small>latin / Fraunces italic · 標本學名</small>
        </div>
        <div className="sg-type-sample">
          <span className="u-eyebrow">SPECIMEN · 標本標籤</span>
          <br />
          <small>label / caption 12px · 大寫 · tracking 0.14em</small>
        </div>
      </section>

      {/* ── 基礎元件 ── */}
      <section className="sg-section">
        <header>
          <h2>基礎元件</h2>
          <p>按鈕、卡片、輸入、徽章、統計、標本標籤。所有互動元素 min 44px、focus-visible 有 ring。</p>
        </header>
        <div className="sg-grid">
          <Card>
            <p className="u-eyebrow" style={{ marginBottom: 'var(--space-4)' }}>按鈕</p>
            <div className="sg-stack">
              <div className="sg-row">
                <Button variant="primary"><IconPlus size={18} /> 主要</Button>
                <Button variant="accent"><IconDroplet size={18} /> 澆水</Button>
                <Button>次要</Button>
              </div>
              <div className="sg-row">
                <Button variant="ghost"><IconPencil size={18} /> 編輯</Button>
                <Button variant="danger"><IconTrash size={18} /> 刪除</Button>
                <Button disabled>停用</Button>
              </div>
              <div className="sg-row">
                <Button size="sm">小尺寸</Button>
                <Button size="sm" variant="accent" iconOnly aria-label="新增"><IconPlus size={16} /></Button>
              </div>
            </div>
          </Card>

          <Card>
            <p className="u-eyebrow" style={{ marginBottom: 'var(--space-4)' }}>輸入</p>
            <div className="sg-stack">
              <Field label="習慣名稱" htmlFor="d1" hint="例如：每天喝水 8 杯">
                <Input id="d1" placeholder="輸入習慣名稱" defaultValue="每天喝水 8 杯" />
              </Field>
              <Field label="植物種類" htmlFor="d2">
                <Select id="d2" defaultValue="fern">
                  {PLANT_TYPES.map((t) => (
                    <option key={t} value={t}>{plantMeta[t].label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="提醒頻率" htmlFor="d3" error="請至少選一個星期">
                <Input id="d3" invalid placeholder="每週幾天" />
              </Field>
            </div>
          </Card>

          <Card>
            <p className="u-eyebrow" style={{ marginBottom: 'var(--space-4)' }}>徽章 · 統計 · 標籤</p>
            <div className="sg-stack">
              <div className="sg-row">
                {GROWTH_STAGES.map((s) => <StageBadge key={s} stage={s} />)}
              </div>
              <div className="sg-row" style={{ gap: 'var(--space-7)' }}>
                <Stat value={128} label="目前連續" suffix="天" />
                <Stat value={214} label="最長連續" suffix="天" />
                <Stat value={356} label="累計打卡" suffix="次" />
              </div>
              <SpecimenLabel no={3} name="每天閱讀 20 分鐘" latin="Lectio quotidiana" />
            </div>
          </Card>

          {/* 習慣標本卡（元件組合示範） */}
          <Card interactive className="sg-card-demo">
            <SpecimenLabel no={7} name="晨跑" latin="Cursus matutinus" />
            <div className="sg-row" style={{ justifyContent: 'space-between' }}>
              <Plant type="sunflower" stage="blooming" size={96} />
              <Stat value={42} label="連續" suffix="天" />
            </div>
            <div className="sg-row" style={{ justifyContent: 'space-between' }}>
              <StageBadge stage="blooming" />
              <Button variant="accent" size="sm"><IconDroplet size={16} /> 今天已完成</Button>
            </div>
          </Card>
        </div>
      </section>

      {/* ── 狀態 ── */}
      <section className="sg-section">
        <header>
          <h2>空 / 載入 / 錯誤狀態</h2>
          <p>每個狀態都有實際插畫與對準任務、不苛責的文案，不是一行灰字。</p>
        </header>
        <div className="sg-grid">
          <Card>
            <EmptyState
              actions={<Button variant="accent"><IconPlus size={18} /> 種下第一個習慣</Button>}
            />
          </Card>
          <Card>
            <ErrorState
              actions={<Button variant="primary"><IconBook size={18} /> 重新整理</Button>}
            />
          </Card>
          <Card flush>
            <div style={{ padding: 'var(--space-5)' }}>
              <p className="u-eyebrow" style={{ marginBottom: 'var(--space-4)' }}>載入骨架</p>
              <LoadingCard />
            </div>
          </Card>
        </div>
      </section>

      <footer style={{ marginTop: 'var(--space-9)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--color-border)', color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
        HabitGarden 設計系統 · YUN-11 · 完整決策見 repo 根目錄 <span className="u-latin">DESIGN.md</span>
      </footer>
    </div>
  );
}
