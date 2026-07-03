# 資料模型與領域邏輯

本文件描述 HabitGarden 的核心資料模型與判定邏輯。型別定義見
`src/types/index.ts`，JSON Schema 見 `docs/schema/*.schema.json`，兩者需保持一致。

## 為何以 JSON Schema 描述

MVP 階段資料存在瀏覽器 `localStorage`，但欄位刻意設計成可平移到真實資料庫：

- 使用字串 `id`（UUID 或等效唯一字串），不用陣列索引。
- 時間戳一律 ISO 8601 字串。
- 「一天」以本地日期字串 `YYYY-MM-DD` 為唯一鍵，避免直接比較 UTC 時間戳
  造成的跨時區 / 跨日錯誤。

## 實體

### Habit（習慣）

| 欄位 | 型別 | 說明 |
| --- | --- | --- |
| `id` | string | 唯一識別碼 |
| `name` | string | 習慣名稱（1–60 字） |
| `plant` | enum | 植物種類：`sunflower` / `cactus` / `bonsai` / `lavender` / `fern` |
| `reminder` | object | 提醒 / 期望頻率（見下） |
| `createdAt` | date-time | 建立時間 |
| `updatedAt` | date-time | 最後更新時間 |

`reminder` 為 tagged union：

- `{ "kind": "daily" }` — 每天都是「期望完成日」。
- `{ "kind": "weekly", "days": [1,3,5] }` — 只有指定星期是期望日（0=週日…6=週六）。

### CheckIn（打卡）

| 欄位 | 型別 | 說明 |
| --- | --- | --- |
| `id` | string | 唯一識別碼 |
| `habitId` | string | 所屬習慣 id |
| `date` | string | 本地日期 `YYYY-MM-DD` |
| `completed` | boolean | 該天是否完成 |
| `updatedAt` | date-time | 最後修改時間 |

同一個 `habitId` + `date` 最多一筆；切換完成狀態是覆寫而非新增。

## 持久化

- 儲存鍵：`habit-garden/v1`（`src/lib/storage.ts`）。
- 落地形狀：`{ schemaVersion, habits[], checkins[] }`，保留 `schemaVersion`
  以便未來遷移。
- 解析失敗會安全回退為空狀態，不讓 App 崩潰。
- 對外只透過 `HabitRepository`（`src/lib/repository.ts`）操作，UI 不直接碰
  儲存格式。

## 領域邏輯

### 期望完成日（expected day）

streak 與生長邏輯只計算「期望完成日」：

- `daily`：每一天。
- `weekly`：只有 `days` 內的星期；沒選的日子不影響計算。

### 連續天數 currentStreak

從今天往回走，遇到期望日檢查是否完成：

- 完成 → 累計 +1，繼續往回。
- 未完成且該日就是「今天」→ 視為尚未到期，跳過、不中斷、不計入。
- 未完成且該日在過去 → 中斷。

> 設計重點：今天還沒打卡，不會讓昨天累積的連續天數瞬間歸零。

### 錯過天數 missedStreak

只看已到期的日子（不含今天），從最近的過去期望日往回數連續未完成的長度，
用來判定枯萎。

### 最長連續 longestStreak

掃過所有已完成日期，回傳歷史最長區段。兩個相鄰完成日之間若「中間都不是
期望日」仍視為連續。

### 生長階段 GrowthStage

4 個正向階段依 `currentStreak` 升級，第 5 種為枯萎：

| 階段 | 條件（預設門檻） |
| --- | --- |
| `seed` 種子 | streak = 0 |
| `sprout` 發芽 | streak 1–2 |
| `growing` 成長 | streak 3–6 |
| `blooming` 盛開 | streak ≥ 7 |
| `withered` 枯萎 | `currentStreak = 0`（含今天也沒打卡）**且**連續錯過期望日 ≥ 3 |

門檻可透過 `GrowthConfig` 調整（見 `src/lib/growth.ts`）。

**枯萎不變量**：枯萎 ⇔ `currentStreak = 0`。依 PRD「清楚但不苛責、不粗暴歸零」的
語調，長期中斷後**今天一打卡就脫離枯萎**（`currentStreak` 變為 1），立刻回到
seed/sprout 起點重新長，不必等到下一個期望日。

### 中斷重啟不丟歷史

streak 一律由 checkins 即時計算，歷史 checkin 永不刪除。中斷後重新打卡時：

- `currentStreak` 從 0 重新累積；
- `longestStreak`、`totalCompleted` 與所有歷史紀錄保留。

此行為由 `growth.test.ts` 的「中斷後重新開始」案例明確覆蓋。
