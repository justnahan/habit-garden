/**
 * 植物插畫元件 —— 5 種植物 × 5 生長階段的銅版刻線 SVG。
 *
 * 用法：<Plant type="fern" stage="blooming" />
 *
 * 設計原則（對應 DESIGN.md 生長階段視覺規格）：
 * - 筆觸＝刻線（stroke，currentColor），葉片有葉脈、羽片、肌理——像標本圖鑑手繪。
 *   填色用 fillOpacity（低），輪廓 stroke 維持清晰＝銅版刻線質感。
 * - 顏色由階段語意 token 決定，**茂盛/枯萎不只靠顏色**：
 *     盛開 = 直立＋滿冠綻放＋朱紅手工上色的花；
 *     枯萎 = **每種植物有各自的凋亡樣態**（向日葵垂頭、仙人掌皺縮、盆栽枯枝、
 *            薰衣草穗垂落、蕨葉捲曲），不是共用一種下垂。
 * - 每種植物有不可誤認的剪影記號：向日葵花盤 / 仙人掌棘刺 / 盆栽層雲樹冠 /
 *   薰衣草花穗 / 蕨的羽狀葉與捲芽。
 */
import type { CSSProperties } from 'react';
import type { GrowthStage, PlantType } from '../../types';
import { stageColorVar, stageMeta, plantMeta } from '../tokens';

interface PlantProps {
  type: PlantType;
  stage: GrowthStage;
  size?: number | string;
  grew?: boolean;
  className?: string;
  style?: CSSProperties;
  decorative?: boolean;
}

const ACCENT = 'var(--color-accent)';
const SOIL = 'var(--color-border-strong)';
const FILL = 0.16;

/* ───────────────────────── 可重用刻線零件 ───────────────────────── */

/** 標準葉片：填色 ＋ 清晰輪廓 ＋ 中肋 ＋ 側脈。原點在葉基、葉尖朝上。 */
function Leaf({ x, y, rot = 0, s = 1, veins = true }: { x: number; y: number; rot?: number; s?: number; veins?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M0 0 C6 -5 6.6 -15 0 -23 C-6.6 -15 -6 -5 0 0 Z" fill="currentColor" fillOpacity={FILL} />
      <path d="M0 -1 L0 -21" strokeWidth={1.5} />
      {veins && (
        <path
          d="M0 -6 L4 -10 M0 -6 L-4 -10 M0 -11 L3.6 -14.5 M0 -11 L-3.6 -14.5 M0 -16 L2.8 -18.5 M0 -16 L-2.8 -18.5"
          strokeWidth={1.1}
          opacity={0.7}
        />
      )}
    </g>
  );
}

/** 盆栽/松的層雲樹冠：圓潤起伏的葉團 ＋ 內部層次弧線（不是向下的梳齒）。 */
function FoliagePad({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }) {
  const bumps = 4;
  const step = (2 * rx) / bumps;
  let d = `M ${(cx - rx).toFixed(1)} ${cy.toFixed(1)}`;
  for (let i = 0; i < bumps; i++) {
    const x0 = cx - rx + i * step;
    const x1 = x0 + step;
    const mx = (x0 + x1) / 2;
    const edge = i === 0 || i === bumps - 1 ? 0.7 : 1;
    const cyTop = cy - ry * 1.7 * edge;
    d += ` Q ${mx.toFixed(1)} ${cyTop.toFixed(1)} ${x1.toFixed(1)} ${cy.toFixed(1)}`;
  }
  d += ` Q ${cx.toFixed(1)} ${(cy + ry * 0.85).toFixed(1)} ${(cx - rx).toFixed(1)} ${cy.toFixed(1)} Z`;
  const tex: string[] = [];
  for (let i = 0; i < 3; i++) {
    const tx = cx - rx * 0.5 + i * rx * 0.5;
    tex.push(
      `M${(tx - 3).toFixed(1)} ${(cy - ry * 0.2).toFixed(1)} Q${tx.toFixed(1)} ${(cy - ry * 0.9).toFixed(1)} ${(tx + 3).toFixed(1)} ${(cy - ry * 0.2).toFixed(1)}`,
    );
  }
  return (
    <g>
      <path d={d} fill="currentColor" fillOpacity={FILL} />
      <g strokeWidth={1.1} opacity={0.4}>
        <path d={tex.join('')} />
      </g>
    </g>
  );
}

