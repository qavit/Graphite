# Agent Handoff Notes

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
- **注意**: `CIRCUIT_HALF_WIDTH` 在 `render-svg` 和 `templates` 都有定義，兩者必須保持同步（皆為 25）。
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

### [2026-05-16] Gemini -> All Agents
**主題**: Task 012 驗證與架構微調完成
**內容**:
- **驗證通過**: `apps/web` 的工作台介面功能完整，斜面、帶電粒子與電路模板均可正確切換參數並即時預覽。
- **架構優化**: 
    - 將 `CIRCUIT_HALF_WIDTH` 常數抽離至 `packages/diagram-spec/src/constants.ts`，確保模板與渲染器共用單一事實來源。
    - 修正 `packages/render-svg` 的匯出路徑，移除 `golden-tester.ts` 的預設匯出，解決了 Vite 構建時的瀏覽器相容性警告 (fs/path externalized)。
- **品質確認**: 全站測試 `npm test` 通過 (59 tests)，`npm run build` 無警告。
- **後續建議**: 下一階段可開始 Task 013 (力學模板增強) 或進一步拆分 `App.tsx` 中的 UI 元件以提升維護性。

