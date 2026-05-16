# Agent Handoff Notes

### [2026-05-17] Codex -> All Agents
**主題**: Task 013 已完成實作 - Workbench UI 架構重構
**內容**:
- `apps/web` 已重構成三欄式工作台：左側模板庫、中間畫布、右側 inspector，頂部保留全域操作列、底部保留狀態列。
- 主要實作已拆成多個 workbench 模組：`reducer`、`storage`、`validation`，以及 `TopBar` / `TemplateLibrary` / `CanvasWorkspace` / `InspectorPanel` / `StatusBar`。
- 支援 locale 與 theme 切換、模板搜尋、canvas toolbar、IR JSON 編輯、SVG 預覽與驗證摘要；也保留了新文件、開啟 JSON、儲存 JSON、複製 / 下載 SVG 的動線。
- layout state 由 reducer 管理，`inspectorOpen` 可控制右側面板顯示；手機版會讓畫布優先出現在最前面。
- 已驗證 `npm run build` 與 `npm test`，並用瀏覽器檢查桌機與手機寬度，確認三欄 / 堆疊布局與主功能都能正常互動。
- 已提交 commit：`d5571bd feat(web): implement workbench shell refactor`。
- 目前 Task 013 已收尾，可直接往下一階段的模板與工作台細節推進。

### [2026-05-16] Codex -> All Agents
**主題**: Task 012 已完成 - 編輯器 UI 視覺美化
**內容**:
- `apps/web` 已重構為工作台式介面：左側模板選擇、模式切換、參數面板與匯出區，右側為較完整的預覽紙面。
- 支援三個模板入口：斜面受力、帶電粒子、簡單電路；電路模板已接上 5 個 preset，並可在 UI 中切換。
- 匯出動線先維持前端限定：SVG download 與 SVG copy；PNG/PDF 仍交由未來 Node / API 路徑處理。
- 目前 UI 入口集中在 `apps/web/src/App.tsx`，樣式獨立在 `apps/web/src/styles.css`，沒有拆成更多元件；後續若要繼續 polish，優先從這兩個檔案下手。
- 模板選單目前只接了 `inclined`、`particle`、`circuit` 三個入口；`circuit` 已透過 5 個 preset 對接 `simpleCircuit`。
- 已補上 responsive CSS、`vite-env.d.ts`、favicon 與瀏覽器驗證。
- `apps/web` 目前沒有獨立 UI tests；只有 workspace 層級的 `npm test` 與 `npm run build`。
- 驗證結果：`npm run build`、`npm test` 通過，且桌機 / 手機版面均已檢查。
- 若下一階段要做真正的 PDF / PNG 匯出入口，建議先補一個明確的 API / server bridge，再回到 UI 增加按鈕。
- 瀏覽器驗證已跑過桌機與手機寬度，未發現版面崩壞；後續新增元件時請維持這個檢查習慣。

### [2026-05-16] Claude -> All Agents
**主題**: Task 011 已完成 - 電路圖圖元庫與模板
**內容**:
- `diagram-spec`: 新增 `CircuitComponentType`（7 種元件）與 `CircuitComponentElement` 介面。
- `render-svg`: 新增 `CIRCUIT_HALF_WIDTH=25` 常數與 `renderCircuitComponent()` 函式，橫/直方向皆可渲染。
- `templates`: 建立 `simpleCircuit.ts`，含串聯/並聯佈局、5 個 presets、14 個測試（全通過）。
- 匯出已更新至 `packages/templates/src/index.ts`。
- **注意（已解決）**: `CIRCUIT_HALF_WIDTH` 已統一定義於 `packages/diagram-spec/src/constants.ts`，`render-svg` 和 `templates` 均 import 同一來源，無需手動同步。
- **後續步驟**:
    - Task 012 (UI 視覺美化) 可開始，建議由 UI Agent 負責。
    - 後續若要把電路模板加入 `apps/web` 選單，需在 UI 側新增對應入口。

### [2026-05-16] Gemini (Architect) -> All Agents
**主題**: Task 009 已完成 - 科學座標系基礎
**內容**:
- 已在 `packages/diagram-spec` 完成 `Grid`, `CoordinateAxis`, `FunctionCurve` 的型別定義。
- 已在 `packages/render-svg` 實作對應渲染邏輯（包括多元素渲染處理）。
- 已完成視覺驗證（透過 manual-coord.test.ts 產出並確認 SVG 拋物線圖形）。
- **後續步驟**：
    - 現在座標系地基已穩固，Task 010 (電磁學圖元) 可開始進行。
    - UI Agent 應考慮如何將此功能加入 `apps/web` 選單。

### [2026-05-17] Gemini -> All Agents
**主題**: 開始 Task 013 (Workbench Implementation)
**內容**:
- **目標**: 啟動 v0.2 工作台 UI 架構重構。
- **決策記錄**: 已更新 `docs/dev/team/DECISIONS.md` (ADR 008)，確立三欄式 UI 佈局。
- **目前進度**: 啟動 Task 013.1 (CSS Grid App Shell 重構)。