/** 羽狀葉（蕨）：主軸 ＋ 兩側羽片，羽片朝葉尖傾。 */
function Frond({ p0, c, p1, n = 7, leaf = 8 }: { p0: [number, number]; c: [number, number]; p1: [number, number]; n?: number; leaf?: number }) {
  const lines: string[] = [];
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const mt = 1 - t;
    const x = mt * mt * p0[0] + 2 * mt * t * c[0] + t * t * p1[0];
    const y = mt * mt * p0[1] + 2 * mt * t * c[1] + t * t * p1[1];
    let dx = 2 * mt * (c[0] - p0[0]) + 2 * t * (p1[0] - c[0]);
    let dy = 2 * mt * (c[1] - p0[1]) + 2 * t * (p1[1] - c[1]);
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    const nx = -dy;
    const ny = dx;
    const L = leaf * (1 - t * 0.55);
    const lx = x + nx * L + dx * L * 0.35;
    const ly = y + ny * L + dy * L * 0.35;
    const rx = x - nx * L + dx * L * 0.35;
    const ry = y - ny * L + dy * L * 0.35;
    lines.push(`M${x.toFixed(1)} ${y.toFixed(1)} L${lx.toFixed(1)} ${ly.toFixed(1)}`);
    lines.push(`M${x.toFixed(1)} ${y.toFixed(1)} L${rx.toFixed(1)} ${ry.toFixed(1)}`);
  }
  return (
    <g>
      <path d={`M${p0[0]} ${p0[1]} Q${c[0]} ${c[1]} ${p1[0]} ${p1[1]}`} strokeWidth={2} />
      <g strokeWidth={1.3} opacity={0.85}>
        <path d={lines.join('')} />
      </g>
    </g>
  );
}

/** 薰衣草花穗：綠莖 ＋ 頂端漸縮的朱紅小花（上小下大）。 */
function Spike({ x, yBase, yTop }: { x: number; yBase: number; yTop: number }) {
  const n = 7;
  const step = 3.4;
  const stemBottom = yTop + n * step;
  const dots = [];
  for (let i = 0; i < n; i++) {
    const cy = yTop + i * step;
    const r = 1.7 + i * 0.16;
    dots.push(<ellipse key={i} cx={x} cy={cy} rx={r} ry={r * 1.3} fill={ACCENT} stroke="none" />);
  }
  return (
    <g>
      <path d={`M${x} ${yBase} Q${x - 1.5} ${(yBase + stemBottom) / 2} ${x} ${stemBottom.toFixed(1)}`} strokeWidth={2} />
      {dots}
    </g>
  );
}

/** 小花（仙人掌/盆栽點綴）：朱紅花心 ＋ 五瓣。 */
function Blossom({ cx, cy, r = 3 }: { cx: number; cy: number; r?: number }) {
  const petals = [];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    petals.push(
      <ellipse key={i} cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r} rx={r * 0.7} ry={r * 0.5} transform={`rotate(${(a * 180) / Math.PI + 90} ${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r})`} fill={ACCENT} fillOpacity={0.85} stroke="none" />,
    );
  }
  return (
    <g>
      {petals}
      <circle cx={cx} cy={cy} r={r * 0.55} fill="var(--color-primary)" stroke="none" />
    </g>
  );
}

/** 向日葵花瓣路徑（水滴形，繞花心）。 */
function petalPath(cx: number, cy: number, a: number, r0: number, r1: number, hw: number) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const px = -s;
  const py = c;
  const tip = [cx + c * r1, cy + s * r1];
  const bL = [cx + c * r0 + px * hw, cy + s * r0 + py * hw];
  const bR = [cx + c * r0 - px * hw, cy + s * r0 - py * hw];
  const mL = [cx + c * (r1 * 0.55) + px * hw * 1.15, cy + s * (r1 * 0.55) + py * hw * 1.15];
  const mR = [cx + c * (r1 * 0.55) - px * hw * 1.15, cy + s * (r1 * 0.55) - py * hw * 1.15];
  return `M${bL[0].toFixed(1)} ${bL[1].toFixed(1)} Q${mL[0].toFixed(1)} ${mL[1].toFixed(1)} ${tip[0].toFixed(1)} ${tip[1].toFixed(1)} Q${mR[0].toFixed(1)} ${mR[1].toFixed(1)} ${bR[0].toFixed(1)} ${bR[1].toFixed(1)} Z`;
}

/* ───────────────────────── 共用基座 ───────────────────────── */

