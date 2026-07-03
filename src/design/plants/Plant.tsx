/**
 * 植物插畫元件 —— 5 種植物 × 5 生長階段的銅版刻線 SVG。
 *
 * 用法：<Plant type="fern" stage="blooming" />
 *
 * 設計原則（對應 DESIGN.md 生長階段視覺規格）：
 * - 筆觸＝刻線（stroke，currentColor），與 house 圖示同一種線重語言。
 * - 顏色由階段語意 token 決定（--color-stage-*），但**茂盛/枯萎不只靠顏色**：
 *     盛開 = 直立 + 綻放的花／滿冠 + 朱紅手工上色點；
 *     枯萎 = 明顯下垂的輪廓 + 斷莖 + 掉落的葉 + 乾燥短線（灰階下即可辨）。
 * - 每種植物有不可誤認的剪影記號：向日葵花盤 / 仙人掌棘刺 / 盆栽淺盆 /
 *   薰衣草花穗 / 蕨的捲芽（fiddlehead）。
 */
import type { CSSProperties } from 'react';
import type { GrowthStage, PlantType } from '../../types';
import { stageColorVar, stageMeta, plantMeta } from '../tokens';

interface PlantProps {
  type: PlantType;
  stage: GrowthStage;
  /** 像素尺寸，預設 120。 */
  size?: number | string;
  /** 觸發「抽長」招牌動效（打卡成長回饋時設 true）。 */
  grew?: boolean;
  className?: string;
  style?: CSSProperties;
  /** 是否隱藏無障礙標籤（外層已有文字時設 true）。 */
  decorative?: boolean;
}

const ACCENT = 'var(--color-accent)';
const SOIL = 'var(--color-border-strong)';

/** 土壤基座（除盆栽外共用）。 */
function Soil() {
  return (
    <g stroke={SOIL} fill="none">
      <path d="M20 124 Q60 116 100 124" />
      <path d="M28 128 Q60 123 92 128" opacity="0.6" />
    </g>
  );
}

/** 盆栽的淺盆（bonsai 專用）。 */
function Tray() {
  return (
    <g>
      <path d="M30 116 H90 L84 130 Q60 134 36 130 Z" fill="currentColor" opacity="0.1" stroke={SOIL} />
      <path d="M26 116 H94" stroke={SOIL} />
    </g>
  );
}

/** 種子（所有植物在 seed 階段共用同一顆半埋種子）。 */
function Seed() {
  return (
    <>
      <Soil />
      <path d="M60 108 C67 112 68 119 62 123 C55 121 53 114 60 108 Z" fill="currentColor" opacity="0.16" />
      <path d="M60 108 C67 112 68 119 62 123 C55 121 53 114 60 108 Z" />
      <path d="M60 110 C61 114 61 118 61.5 121" opacity="0.5" />
    </>
  );
}

/** 兩片子葉（多數植物 sprout 階段共用）。 */
function Cotyledon() {
  return (
    <>
      <Soil />
      <path d="M60 122 V100" />
      <path d="M60 104 C52 100 46 102 44 108 C50 112 57 110 60 104 Z" fill="currentColor" opacity="0.14" />
      <path d="M60 104 C68 100 74 102 76 108 C70 112 63 110 60 104 Z" fill="currentColor" opacity="0.14" />
    </>
  );
}

/** 通用枯萎輪廓：下垂斷莖 + 一片掉落的葉 + 乾燥短線（非顏色區辨）。 */
function WitheredForm() {
  return (
    <>
      <Soil />
      {/* 折斷下垂的主莖 */}
      <path d="M60 122 C60 106 60 98 58 92 C56 86 50 84 44 88" />
      <path d="M58 96 L52 90" opacity="0.7" />
      {/* 下垂的葉 */}
      <path d="M58 100 C50 102 46 108 47 114 C54 113 59 107 58 100 Z" fill="currentColor" opacity="0.1" />
      <path d="M60 108 C68 112 72 118 70 122 C64 121 60 115 60 108 Z" fill="currentColor" opacity="0.1" />
      {/* 掉落的葉 */}
      <path d="M84 124 C80 121 78 123 79 127 C83 128 86 127 84 124 Z" fill="currentColor" opacity="0.12" />
      {/* 乾燥短線 */}
      <g opacity="0.55" strokeWidth="1.4">
        <path d="M40 96 l-4 -3" />
        <path d="M72 118 l4 -2" />
      </g>
    </>
  );
}

