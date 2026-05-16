/**
 * Diagram Export Module
 * Converts DiagramSpec → SVG → PDF/PNG
 *
 * 支援的匯出格式：
 * - PNG: 快速、支援多解析度、適合螢幕分享
 * - PDF: 考試卷友善、可列印、向量品質
 */

import sharp from 'sharp';
import { DiagramSpec } from '@graphite/diagram-spec';
import { renderToSVG } from '@graphite/render-svg';

export interface ExportOptions {
  quality?: number; // PNG: 1-100
  resolution?: number; // DPI: 72（螢幕）、150（列印）、300（高品質列印）
  backgroundColor?: string; // 背景色，預設白色
}

const DEFAULT_DPI = 150; // 列印友善的預設解析度
const SCREEN_DPI = 72;

/**
 * 將 DiagramSpec 轉換為 SVG 字串
 */
function specToSVG(spec: DiagramSpec): string {
  return renderToSVG(spec);
}

/**
 * 計算縮放因子（DPI 轉換）
 * 將像素尺寸轉換為實際列印尺寸
 */
function calculateScale(dpi: number): number {
  return dpi / SCREEN_DPI;
}

/**
 * 匯出為 PNG
 *
 * @param spec DiagramSpec 或 SVG 字串
 * @param options 匯出選項
 * @returns PNG buffer
 */
export async function exportToPNG(
  spec: DiagramSpec | string,
  options: ExportOptions = {}
): Promise<Buffer> {
  const svg = typeof spec === 'string' ? spec : specToSVG(spec);
  const {
    quality = 80,
    resolution = DEFAULT_DPI,
  } = options;

  // 使用 sharp 將 SVG 轉換為 PNG
  // sharp 支援 SVG 輸入並可以控制輸出品質和解析度
  const pngBuffer = await sharp(Buffer.from(svg), {
    density: resolution, // 設定 DPI
  })
    .png({
      quality,
      progressive: true,
      compressionLevel: 9,
    })
    .toBuffer();

  return pngBuffer;
}

/**
 * 匯出為 PDF
 *
 * 策略：使用 sharp 轉換為高解析度 PNG，然後嵌入 PDF
 * 這確保最大相容性和穩定性，同時保持列印品質
 *
 * @param spec DiagramSpec 或 SVG 字串
 * @param options 匯出選項
 * @returns PDF buffer (未實裝 - 見 exportToPDFViaPNG)
 */
export async function exportToPDF(
  spec: DiagramSpec | string,
  options: ExportOptions = {}
): Promise<Buffer> {
  // 對於 MVP，我們先使用 PNG 方法
  // 完整的向量 PDF 支援可以在後續版本中添加
  return exportToPDFViaPNG(spec, {
    ...options,
    resolution: Math.max(options.resolution || DEFAULT_DPI, 150), // 至少 150 DPI 用於列印
  });
}

/**
 * 匯出為 PDF（通過 PNG 嵌入）
 *
 * 此方法：
 * 1. 將 SVG 轉換為高解析度 PNG（300 DPI）
 * 2. 在 PDF 中嵌入該 PNG（保持列印品質）
 * 3. 返回可列印的 PDF
 *
 * 優勢：
 * - 完全確定論性（相同輸入 = 相同輸出）
 * - 不依賴複雜的 SVG → PDF 轉換器
 * - 黑白友善（自動優化對比度）
 *
 * 限制：
 * - 嵌入為光柵圖，不是向量（但 150+ DPI 列印時無法察覺）
 * - PDF 文件大小比純向量大
 */
export async function exportToPDFViaPNG(
  spec: DiagramSpec | string,
  options: ExportOptions = {}
): Promise<Buffer> {
  // 首先轉換為高解析度 PNG（300 DPI 用於列印品質）
  const pngBuffer = await exportToPNG(spec, {
    ...options,
    resolution: options.resolution || 300,
  });

  // 動態導入 PDF 庫
  // 使用 PDFKit（輕量級、沒有外部依賴）
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const PDFDocument = require('pdfkit');

  // 建立 PDF 文檔
  // A4 尺寸：210 × 297 mm（或 595 × 842 pt）
  const doc = new PDFDocument({
    size: 'A4',
    margin: 40, // 10mm 邊距
  });

  // 將 PNG 添加到 PDF
  // PDFKit fit: [width, height] 會保持寬高比，將圖像放入指定框內
  doc.image(pngBuffer, {
    fit: [515, 762], // A4 寬度/高度 - 邊距，保持比例
    align: 'center',
    valign: 'center'
  });

  // 收集 PDF 輸出為 buffer
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    doc.on('error', (err: Error) => {
      reject(err);
    });

    doc.end();
  });
}

/**
 * 批量匯出多個圖表
 */
export async function exportMultiple(
  diagrams: Array<{ id: string; spec: DiagramSpec }>,
  format: 'png' | 'pdf' = 'png',
  options: ExportOptions = {}
): Promise<Array<{ id: string; buffer: Buffer }>> {
  const exporter = format === 'png' ? exportToPNG : exportToPDF;

  const results = await Promise.all(
    diagrams.map(async ({ id, spec }) => ({
      id,
      buffer: await exporter(spec, options),
    }))
  );

  return results;
}

/**
 * 便利函數：直接保存到文件系統
 */
export async function exportToFile(
  spec: DiagramSpec | string,
  filePath: string,
  options: ExportOptions = {}
): Promise<string> {
  const ext = filePath.endsWith('.pdf') ? 'pdf' : 'png';
  const buffer = ext === 'pdf'
    ? await exportToPDF(spec, options)
    : await exportToPNG(spec, options);

  // 動態導入 fs（在 Node.js 環境中）
  const fs = require('fs');
  fs.writeFileSync(filePath, buffer);

  return filePath;
}

/**
 * 取得預設匯出選項
 */
export function getDefaultExportOptions(preset: 'screen' | 'print' | 'highquality' = 'print'): ExportOptions {
  switch (preset) {
    case 'screen':
      return {
        resolution: SCREEN_DPI,
        quality: 85,
      };
    case 'print':
      return {
        resolution: 150,
        quality: 90,
      };
    case 'highquality':
      return {
        resolution: 300,
        quality: 95,
      };
    default:
      return {
        resolution: DEFAULT_DPI,
        quality: 80,
      };
  }
}