function Soil() {
  return (
    <g stroke={SOIL} fill="none">
      <path d="M20 124 Q60 116 100 124" />
      <path d="M28 128 Q60 123 92 128" opacity="0.6" />
    </g>
  );
}

function Tray() {
  return (
    <g>
      <path d="M30 116 H90 L84 130 Q60 134 36 130 Z" fill="currentColor" fillOpacity={0.1} stroke={SOIL} />
      <path d="M26 116 H94" stroke={SOIL} />
    </g>
  );
}

function Seed() {
  return (
    <>
      <Soil />
      <path d="M60 106 C68 110 69 119 61 124 C53 119 54 111 60 106 Z" fill="currentColor" fillOpacity={0.18} />
      <path d="M60 106 C68 110 69 119 61 124 C53 119 54 111 60 106 Z" />
      <path d="M60 109 C61 113 61 118 61 122" strokeWidth={1.3} opacity="0.55" />
    </>
  );
}

/* ───────────────────────── 各植物的枯萎（各不相同） ─────────────────────────
 * currentColor 已是枯褐 umber；差異靠**形狀**（灰階可辨）。 */
function Withered({ type }: { type: PlantType }) {
  switch (type) {
    case 'sunflower':
      // 高莖垂頭、掉落的花瓣
      return (
        <>
          <Soil />
          <path d="M60 122 C60 102 63 84 56 77 C51 71 44 73 42 80" />
          <circle cx="41" cy="84" r="6" fill="currentColor" fillOpacity={0.14} />
          <g strokeWidth={1.5} opacity={0.7}>
            <path d="M41 90 v5 M36 88 l-3 4 M46 88 l3 3 M35 82 l-4 1" />
          </g>
          <path d="M60 100 C52 102 48 108 50 113 C56 111 60 105 60 100 Z" fill="currentColor" fillOpacity={0.12} />
          <g fill="currentColor" fillOpacity={0.5} stroke="none">
            <path d="M70 122 C67 119 65 121 66 124 C69 125 72 124 70 122 Z" />
            <path d="M80 124 C77 122 75 123 76 126 C79 127 81 126 80 124 Z" />
          </g>
        </>
      );
    case 'cactus':
      // 皺縮傾斜、垂臂、掉落的段
      return (
        <>
          <Soil />
          <path d="M55 122 Q49 98 57 89 Q66 93 63 122 Z" fill="currentColor" fillOpacity={0.1} />
          <path d="M55 122 Q49 98 57 89 Q66 93 63 122" />
          <g strokeWidth={1.3} opacity={0.55}>
            <path d="M53 112 Q58 110 62 112 M52 104 Q57 102 61 104 M53 96 Q57 95 61 96" />
          </g>
          <path d="M62 104 Q72 106 72 116" />
          <g strokeWidth={1.2} opacity={0.6}>
            <path d="M57 90 v-3 M53 100 l-3 -1 M72 112 l3 1" />
          </g>
          <path d="M40 122 Q37 116 42 114 Q46 118 44 122 Z" fill="currentColor" fillOpacity={0.1} />
          <path d="M40 122 Q37 116 42 114 Q46 118 44 122" />
        </>
      );
    case 'bonsai':
      // 盆中枯枝：光禿曲幹 ＋ 斷枝 ＋ 盆內落針
      return (
        <>
          <Tray />
          <path d="M60 116 C56 108 63 104 59 96 C56 90 61 85 65 82" strokeWidth={3} />
          <g strokeWidth={2}>
            <path d="M59 100 C53 98 51 94 48 92" />
            <path d="M62 92 C67 90 69 86 72 85" />
            <path d="M65 82 C66 78 68 76 69 73" />
          </g>
          <g strokeWidth={1.4} opacity={0.7}>
            <path d="M48 92 l-4 -1 M72 85 l4 -1 M69 73 l1 -4" />
          </g>
          <g strokeWidth={1.2} opacity={0.55}>
            <path d="M48 120 l3 2 M66 121 l-3 2 M58 122 l1 2" />
          </g>
        </>
      );
    case 'lavender':
      // 花穗垂落、掉落的花
      return (
        <>
          <Soil />
          <g>
            <path d="M50 122 Q49 104 43 100 Q38 98 37 103" />
            <path d="M60 122 Q61 102 67 99 Q72 98 72 104" />
            <path d="M55 122 Q54 108 51 101" />
          </g>
          <g fill="currentColor" fillOpacity={0.5} stroke="none">
            <ellipse cx="37" cy="103" rx="2" ry="2.4" />
            <ellipse cx="72" cy="104" rx="2" ry="2.4" />
            <ellipse cx="51" cy="101" rx="1.8" ry="2.2" />
            <circle cx="46" cy="120" r="1.8" />
            <circle cx="64" cy="122" r="1.8" />
            <circle cx="56" cy="124" r="1.6" />
          </g>
        </>
      );
    case 'fern':
      // 羽葉捲曲乾枯、垂落
      return (
        <>
          <Soil />
          <path d="M60 122 C58 108 51 102 46 106 C42 109 45 114 49 111" strokeWidth={2.4} />
          <path d="M60 122 C62 107 70 102 75 106 C79 110 75 115 71 112" strokeWidth={2.4} />
          <path d="M60 122 C60 110 57 102 61 97" strokeWidth={2.2} />
          <g strokeWidth={1.2} opacity={0.6}>
            <path d="M54 110 l-4 -1 M50 106 l-3 -2 M66 110 l4 -1 M70 106 l3 -2 M59 104 l-3 -1" />
          </g>
        </>
      );
  }
}

