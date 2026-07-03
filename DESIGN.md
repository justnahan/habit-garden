# HabitGarden — 設計系統與視覺識別（DESIGN.md）

> 這份是 HabitGarden 的**設計決策唯一真相**。後續所有畫面照這裡做，不再各自發揮或自造配色。
> 對應可匯入的 token：`src/design/tokens.css`（三層 CSS 變數）＋ `src/design/tokens.ts`（程式化語意 token）。
> 可預覽的 style tile / 元件展示頁：路由 `/design`（`src/routes/StyleGuide.tsx`）。

---

## 1. 識別一句話

> **植物標本圖鑑。** 每個習慣是一張標本卡（`No.` 編號 ＋ 學名標籤 ＋ 刻線植物插畫），連續天數讓刻線植物一階一階抽長；**朱紅**是唯一的手工上色。底色是方格標本紙，不是療癒系米白鼠尾草。

- **錨點（具體、非軟體）**：19 世紀植物標本圖鑑 / 種子目錄——銅版刻線插畫 ＋ 活版標本標籤 ＋ 方格標本紙。
- **母題（3 個可建造）**：①刻線植物插畫（stroke 描邊 ＋ 極淡填色）②標本標籤（`No.0X` ＋ 學名 ＋ ruled underline）③方格標本紙肌理（極淡 graph-paper 底）。
- **拿掉 logo 還認得出**：是的——標本編號標籤 ＋ 刻線植物 ＋ 朱紅單一上色 ＋ 方格底，是這個產品獨有的臉。

### 刻意避開（health / wellness 品類通用臉）
鼠尾草綠（sage）＋ 米白 ＋ 大圓角（12–16px）＋ 葉子/冥想插畫 ＋ 馬卡龍粉彩 ＋ emoji 植物 🌱🪴。
這些是「養生 App 的 AI 通用臉」，本專案全數避開。

---

## 2. 七軸承諾 ＋ 三旋鈕

| 軸 | 承諾 |
|---|---|
| **圓角** | 俐落 2–4px（標本卡片方正感）；`full` 只給 chip / 圓點。**拒絕安全的 12–16px 中間值。** |
| **底色** | 冷調紙白 `#FBFCF9`（帶極淡綠灰，讀作壓紙非奶油）＋ 方格標本紙肌理。**非暖米白。** |
| **色盤** | **墨綠 × 朱紅**雙色，有觀點。從植物標本圖鑑吸色。**拒絕 sage / teal / indigo / 大地褐當品牌色。** |
| **字體** | 內文 **Noto Sans TC**（現代黑體，絕不 fallback 襯線）；學名與大數字走 **Fraunces** display italic。字級對比敢拉 3–4 倍。 |
| **招牌動效** | 打卡時植物「抽長」——莖幹自底 `scaleY` 抽長、透明度升起（`stem-rise`，320ms `--ease-decelerate`）。 |
| **招牌母題** | **標本編號標籤系統**（`No.0X` ＋ 學名 ＋ ruled underline），全站一致，只此一個記憶點。 |
| **開場原型** | index-as-content 圖鑑卡牆（非行銷 hero、非大標題）。 |

**三旋鈕**：VARIANCE 6 / MOTION 3 / DENSITY 5（至少一條離開中間：VARIANCE 偏高——刻線插畫 ＋ 雙色 ＋ 標本標籤帶來明顯個性）。

### 暗色關卡（深色模式 token 一併定義，見 §4）
「夜間標本櫃」——**帶綠相的近黑底**（`#101A14`，非純黑）＋ **elevation 移色相不只移明度** ＋ **雙色**（墨綠 ＋ 朱紅 accent）＋ **層級靠文字色階**。三項齊備，放行。

---

## 3. 色彩系統（三層 token）

架構：`①reference 原始色階 → ②system 語意角色 → ③component 元件槽位`。
元件只引用 system，system 只引用 reference，**不准跨層、不准散落硬編值**。

### 品牌（雙色）
| 角色 | system token | 亮色 hex | 用途 |
|---|---|---|---|
| 主色 · 墨綠 | `--color-primary` | `#1B4530` | 品牌、主要按鈕、葉片刻線、盛開植物葉 |
| Accent · 朱紅 | `--color-accent` | `#C8431F` | 唯一的手工上色：花 / 果 / 澆水 CTA / focus ring |

### 語意狀態（各自不同色相，不一色多義）
| 角色 | token | hex | 語意 |
|---|---|---|---|
| 成功 · 茂盛 | `--color-success` | `#235539` | 完成、健康、達標 |
| 警示 · 芥黃 | `--color-warning` | `#BE8A2C` | 接近中斷、即將枯萎 |
| 危險 · 胭脂 | `--color-danger` | `#9E2B3F` | 破壞性操作（刪除）、錯誤（冷紅，與 accent 暖紅分色相） |
| 資訊 · 標本靛 | `--color-info` | `#3C5A73` | 中性提示 |

