# 習慣花園 HabitGarden 🌱

把「養成習慣」視覺化成「種植花園」的極簡網頁應用。純前端、無後端、無登入，
資料存在瀏覽器 `localStorage`。

> 這是 PRD（YUN-9）的 **Stage 1：技術地基**。本階段聚焦「資料模型 + 持久層 +
> 核心邏輯 + 路由骨架」，**不含**視覺設計、色票、植物美術與完整 UI（後續 stage 處理）。

## 技術選型

- **React + Vite + TypeScript** — 單頁前端應用，MVP 不需後端。
- **React Router** — 6 畫面路由。
- **Vitest** — 單元測試。

## 開發

```bash
npm install
npm run dev        # 本地開發伺服器
npm run build      # 型別檢查 + 打包
npm run preview    # 預覽打包結果
npm run test       # 執行單元測試
npm run lint       # ESLint
```

## 專案結構

```
src/
  types/            核心型別（資料契約，對應 docs/schema）
  lib/
    date.ts         與時區無關的日期工具
    storage.ts      localStorage 持久層（含版本欄位、安全回退）
    repository.ts   對外 CRUD API（HabitRepository）
    streak.ts       連續天數 / 錯過天數計算
    growth.ts       生長階段判定（evaluateHabit 為領域入口）
    id.ts           唯一 id 產生
    useRepository.ts  React context hook
    __tests__/      單元測試
  routes/           6 畫面（骨架佔位）
  router.tsx        路由設定
  AppLayout.tsx     共用外框 + 導覽
docs/
  data-model.md     資料模型與領域邏輯說明
  schema/           habit / checkin 的 JSON Schema
```

## 資料模型與邏輯

完整說明見 [`docs/data-model.md`](docs/data-model.md)。重點：

- `habit` / `checkin` 以 JSON Schema 描述，欄位可平移到真實資料庫。
- 「一天」以本地日期 `YYYY-MM-DD` 為鍵，避免跨時區錯誤。
- 生長階段：種子 → 發芽 → 成長 → 盛開，第 5 種狀態枯萎（連續中斷觸發）。
- 中斷後重新開始只重置當前連續天數，**不刪除任何歷史紀錄**。

## 6 畫面路由

| 路徑 | 畫面 |
| --- | --- |
| `/onboarding` | 首次引導 |
| `/` | 花園總覽（首頁） |
| `/habits/new`、`/habits/:id/edit` | 新增 / 編輯習慣 |
| `/habits/:id` | 習慣詳情 |
| `/settings` | 設定 |
| `/empty` | 空狀態 |

各畫面內容目前為佔位，供後續 stage 疊上實際設計。