/** 每種植物 sprout / growing / blooming 三階的專屬上部。seed/withered 走共用件。 */
function PlantBody({ type, stage }: { type: PlantType; stage: GrowthStage }) {
  if (stage === 'seed') return <Seed />;
  if (stage === 'withered') return <WitheredForm />;

  switch (type) {
    case 'sunflower':
      if (stage === 'sprout') return <Cotyledon />;
      if (stage === 'growing')
        return (
          <>
            <Soil />
            <path d="M60 122 V64" />
            <path d="M60 96 C50 92 44 94 42 100 C50 104 57 102 60 96 Z" fill="currentColor" opacity="0.14" />
            <path d="M60 84 C70 80 76 82 78 88 C70 92 63 90 60 84 Z" fill="currentColor" opacity="0.14" />
            {/* 花苞 */}
            <circle cx="60" cy="58" r="7" fill="currentColor" opacity="0.16" />
            <circle cx="60" cy="58" r="7" />
          </>
        );
      return (
        // blooming
        <g className="plant-anim">
          <Soil />
          <path d="M60 122 V56" />
          <path d="M60 100 C49 96 42 98 40 105 C49 109 57 107 60 100 Z" fill="currentColor" opacity="0.14" />
          <path d="M60 88 C71 84 78 86 80 93 C71 97 63 95 60 88 Z" fill="currentColor" opacity="0.14" />
          {/* 花瓣（朱紅手工上色） */}
          <g fill={ACCENT} stroke={ACCENT}>
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i / 12) * Math.PI * 2;
              const x = 60 + Math.cos(a) * 20;
              const y = 46 + Math.sin(a) * 20;
              const x2 = 60 + Math.cos(a) * 11;
              const y2 = 46 + Math.sin(a) * 11;
              return <path key={i} d={`M${x2} ${y2} L${x} ${y}`} strokeWidth="4" opacity="0.85" />;
            })}
          </g>
          <circle cx="60" cy="46" r="10" fill="var(--color-primary)" />
          <circle cx="60" cy="46" r="10" stroke="var(--color-primary)" />
        </g>
      );

    case 'cactus':
      if (stage === 'sprout')
        return (
          <>
            <Soil />
            <path d="M54 122 Q54 106 60 104 Q66 106 66 122 Z" fill="currentColor" opacity="0.12" />
            <path d="M54 122 Q54 106 60 104 Q66 106 66 122" />
            <g strokeWidth="1.3" opacity="0.7"><path d="M60 108 v-4M56 112 l-3 -2M64 112 l3 -2" /></g>
          </>
        );
      if (stage === 'growing')
        return (
          <>
            <Soil />
            <path d="M52 122 Q52 84 60 82 Q68 84 68 122 Z" fill="currentColor" opacity="0.12" />
            <path d="M52 122 Q52 84 60 82 Q68 84 68 122" />
            <path d="M68 104 Q80 104 80 92 Q80 86 74 86" fill="currentColor" opacity="0.12" />
            <path d="M68 104 Q80 104 80 92 Q80 86 74 86" />
            <g strokeWidth="1.3" opacity="0.7"><path d="M60 96 v-6M56 106 v-4M64 106 v-4M78 94 h4" /></g>
          </>
        );
      return (
        // blooming
        <g className="plant-anim">
          <Soil />
          <path d="M50 122 Q50 78 60 76 Q70 78 70 122 Z" fill="currentColor" opacity="0.12" />
          <path d="M50 122 Q50 78 60 76 Q70 78 70 122" />
          <path d="M70 106 Q84 106 84 92 Q84 84 77 84" fill="currentColor" opacity="0.12" />
          <path d="M70 106 Q84 106 84 92 Q84 84 77 84" />
          <path d="M50 100 Q38 100 38 88 Q38 82 44 82" fill="currentColor" opacity="0.12" />
          <path d="M50 100 Q38 100 38 88 Q38 82 44 82" />
          <g strokeWidth="1.3" opacity="0.7"><path d="M60 90 v-6M55 108 v-4M65 108 v-4" /></g>
          {/* 頂花（朱紅） */}
          <g stroke={ACCENT} fill={ACCENT}>
            <circle cx="60" cy="74" r="3.2" />
            <path d="M60 71 v-4M57 72 l-3 -2M63 72 l3 -2" strokeWidth="2.4" />
          </g>
        </g>
      );

    case 'bonsai':
      if (stage === 'sprout')
        return (
          <>
            <Tray />
            <path d="M60 116 V102" />
            <path d="M60 106 C53 103 49 105 48 110 C54 112 59 110 60 106 Z" fill="currentColor" opacity="0.14" />
            <path d="M60 104 C67 101 71 103 72 108 C66 110 61 108 60 104 Z" fill="currentColor" opacity="0.14" />
          </>
        );
      if (stage === 'growing')
        return (
          <>
            <Tray />
            <path d="M60 116 C60 104 56 98 62 90 C66 85 63 80 66 76" />
            <ellipse cx="66" cy="70" rx="16" ry="9" fill="currentColor" opacity="0.16" />
            <ellipse cx="66" cy="70" rx="16" ry="9" />
          </>
        );
      return (
        // blooming = 滿冠茂盛
        <g className="plant-anim">
          <Tray />
          <path d="M60 116 C60 102 54 96 60 86 C64 80 58 74 64 68" />
          <path d="M64 66 C68 62 74 62 78 66" />
          <ellipse cx="52" cy="72" rx="15" ry="8" fill="currentColor" opacity="0.16" />
          <ellipse cx="52" cy="72" rx="15" ry="8" />
          <ellipse cx="74" cy="60" rx="18" ry="10" fill="currentColor" opacity="0.18" />
          <ellipse cx="74" cy="60" rx="18" ry="10" />
          <ellipse cx="60" cy="46" rx="13" ry="7" fill="currentColor" opacity="0.14" />
          <ellipse cx="60" cy="46" rx="13" ry="7" />
          {/* 幾點朱紅結果 */}
          <g fill={ACCENT} stroke="none"><circle cx="70" cy="58" r="2" /><circle cx="50" cy="70" r="2" /><circle cx="62" cy="44" r="1.8" /></g>
        </g>
      );

    case 'lavender':
      if (stage === 'sprout') return <Cotyledon />;
      if (stage === 'growing')
        return (
          <>
            <Soil />
            {[48, 60, 72].map((x, i) => (
              <path key={i} d={`M${x} 122 Q${x} 96 ${x} 84`} />
            ))}
            <path d="M48 100 l-8 4M60 96 l0 0M72 100 l8 4" opacity="0.6" />
            {[48, 60, 72].map((x, i) => (
              <path key={`b${i}`} d={`M${x} 84 q3 -6 0 -10 q-3 4 0 10`} fill="currentColor" opacity="0.16" />
            ))}
          </>
        );
      return (
        // blooming：多根花穗 + 朱紅小花點
        <g className="plant-anim">
          <Soil />
          {[44, 54, 64, 74].map((x, i) => {
            const top = 60 + (i % 2) * 8;
            return (
              <g key={i}>
                <path d={`M${x} 122 Q${x} 92 ${x} ${top + 4}`} />
                {Array.from({ length: 4 }).map((_, j) => (
                  <circle key={j} cx={x} cy={top + 4 - j * 5} r="2.4" fill={ACCENT} stroke="none" opacity={0.85 - j * 0.12} />
                ))}
              </g>
            );
          })}
          <path d="M50 108 l-8 5M68 108 l8 5" opacity="0.5" />
        </g>
      );

    case 'fern':
      if (stage === 'sprout')
        return (
          // 捲芽 fiddlehead —— 蕨的招牌剪影
          <>
            <Soil />
            <path d="M60 122 C60 108 58 98 64 92 C70 87 66 80 60 82 C55 84 56 90 61 89" />
          </>
        );
      if (stage === 'growing')
        return (
          <>
            <Soil />
            <path d="M60 122 C58 104 54 94 60 84 C64 78 60 72 55 74 C51 76 53 81 57 80" />
            <g fill="none">
              <path d="M58 100 C48 98 42 100 40 106" />
              <path d="M58 100 l-4 -3M52 99 l-4 -2M46 100 l-3 -2" opacity="0.7" strokeWidth="1.4" />
              <path d="M60 90 C70 86 76 88 79 94" />
              <path d="M62 90 l4 -3M68 89 l4 -2M74 90 l3 -2" opacity="0.7" strokeWidth="1.4" />
            </g>
          </>
        );
      return (
        // blooming = 滿叢羽狀葉茂盛
        <g className="plant-anim">
          <Soil />
          {[
            { d: 'M60 122 C50 100 40 88 28 82', tilt: -1 },
            { d: 'M60 122 C70 100 80 88 92 82', tilt: 1 },
            { d: 'M60 122 C58 96 56 78 52 62', tilt: 0 },
            { d: 'M60 122 C64 98 70 82 78 68', tilt: 1 },
            { d: 'M60 122 C56 98 48 84 44 70', tilt: -1 },
          ].map((f, i) => (
            <path key={i} d={f.d} fill="none" />
          ))}
          {/* 羽片小刻線（茂盛的非顏色線索：密集羽狀） */}
          <g opacity="0.65" strokeWidth="1.3">
            <path d="M46 96 l-5 -1M40 88 l-5 0M52 74 l-5 1M74 76 l5 1M80 88 l5 0M67 84 l5 -1" />
          </g>
          {/* 一顆朱紅新芽點 */}
          <circle cx="52" cy="62" r="2" fill={ACCENT} stroke="none" />
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
  // 葉/莖用「植物色」：盛開時葉仍是深綠，只有花（ACCENT 硬編）才是朱紅手工上色，
  // 避免整株變紅（紅色蕨/盆栽不自然）。徽章另用 stageColorVar 呈現階段。
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
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        preserveAspectRatio="xMidYMax meet"
      >
        <PlantBody type={type} stage={stage} />
      </svg>
    </span>
  );
}
