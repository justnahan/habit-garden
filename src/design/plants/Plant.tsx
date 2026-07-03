/**
 * 植物插畫元件 —— 5 種植物 × 5 生長階段的銅版刻線 SVG。
 *
 * 用法：<Plant type="fern" stage="blooming" />
 *
 * 設計原則（對應 DESIGN.md 生長階段視覺規格）：
 * - 筆觸＝刻線（stroke，currentColor），葉片有葉脈、羽片、肌理——像標本圖鑑的手繪，
 *   不是單線火柴棒。填色用 fillOpacity（低），輪廓 stroke 維持清晰＝銅版刻線質感。
 * - 顏色由階段語意 token 決定，**茂盛/枯萎不只靠顏色**：
 *     盛開 = 直立＋滿冠綻放＋朱紅手工上色的花；枯萎 = 下垂＋斷莖＋掉葉＋乾燥短線。
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

/** 標準葉片：填色 ＋ 清晰輪廓 ＋ 中肋 ＋ 側脈（銅版刻線感）。原點在葉基、葉尖朝上。 */
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

/** 盆栽層雲樹冠：帶起伏邊緣 ＋ 針葉肌理。 */
function FoliagePad({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }) {
  // 起伏的雲團輪廓
  const bumps = 5;
  let d = `M ${cx - rx} ${cy}`;
  for (let i = 0; i < bumps; i++) {
    const t0 = i / bumps;
    const t1 = (i + 1) / bumps;
    const ang0 = Math.PI - t0 * Math.PI;
    const ang1 = Math.PI - t1 * Math.PI;
    const x0 = cx + Math.cos(ang0) * rx;
    const x1 = cx + Math.cos(ang1) * rx;
    const cxp = (x0 + x1) / 2;
    const cyp = cy - ry - ry * 0.5;
    d += ` Q ${cxp.toFixed(1)} ${cyp.toFixed(1)} ${x1.toFixed(1)} ${cy}`;
  }
  d += ` Q ${cx} ${(cy + ry * 0.7).toFixed(1)} ${cx - rx} ${cy} Z`;
  // 針葉短線
  const ticks = [];
  for (let i = 0; i < 6; i++) {
    const tx = cx - rx * 0.7 + (i / 5) * rx * 1.4;
    const ty = cy - ry * 0.2;
    ticks.push(`M${tx.toFixed(1)} ${ty.toFixed(1)} l0 -${(ry * 0.7).toFixed(1)}`);
  }
  return (
    <g>
      <path d={d} fill="currentColor" fillOpacity={FILL} />
      <g strokeWidth={1.1} opacity={0.55}>
        <path d={ticks.join('')} />
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
    // 兩側羽片，混一點主軸方向讓它朝尖端傾
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

/** 薰衣草花穗：綠莖 ＋ 頂端密集朱紅小花。 */
function Spike({ x, yBase, yTop }: { x: number; yBase: number; yTop: number }) {
  const florets = 6;
  const dots = [];
  for (let i = 0; i < florets; i++) {
    const cy = yTop + i * ((yBase - yTop) * 0.32) / florets * 3.1;
    const r = 2.6 - i * 0.18;
    dots.push(<ellipse key={i} cx={x} cy={cy} rx={r} ry={r * 1.25} fill={ACCENT} stroke="none" />);
  }
  return (
    <g>
      <path d={`M${x} ${yBase} Q${x - 1.5} ${(yBase + yTop) / 2} ${x} ${yTop + 2}`} strokeWidth={2} />
      {dots}
    </g>
  );
}

/** 小花（仙人掌/盆栽點綴）：朱紅花心 ＋ 五瓣。 */
function Blossom({ cx, cy, r = 3 }: { cx: number; cy: number; r?: number }) {
  const petals = [];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    petals.push(<ellipse key={i} cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r} rx={r * 0.7} ry={r * 0.5} transform={`rotate(${(a * 180) / Math.PI + 90} ${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r})`} fill={ACCENT} fillOpacity={0.85} stroke="none" />);
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

function WitheredForm() {
  return (
    <>
      <Soil />
      <path d="M60 122 C60 106 60 98 58 92 C56 86 50 84 44 88" />
      <path d="M58 96 L52 90" strokeWidth={1.6} opacity="0.7" />
      <g fillOpacity={0.1}>
        <path d="M58 100 C50 102 46 108 47 114 C54 113 59 107 58 100 Z" fill="currentColor" />
        <path d="M60 108 C68 112 72 118 70 122 C64 121 60 115 60 108 Z" fill="currentColor" />
        <path d="M84 124 C80 121 78 123 79 127 C83 128 86 127 84 124 Z" fill="currentColor" />
      </g>
      <g opacity="0.55" strokeWidth="1.4">
        <path d="M40 96 l-4 -3" />
        <path d="M72 118 l4 -2" />
        <path d="M50 112 l-3 3" />
      </g>
    </>
  );
}

/* ───────────────────────── 各植物本體 ───────────────────────── */

function PlantBody({ type, stage }: { type: PlantType; stage: GrowthStage }) {
  if (stage === 'seed') return <Seed />;
  if (stage === 'withered') return <WitheredForm />;

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
            {/* 含苞 */}
            <path d="M60 68 C53 66 52 57 60 54 C68 57 67 66 60 68 Z" fill="currentColor" fillOpacity={FILL} />
            <path d="M60 54 C58 50 62 50 60 54" strokeWidth={1.4} opacity={0.7} />
          </>
        );
      // blooming
      return (
        <g className="plant-anim">
          <Soil />
          <path d="M60 122 C60 100 61 82 60 62" />
          <Leaf x={58} y={104} rot={-54} s={1} />
          <Leaf x={62} y={88} rot={54} s={1} />
          {/* 外圈花瓣 */}
          <g fill={ACCENT} stroke={ACCENT} strokeWidth={1.2} fillOpacity={0.9}>
            {Array.from({ length: 15 }).map((_, i) => (
              <path key={`o${i}`} d={petalPath(60, 44, (i / 15) * Math.PI * 2, 11, 27, 4.4)} />
            ))}
          </g>
          {/* 內圈花瓣（錯位、稍短） */}
          <g fill={ACCENT} stroke={ACCENT} strokeWidth={1} fillOpacity={1}>
            {Array.from({ length: 15 }).map((_, i) => (
              <path key={`i${i}`} d={petalPath(60, 44, ((i + 0.5) / 15) * Math.PI * 2, 9, 19, 3.4)} />
            ))}
          </g>
          {/* 花心 ＋ 種盤肌理 */}
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
            {/* 主體 */}
            <path d="M51 122 Q49 84 60 80 Q71 84 69 122 Z" fill="currentColor" fillOpacity={0.13} />
            <path d="M51 122 Q49 84 60 80 Q71 84 69 122" />
            {/* 手臂 */}
            <path d="M69 106 Q83 106 83 92 Q83 84 76 84" fill="currentColor" fillOpacity={0.13} />
            <path d="M69 106 Q83 106 83 92 Q83 84 76 84" />
            {/* 稜線 */}
            <g strokeWidth={1.1} opacity={0.45}><path d="M60 116 V86 M55 116 Q54 100 57 88 M65 116 Q66 100 63 88" /></g>
            {/* 棘刺 */}
            <g strokeWidth="1.2" opacity="0.7"><path d="M60 90 v-5 M55 102 l-3 -2 M65 102 l3 -2 M55 112 l-3 -1 M65 112 l3 -1 M81 92 l4 -1 M80 98 l4 1" /></g>
          </>
        );
      // blooming
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
          {/* 頂端花冠 */}
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
            {/* 曲幹 */}
            <path d="M60 116 C57 108 63 104 60 96 C57 90 62 85 67 82" strokeWidth={3} />
            <FoliagePad cx={68} cy={78} rx={17} ry={9} />
            <FoliagePad cx={52} cy={84} rx={11} ry={6} />
          </>
        );
      // blooming = 滿冠層雲
      return (
        <g className="plant-anim">
          <Tray />
          <path d="M60 116 C56 106 63 100 59 90 C55 82 63 78 66 70" strokeWidth={3.2} />
          <path d="M62 84 C68 80 74 82 78 78" strokeWidth={2.4} />
          <FoliagePad cx={50} cy={80} rx={15} ry={8} />
          <FoliagePad cx={76} cy={70} rx={18} ry={10} />
          <FoliagePad cx={62} cy={56} rx={15} ry={8} />
          {/* 朱紅結果 */}
          <g fill={ACCENT} stroke="none">
            <circle cx="72" cy="66" r="2" />
            <circle cx="50" cy="78" r="2" />
            <circle cx="64" cy="53" r="1.9" />
            <circle cx="80" cy="72" r="1.6" />
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
          <>
            <Soil />
            {/* 叢生莖 */}
            <g strokeWidth={2}>
              <path d="M50 122 Q49 102 50 90" />
              <path d="M60 122 V88" />
              <path d="M70 122 Q71 102 70 90" />
              <path d="M55 122 Q54 106 56 96" />
              <path d="M65 122 Q66 106 64 96" />
            </g>
            {/* 銀葉 */}
            <g strokeWidth={1.3} opacity={0.6}><path d="M50 110 l-6 3 M60 108 l-6 3 M70 110 l6 3 M64 112 l6 2" /></g>
            {/* 含苞（綠） */}
            {[50, 60, 70].map((x, i) => (
              <path key={i} d={`M${x} 90 q3 -8 0 -12 q-3 4 0 12`} fill="currentColor" fillOpacity={FILL} strokeWidth={1.4} />
            ))}
          </>
        );
      // blooming：滿叢花穗
      return (
        <g className="plant-anim">
          <Soil />
          {/* 基部銀葉叢 */}
          <path d="M44 122 Q60 110 76 122 Z" fill="currentColor" fillOpacity={0.1} />
          <g strokeWidth={1.3} opacity={0.55}><path d="M50 118 l-7 3 M58 116 l-8 3 M70 118 l7 3 M64 116 l8 2 M60 118 v5" /></g>
          {/* 花穗 */}
          <Spike x={46} yBase={116} yTop={68} />
          <Spike x={54} yBase={118} yTop={58} />
          <Spike x={62} yBase={116} yTop={62} />
          <Spike x={70} yBase={118} yTop={70} />
          <Spike x={60} yBase={117} yTop={50} />
        </g>
      );

    /* ── 蕨 ── */
    case 'fern':
      if (stage === 'sprout')
        return (
          <>
            <Soil />
            {/* 捲芽 fiddlehead */}
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
            {/* 中間未展的捲芽 */}
            <path d="M60 122 C59 106 56 96 62 88 C67 83 62 78 57 80" strokeWidth={2.2} />
          </>
        );
      // blooming = 滿叢羽狀葉
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
  // 葉/莖用「植物色」：盛開時葉仍是深綠，只有花（ACCENT）才是朱紅手工上色。
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
