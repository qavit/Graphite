/**
 * Golden Figure Tester
 * Visual regression testing for SVG diagrams
 *
 * 用途：確保 DiagramSpec -> SVG 的輸出保持一致性
 * 對比黃金 SVG 文件和新渲染的結果
 */

import fs from 'fs';
import path from 'path';

export interface GoldenTestResult {
  passed: boolean;
  fixtureId: string;
  message: string;
  goldenPath?: string;
  diffLines?: number;
}

/**
 * 規範化 SVG 字串以便比較
 * - 移除多餘空白
 * - 移除換行符（保留邏輯結構）
 * - 規範化屬性順序
 */
export function normalizeSVG(svg: string): string {
  return svg
    .replace(/\s+/g, ' ')
    .replace(/\s+([</>])/g, '$1')
    .replace(/([</>])\s+/g, '$1')
    .trim();
}

/**
 * 比較兩個 SVG 字串
 * 使用規範化形式進行比較以忽略格式差異
 */
export function compareSVG(actual: string, expected: string): {
  match: boolean;
  actualNorm: string;
  expectedNorm: string;
} {
  const actualNorm = normalizeSVG(actual);
  const expectedNorm = normalizeSVG(expected);

  return {
    match: actualNorm === expectedNorm,
    actualNorm,
    expectedNorm,
  };
}

/**
 * 計算簡單的行編輯距離（Levenshtein distance）
 * 用於估計 SVG 差異程度
 */
export function computeDifference(actual: string, expected: string): number {
  const actualLines = actual.split('\n');
  const expectedLines = expected.split('\n');

  // 簡單的行差異計數
  let differences = 0;
  const maxLen = Math.max(actualLines.length, expectedLines.length);

  for (let i = 0; i < maxLen; i++) {
    if ((actualLines[i] || '') !== (expectedLines[i] || '')) {
      differences++;
    }
  }

  return differences;
}

/**
 * 保存黃金 SVG 文件
 */
export function saveGoldenFile(
  fixtureId: string,
  svg: string,
  goldenDir: string = __dirname + '/__fixtures__'
): string {
  if (!fs.existsSync(goldenDir)) {
    fs.mkdirSync(goldenDir, { recursive: true });
  }

  const goldenPath = path.join(goldenDir, `${fixtureId}.svg`);
  fs.writeFileSync(goldenPath, svg, 'utf-8');

  return goldenPath;
}

/**
 * 加載黃金 SVG 文件
 */
export function loadGoldenFile(
  fixtureId: string,
  goldenDir: string = __dirname + '/__fixtures__'
): string | null {
  const goldenPath = path.join(goldenDir, `${fixtureId}.svg`);

  if (!fs.existsSync(goldenPath)) {
    return null;
  }

  return fs.readFileSync(goldenPath, 'utf-8');
}

/**
 * 驗證 SVG 與黃金文件
 * 如果黃金文件不存在且 updateGolden=true，則建立它
 */
export function validateAgainstGolden(
  fixtureId: string,
  actualSVG: string,
  goldenDir: string = __dirname + '/__fixtures__',
  options: { updateGolden?: boolean } = {}
): GoldenTestResult {
  const golden = loadGoldenFile(fixtureId, goldenDir);

  if (options.updateGolden) {
    const goldenPath = saveGoldenFile(fixtureId, actualSVG, goldenDir);
    return {
      passed: true,
      fixtureId,
      message: golden ? `✅ Golden file updated: ${goldenPath}` : `Golden file created: ${goldenPath}`,
      goldenPath,
    };
  }

  if (!golden) {
    return {
      passed: false,
      fixtureId,
      message: `Golden file not found for "${fixtureId}". Create with UPDATE_GOLDEN=true.`,
    };
  }

  const { match, actualNorm, expectedNorm } = compareSVG(actualSVG, golden);

  if (match) {
    return {
      passed: true,
      fixtureId,
      message: `✅ Matches golden file`,
      goldenPath: path.join(goldenDir, `${fixtureId}.svg`),
    };
  }

  // 計算差異
  const diffLines = computeDifference(actualNorm, expectedNorm);

  return {
    passed: false,
    fixtureId,
    message: `❌ SVG differs from golden file (${diffLines} lines different)`,
    goldenPath: path.join(goldenDir, `${fixtureId}.svg`),
    diffLines,
  };
}

/**
 * 批量驗證多個 SVG 與黃金文件
 */
export function validateMultiple(
  diagrams: Array<{ id: string; svg: string }>,
  goldenDir: string = __dirname + '/__fixtures__',
  options: { updateGolden?: boolean } = {}
): GoldenTestResult[] {
  return diagrams.map(({ id, svg }) =>
    validateAgainstGolden(id, svg, goldenDir, options)
  );
}

/**
 * 生成測試報告
 */
export function generateReport(results: GoldenTestResult[]): string {
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  const lines = [
    `\n${'='.repeat(60)}`,
    `Golden Figure Test Report`,
    `${'='.repeat(60)}`,
    `Total: ${total} | Passed: ${passed} ✅ | Failed: ${failed} ❌`,
    `${'='.repeat(60)}\n`,
  ];

  results.forEach(result => {
    if (result.passed) {
      lines.push(`✅ ${result.fixtureId}`);
    } else {
      lines.push(`❌ ${result.fixtureId}`);
      lines.push(`   ${result.message}`);
      if (result.diffLines) {
        lines.push(`   Differences: ${result.diffLines} lines`);
      }
    }
  });

  lines.push(`\n${'='.repeat(60)}\n`);

  return lines.join('\n');
}
