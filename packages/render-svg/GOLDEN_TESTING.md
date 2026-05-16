# Golden Figure Testing

此文檔說明如何使用視覺迴歸測試（Golden Figure Testing）來驗證 SVG 輸出的一致性。

## 概念

**Golden Figure** 是一個保存的參考 SVG 文件，代表 DiagramSpec 的「預期正確」的渲染結果。

測試流程：
1. 根據 DiagramSpec 渲染新的 SVG
2. 與保存的黃金 SVG 進行比較
3. 如果相同 → ✅ 通過
4. 如果不同 → ❌ 失敗（可能是有意的變化或是 bug）

## 核心工具

### `renderToSVG(spec: DiagramSpec): string`

將 DiagramSpec 轉換為 SVG 字串。

```typescript
import { renderToSVG } from '@graphite/render-svg';
import { fixture_30deg_teacher_simple } from '@graphite/templates';

const spec = fixture_30deg_teacher_simple();
const svg = renderToSVG(spec);
console.log(svg);  // <svg>...</svg>
```

### `validateAgainstGolden(fixtureId, actualSVG, goldenDir, options)`

驗證 SVG 是否與黃金文件匹配。

**參數**：
- `fixtureId`: 黃金文件的 ID（不含 .svg 副檔名）
- `actualSVG`: 實際的 SVG 字串
- `goldenDir`: 黃金文件目錄（預設：`__fixtures__`）
- `options.updateGolden`: 是否更新黃金文件（預設：false）

**返回**：
```typescript
{
  passed: boolean;
  fixtureId: string;
  message: string;
  goldenPath?: string;
  diffLines?: number;
}
```

**用法**：
```typescript
import { validateAgainstGolden } from '@graphite/render-svg';

const result = validateAgainstGolden('30deg-teacher-simple', svg);
expect(result.passed).toBe(true);
```

### `validateMultiple(diagrams, goldenDir, options)`

批量驗證多個 SVG。

```typescript
const results = validateMultiple([
  { id: 'test-1', svg: svg1 },
  { id: 'test-2', svg: svg2 },
]);

console.log(generateReport(results));
```

### `generateReport(results): string`

生成易於閱讀的測試報告。

```
============================================================
Golden Figure Test Report
============================================================
Total: 5 | Passed: 5 ✅ | Failed: 0 ❌
============================================================

✅ 30deg-teacher-simple
✅ 45deg-teacher-friction
✅ 30deg-student-blank
✅ 60deg-teacher-simple
✅ 30deg-minimal

============================================================
```

## 常用命令

### 生成或更新黃金文件

當加入新的測試或意圖修改 SVG 輸出時，需要更新黃金文件：

```bash
UPDATE_GOLDEN=true npm test --workspace=@graphite/render-svg
```

此命令會：
1. 執行所有測試
2. 對於不存在的黃金文件，建立新的
3. 對於存在的黃金文件，保持不變（不自動覆蓋）

### 驗證黃金文件

運行正常測試，確保所有 SVG 都符合預期：

```bash
npm test --workspace=@graphite/render-svg
```

成功輸出：
```
Test Files  2 passed (2)
Tests  22 passed (22)
```

失敗輸出：
```
❌ 30deg-teacher-simple
   SVG differs from golden file (5 lines different)
```

## 文件結構

```
packages/render-svg/
├── src/
│   ├── renderer.ts              # SVG 渲染器
│   ├── golden-tester.ts         # 黃金文件測試工具
│   ├── __fixtures__/            # 黃金文件目錄
│   │   ├── 30deg-teacher-simple.svg
│   │   ├── 45deg-teacher-friction.svg
│   │   ├── 30deg-student-blank.svg
│   │   ├── 60deg-teacher-simple.svg
│   │   └── 30deg-minimal.svg
│   └── __tests__/
│       └── golden.test.ts       # 黃金文件測試
└── GOLDEN_TESTING.md            # 本文件
```

## 工作流程

### 新增範本時

1. 在 `packages/templates/` 中建立新的範本函數
2. 添加 fixtures（黃金示例）
3. 添加到 `packages/render-svg/__tests__/golden.test.ts`
4. 運行 `UPDATE_GOLDEN=true npm test --workspace=@graphite/render-svg` 生成黃金文件
5. 審查生成的 SVG 是否符合預期
6. 提交黃金文件到版本控制

### 修改渲染器時

1. 修改 `renderer.ts`
2. 運行測試：`npm test --workspace=@graphite/render-svg`
3. 如果有意的修改，運行 `UPDATE_GOLDEN=true npm test` 更新黃金文件
4. 審查變更
5. 提交

### 修改現有範本時

1. 修改範本參數或邏輯
2. 運行測試看是否導致 SVG 變化
3. 如果是有意的，更新黃金文件
4. 提交

## SVG 比較邏輯

黃金測試使用 **規範化比較** 來忽略格式差異：

```typescript
// 這些被視為相同：
'<line x1="0" y1="0" />'
'<line x1="0"  y1="0" />'
'<line\n  x1="0"\n  y1="0"\n/>'
```

規範化過程：
1. 移除多餘的空白和換行
2. 規範化屬性之間的空格
3. 逐字符比較

## 最佳實踐

- ✅ 提交黃金 SVG 文件到版本控制
- ✅ 定期審查黃金文件變更
- ✅ 當修改渲染邏輯時，記錄為什麼需要更新黃金文件
- ❌ 不要盲目地 `UPDATE_GOLDEN=true` 而不審查
- ❌ 不要修改已保存的黃金 SVG 文件（除非通過測試）

## 故障排除

### Q: 「Golden file not found」

**A**: 首先運行 `UPDATE_GOLDEN=true npm test` 生成黃金文件。

### Q: 「SVG differs from golden file」

**A**: 有三種情況：
1. 你修改了渲染邏輯，需要更新黃金文件
2. 你修改了範本，導致 SVG 變化
3. 代碼中有 bug

檢查變更，如果是有意的，運行 `UPDATE_GOLDEN=true npm test` 更新。

### Q: 為什麼使用規範化比較而不是像素比較？

**A**: 規範化比較優勢：
- SVG 是文本，不需要像素級精度
- 格式變化（空白、換行）不影響視覺結果
- 更容易 diff 和版本控制
- 更快速，不需要圖像庫

## 擴展

### 添加新的比較策略

如果需要不同的比較邏輯，可以在 `golden-tester.ts` 中擴展：

```typescript
export function compareWithTolerance(actual: string, expected: string, tolerance: number) {
  // 自定義比較邏輯
}
```

### 集成圖像比較

未來可以添加像素級比較（需要 sharp 或類似庫）：

```typescript
export async function compareImages(actualPNG: Buffer, expectedPNG: Buffer) {
  // 像素級比較
}
```

---

**更新日期**: 2026-05-16
**作者**: Claude (Renderer Testing)