> 每個語意色都與 accent（朱紅）**不同色相或不同冷暖**，避免混淆。

### 生長階段語意色（映射植物插畫 ＋ 徽章）
| 階段 | token | hex | 非顏色的區辨線索 |
|---|---|---|---|
| 種子 seed | `--color-stage-seed` | `#6E7A6F`（灰綠） | 徽章圖示 `IconSeed` ＋ 文字「種子」 |
| 發芽 sprout | `--color-stage-sprout` | `#4E8767` | `IconSprout` ＋「發芽」＋ 子葉剪影 |
| 成長 growing | `--color-stage-growing` | `#235539` | `IconLeaf` ＋「成長」＋ 較高莖葉 |
| 盛開 blooming | `--color-stage-blooming` | `#C8431F` | `IconFlower` ＋「盛開」＋ **直立綻放**輪廓（葉仍深綠，只有花是朱紅） |
| 枯萎 withered | `--color-stage-withered` | `#7A5A44`（枯褐） | `IconWilt` ＋「枯萎」＋ **下垂斷莖 ＋ 掉落葉 ＋ 乾燥短線** |

> **可及性鐵則**：茂盛 / 枯萎**不只靠顏色**——每個階段一定同時有(圖示 ＋ 文字 ＋ 輪廓形狀)三重編碼；灰階下也能區辨。

### 中性 · 標本紙（冷調，非暖米白）
| 角色 | token | 亮色 hex |
|---|---|---|
| 畫布 | `--color-canvas` | `#FBFCF9` |
| 卡片面 | `--color-surface` | `#FFFFFF` |
| 抬升 / 凹陷 | `--color-raised` / `--color-sunken` | `#F4F6F1` / `#E9ECE3` |
| 文字 / 次要 / 更淡 | `--color-text` / `-muted` / `-faint` | `#17251C` / `#47554C` / `#6E7A6F` |
| 邊界 / 格線 | `--color-border` / `--color-grid` | `#D5DBCC` / 5% 墨綠 |

完整 50–950 reference 色階見 `src/design/tokens.css`。

---

## 4. 深色模式（夜間標本櫃）

同一組 system token，切 `:root[data-theme='dark']` 映射到 `--ref-night-*`：
- 底 `#101A14`（帶綠相近黑）→ surface `#16241B` → raised `#1D3025`：**elevation 移色相**。
- 文字色階 `#EAF0E7 / #A9B8AC / #7C8B7F` 扛層級。
- accent 提亮為 `--ref-verm-400 #DB5C36`、主色提亮為 `--ref-ink-300`，維持對比。
- 切換方式：`document.documentElement.setAttribute('data-theme', 'dark')`（見 StyleGuide 的 `useTheme`）。

---

## 5. 字體與排版

- `--font-sans`：`'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', system-ui…`——**CJK 現代黑體 web font，絕不 fallback 到新細明體/襯線**（破綻 #6）。
- `--font-display`：`'Fraunces', 'Noto Serif TC', Georgia, serif`——**只用於拉丁學名（italic）與大數字（tabular-nums）**，帶標本圖鑑氣質。
- **字級**：caption 12 / label 13 / sm 14 / base 16 / lg 18 / xl 22 / 2xl 28 / 3xl 36 / 4xl 48（1.25 modular）。角色 `display / heading / body / label / caption` 各有字重、行高、字距。
- **層級靠敢於弱化**：大數字（streak）大而自信、標籤小而精準；標本標籤大寫 ＋ `tracking 0.14em`。
- 數字密集處一律 `tabular-nums`。

---

## 6. 間距 / 形狀 / 陰影 / 動效 token

- **間距（4/8 基準）**：`2 4 8 12 16 24 32 48 64`。用節奏（區塊 > 群組 > 元素），不全站 16px。
- **圓角**：`sm 2 / md 4 / lg 6 / full 999`（full 只給 chip）。
- **陰影**：`raised`（1px 微陰影）/ `overlay`（卡片抬升）——**優先用邊框/分隔線表層級**，陰影克制。
- **動效**：`fast 120ms / base 200ms / slow 320ms`；easing `standard / decelerate / spring`。hover/focus ≤120ms、進場 ≤320ms。**尊重 `prefers-reduced-motion`**（全域退化為靜態）。

---

## 7. 圖示系統（house 刻線圖示集）