/* ───────────────────────── 各植物本體（sprout/growing/blooming） ───────────────────────── */

function PlantBody({ type, stage }: { type: PlantType; stage: GrowthStage }) {
  if (stage === 'seed') return <Seed />;
  if (stage === 'withered') return <Withered type={type} />;

  switch (type) {
    /* ── 向日葵 ── */
    case 'sunflower':
      if (stage === 'sprout')
        return (
          <>
            <Soil />
            <path d="M60 122 V104" />
            <Leaf x={60} y={106} rot={-42} s={0.7} veins={false} />
            <Leaf x={60} y={106} rot={42} s={0.7} veins={false} />
          </>
        );
      if (stage === 'growing')
        return (
          <>
            <Soil />
            <path d="M60 122 C60 100 61 82 60 68" />
            <Leaf x={59} y={104} rot={-52} s={0.95} />
            <Leaf x={61} y={90} rot={52} s={0.95} />
            <Leaf x={60} y={78} rot={-38} s={0.75} />
            <path d="M60 68 C53 66 52 57 60 54 C68 57 67 66 60 68 Z" fill="currentColor" fillOpacity={FILL} />
            <path d="M60 54 C58 50 62 50 60 54" strokeWidth={1.4} opacity={0.7} />
          </>
        );
      return (
        <g className="plant-anim">
          <Soil />
          <path d="M60 122 C60 100 61 82 60 62" />
          <Leaf x={58} y={104} rot={-54} s={1} />
          <Leaf x={62} y={88} rot={54} s={1} />
          <g fill={ACCENT} stroke={ACCENT} strokeWidth={1.2} fillOpacity={0.9}>
            {Array.from({ length: 15 }).map((_, i) => (
              <path key={`o${i}`} d={petalPath(60, 44, (i / 15) * Math.PI * 2, 11, 27, 4.4)} />
            ))}
          </g>
          <g fill={ACCENT} stroke={ACCENT} strokeWidth={1} fillOpacity={1}>
            {Array.from({ length: 15 }).map((_, i) => (
              <path key={`i${i}`} d={petalPath(60, 44, ((i + 0.5) / 15) * Math.PI * 2, 9, 19, 3.4)} />
            ))}
          </g>
          <circle cx="60" cy="44" r="10.5" fill="var(--color-primary)" stroke="none" />
          <g stroke="var(--color-canvas)" strokeWidth={1} opacity={0.5}>
            <circle cx="60" cy="44" r="7" fill="none" />
            <path d="M55 41 l3 3 M63 41 l-3 3 M57 47 l3 -2 M60 39 v3" />
          </g>
        </g>
      );

    /* ── 仙人掌 ── */
    case 'cactus':
      if (stage === 'sprout')
        return (
          <>
            <Soil />
            <path d="M54 122 Q52 106 60 103 Q68 106 66 122 Z" fill="currentColor" fillOpacity={0.13} />
            <path d="M54 122 Q52 106 60 103 Q68 106 66 122" />
            <path d="M60 116 V107" strokeWidth={1.1} opacity={0.5} />
            <g strokeWidth="1.2" opacity="0.7"><path d="M60 106 v-3 M56 111 l-3 -2 M64 111 l3 -2 M56 117 l-3 -1 M64 117 l3 -1" /></g>
          </>
        );
      if (stage === 'growing')
        return (
          <>
            <Soil />
            <path d="M51 122 Q49 84 60 80 Q71 84 69 122 Z" fill="currentColor" fillOpacity={0.13} />
            <path d="M51 122 Q49 84 60 80 Q71 84 69 122" />
            <path d="M69 106 Q83 106 83 92 Q83 84 76 84" fill="currentColor" fillOpacity={0.13} />
            <path d="M69 106 Q83 106 83 92 Q83 84 76 84" />
            <g strokeWidth={1.1} opacity={0.45}><path d="M60 116 V86 M55 116 Q54 100 57 88 M65 116 Q66 100 63 88" /></g>
            <g strokeWidth="1.2" opacity="0.7"><path d="M60 90 v-5 M55 102 l-3 -2 M65 102 l3 -2 M55 112 l-3 -1 M65 112 l3 -1 M81 92 l4 -1 M80 98 l4 1" /></g>
          </>
        );
      return (
        <g className="plant-anim">
          <Soil />
          <path d="M50 122 Q48 78 60 74 Q72 78 70 122 Z" fill="currentColor" fillOpacity={0.13} />
          <path d="M50 122 Q48 78 60 74 Q72 78 70 122" />
          <path d="M70 108 Q85 108 85 92 Q85 84 78 84" fill="currentColor" fillOpacity={0.13} />
          <path d="M70 108 Q85 108 85 92 Q85 84 78 84" />
          <path d="M50 102 Q36 102 36 88 Q36 81 42 81" fill="currentColor" fillOpacity={0.13} />
          <path d="M50 102 Q36 102 36 88 Q36 81 42 81" />
          <g strokeWidth={1.1} opacity={0.45}><path d="M60 118 V82 M55 118 Q54 100 57 84 M65 118 Q66 100 63 84" /></g>
          <g strokeWidth="1.2" opacity="0.7"><path d="M55 106 l-3 -2 M65 106 l3 -2 M55 116 l-3 -1 M65 116 l3 -1 M83 92 l4 -1 M38 90 l-4 -1" /></g>
          <Blossom cx={60} cy={72} r={4} />
          <Blossom cx={49} cy={82} r={2.6} />
          <Blossom cx={83} cy={86} r={2.6} />
        </g>
      );

    /* ── 小松盆栽 ── */
    case 'bonsai':
      if (stage === 'sprout')
        return (
          <>
            <Tray />
            <path d="M60 116 V103" />
            <Leaf x={60} y={105} rot={-40} s={0.7} veins={false} />
            <Leaf x={60} y={105} rot={40} s={0.7} veins={false} />
          </>
        );
      if (stage === 'growing')
        return (
          <>
            <Tray />
            {/* 曲幹（有粗細與姿態） */}
            <path d="M60 116 C56 110 63 105 59 98 C56 92 62 88 66 85" strokeWidth={3.2} />
            {/* 後方低矮葉團先畫，主樹冠疊在上面 */}
            <FoliagePad cx={49} cy={91} rx={10} ry={6} />
            <FoliagePad cx={67} cy={80} rx={16} ry={9} />
          </>
        );
      return (
        // blooming = 層雲滿冠
        <g className="plant-anim">
          <Tray />
          <path d="M60 116 C55 106 64 100 58 91 C54 84 62 80 66 74" strokeWidth={3.4} />
          <path d="M59 96 C53 92 50 94 47 90" strokeWidth={2.4} />
          <FoliagePad cx={47} cy={84} rx={13} ry={8} />
          <FoliagePad cx={72} cy={70} rx={17} ry={9} />
          <FoliagePad cx={60} cy={54} rx={13} ry={8} />
          <g fill={ACCENT} stroke="none">
            <circle cx="72" cy="68" r="2" />
            <circle cx="47" cy="82" r="2" />
            <circle cx="61" cy="52" r="1.9" />
            <circle cx="79" cy="72" r="1.6" />
          </g>
        </g>
      );

    /* ── 薰衣草 ── */
    case 'lavender':
      if (stage === 'sprout')
        return (
          <>
            <Soil />
            <path d="M56 122 Q57 112 55 106 M64 122 Q63 112 65 106 M60 122 V104" strokeWidth={2} />
            <Leaf x={55} y={107} rot={-24} s={0.55} veins={false} />
            <Leaf x={65} y={107} rot={24} s={0.55} veins={false} />
            <Leaf x={60} y={105} rot={0} s={0.6} veins={false} />
          </>
        );
      if (stage === 'growing')
        return (
          // 叢生的年輕薰衣草：狹葉基叢 ＋ 多枝含苞
          <>
            <Soil />
            <path d="M45 122 Q60 108 75 122 Z" fill="currentColor" fillOpacity={0.1} />
            <g strokeWidth={1.6} opacity={0.6}>
              <path d="M60 120 L49 104 M60 120 L71 104 M60 120 L54 101 M60 120 L66 101 M60 120 L60 99" />
            </g>
            {[48, 54, 60, 66, 72].map((x, i) => {
              const top = [94, 88, 84, 88, 94][i];
              return (
                <g key={i}>
                  <path d={`M60 118 Q${x} 106 ${x} ${top + 8}`} strokeWidth={1.8} />
                  <path d={`M${x} ${top + 8} q3 -7 0 -12 q-3 5 0 12`} fill="currentColor" fillOpacity={FILL} strokeWidth={1.4} />
                </g>
              );
            })}
          </>
        );
      return (
        // blooming：滿叢花穗 ＋ 較實的基部葉叢
        <g className="plant-anim">
          <Soil />
          <path d="M43 122 Q60 108 77 122 Z" fill="currentColor" fillOpacity={0.1} />
          <g strokeWidth={1.4} opacity={0.55}>
            <path d="M52 120 l-8 3 M58 118 l-9 2 M68 120 l8 3 M62 118 l9 2 M60 119 v4 M55 121 l-6 2 M66 121 l6 2" />
          </g>
          <Spike x={46} yBase={116} yTop={70} />
          <Spike x={54} yBase={118} yTop={60} />
          <Spike x={62} yBase={116} yTop={64} />
          <Spike x={70} yBase={118} yTop={72} />
          <Spike x={59} yBase={117} yTop={52} />
        </g>
      );

    /* ── 蕨 ── */
    case 'fern':
      if (stage === 'sprout')
        return (
          <>
            <Soil />
            <path d="M60 122 C60 108 57 98 64 92 C71 86 66 78 60 80 C55 82 57 89 62 88" strokeWidth={2.4} />
            <Frond p0={[60, 118]} c={[54, 108]} p1={[47, 104]} n={4} leaf={5} />
          </>
        );
      if (stage === 'growing')
        return (
          <>
            <Soil />
            <Frond p0={[60, 122]} c={[48, 100]} p1={[38, 92]} n={6} leaf={7} />
            <Frond p0={[60, 122]} c={[72, 100]} p1={[82, 92]} n={6} leaf={7} />
            <path d="M60 122 C59 106 56 96 62 88 C67 83 62 78 57 80" strokeWidth={2.2} />
          </>
        );
      return (
        <g className="plant-anim">
          <Soil />
          <Frond p0={[60, 122]} c={[42, 104]} p1={[28, 84]} n={8} leaf={8} />
          <Frond p0={[60, 122]} c={[78, 104]} p1={[92, 84]} n={8} leaf={8} />
          <Frond p0={[60, 122]} c={[50, 92]} p1={[44, 60]} n={8} leaf={8} />
          <Frond p0={[60, 122]} c={[70, 92]} p1={[76, 60]} n={8} leaf={8} />
          <Frond p0={[60, 122]} c={[60, 88]} p1={[60, 54]} n={8} leaf={7.5} />
          <circle cx="60" cy="54" r="2" fill={ACCENT} stroke="none" />
        </g>
      );
  }
}

export function Plant({
  type,
  stage,
  size = 120,
  grew = false,
  className,
  style,
  decorative = false,
}: PlantProps) {
  const meta = stageMeta[stage];
  const pm = plantMeta[type];
  const alt = `${pm.label}・${meta.label}階段`;
  const foliage = stage === 'blooming' ? 'var(--color-primary)' : stageColorVar[stage];
  return (
    <span
      className={`plant${grew ? ' plant--grew' : ''}${className ? ' ' + className : ''}`}
      style={{ width: size, height: size, color: foliage, ...style }}
      role={decorative ? 'presentation' : 'img'}
      aria-label={decorative ? undefined : alt}
      aria-hidden={decorative ? true : undefined}
      title={decorative ? undefined : alt}
    >
      <svg
        viewBox="0 4 120 130"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        preserveAspectRatio="xMidYMax meet"
      >
        <PlantBody type={type} stage={stage} />
      </svg>
    </span>
  );
}