- **單一來源**：`src/design/icons.tsx`——自造的刻線圖示集（24 網格、`currentColor`、線重 `--icon-stroke: 1.75`、方形端點）。與植物插畫同一種筆觸。
- **嚴禁 emoji 當功能圖示**（導覽、狀態、按鈕）——舊骨架的 🌱 logo 已換成 `IconSprout`。
- 已備：leaf / droplet / sprout / sun / flower / wilt / seed / check / plus / x / pencil / trash / calendar / settings / chevron / alert / moon / book。

---

## 8. 生長階段視覺規格（植物元件）

- 元件：`<Plant type={PlantType} stage={GrowthStage} size grew />`（`src/design/plants/Plant.tsx`）。
- **5 種植物**（對齊 `types.ts` 的 `PlantType`）：向日葵 `sunflower` / 仙人掌 `cactus` / 小松盆栽 `bonsai` / 薰衣草 `lavender` / 蕨 `fern`。每種有不可誤認的剪影記號（花盤 / 棘刺 / 淺盆 / 花穗 / 捲芽）。
- **5 階段**：seed → sprout → growing → blooming → withered，接受 `stage` 參數渲染。
- **葉/莖用植物色**（盛開時葉仍深綠），**朱紅只上在花/果**——避免整株變紅。
- `grew` 觸發招牌「抽長」動效（打卡成長回饋，供 stage 3 使用）。
- 無障礙：`role="img"` ＋ `aria-label`（「向日葵・盛開階段」）；`decorative` 時退為 presentation。

---

## 9. 元件清單（primitives + 狀態）

`src/design/components.tsx`：
- **Button**：`default / primary / accent / ghost / danger`，`md/sm`，`iconOnly`。狀態齊全（hover 微抬 / active / disabled / focus-visible ring）。min 44px。
- **Card**：`interactive`（hover 抬升）/ `flush`。
- **SpecimenLabel**（招牌母題）：`No.` ＋ 名稱 ＋ 學名。
- **StageBadge**：色 ＋ 圖示 ＋ 文字三重編碼。
- **Stat**：大數字 ＋ 標籤（tabular-nums）。
- **Field / Input / Select**：label / hint / error（含 `aria-invalid` ＋ 錯誤圖示）。

`src/design/states.tsx`（每個都有實際插畫，非一行灰字）：
- **EmptyState**：空標本紙 ＋ 空盆 ＋ 待播種子插畫。
- **ErrorState**：翻倒的盆 ＋ 撒出的土（有情緒不苛責的文案）。
- **LoadingCard**：shimmer 骨架（維持版面穩定，非置中轉圈）。

---

## 10. 無障礙（WCAG 2.1 AA）

- 對比：正文 `#17251C` on 畫布 ≈ 15:1；墨綠 on 白 ≈ 10:1；朱紅 on 白 ≈ 4.9:1；白字 on 朱紅按鈕 ≈ 4.9:1——皆過 AA。
- 狀態不只靠顏色（階段 ＝ 色 ＋ 圖示 ＋ 文字 ＋ 形狀）。
- 所有互動元素可 focus、`:focus-visible` 有明顯 ring（`outline-offset 2px`）。
- 觸控目標 ≥ 44×44px。
- 尊重 `prefers-reduced-motion`。

---

## 11. 如何在程式碼中使用 token（不要散寫 magic value）

```tsx
// CSS：直接用語意變數
.thing { color: var(--color-primary); padding: var(--space-5); border-radius: var(--radius-md); }

// TS/React：從 tokens.ts 匯入語意 token（隨深/淺色自動切換）
import { token, stageMeta, plantMeta } from '@/design/tokens';
<div style={{ color: token.text, background: token.surface }} />

// 元件：一律用 design/ 下的 primitives 與 Plant，不自造配色
import { Button, Card, StageBadge } from '@/design/components';
import { Plant } from '@/design/plants/Plant';
```

### 檔案地圖
```
src/design/
  tokens.css        ①reference ②system（含深色）
  system.css        ③component token ＋ 基礎/元件 class ＋ 動效
  tokens.ts         程式化語意 token ＋ stageMeta / plantMeta
  icons.tsx         house 刻線圖示集（唯一來源）
  stage-visuals.ts  階段 → 圖示映射
  components.tsx     Button / Card / Field / Badge / Stat / SpecimenLabel
  states.tsx         EmptyState / ErrorState / LoadingCard ＋ 插畫
  plants/Plant.tsx   5 植物 × 5 階段刻線插畫
src/routes/StyleGuide.tsx   /design 展示頁
```

---

## 12. 邊界

本文件與 `src/design/` 只交付「設計系統 ＋ 可重用素材/元件」。花園總覽、新增習慣表單、詳情、Onboarding 等**功能畫面的組裝**屬後續 Dev stage（YUN-12 起），請直接取用本系統的 token 與元件，不要另造一套配色或植物美術。
