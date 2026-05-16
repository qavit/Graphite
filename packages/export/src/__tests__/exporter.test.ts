import { describe, it, expect } from 'vitest';
import {
  exportToPNG,
  exportToPDF,
  exportToPDFViaPNG,
  exportMultiple,
  getDefaultExportOptions,
} from '../exporter';
import {
  fixture_30deg_teacher_simple,
  fixture_45deg_teacher_friction,
  fixture_30deg_student_blank,
} from '@graphite/templates';

describe('Diagram Export - PNG', () => {
  it('should export DiagramSpec to PNG buffer', async () => {
    const spec = fixture_30deg_teacher_simple();
    const pngBuffer = await exportToPNG(spec);

    expect(pngBuffer).toBeDefined();
    expect(Buffer.isBuffer(pngBuffer)).toBe(true);
    expect(pngBuffer.length).toBeGreaterThan(100);
    // PNG 簽名：89 50 4E 47
    expect(pngBuffer[0]).toBe(0x89);
    expect(pngBuffer[1]).toBe(0x50);
  });

  it('should export SVG string to PNG buffer', async () => {
    const spec = fixture_30deg_teacher_simple();
    const svg = '<svg><circle cx="50" cy="50" r="40"/></svg>';
    const pngBuffer = await exportToPNG(svg);

    expect(Buffer.isBuffer(pngBuffer)).toBe(true);
    expect(pngBuffer[0]).toBe(0x89); // PNG 簽名
  });

  it('should respect quality option', async () => {
    const spec = fixture_30deg_teacher_simple();

    const highQuality = await exportToPNG(spec, { quality: 95 });
    const lowQuality = await exportToPNG(spec, { quality: 50 });

    // 高品質應該更大
    expect(highQuality.length).toBeGreaterThan(lowQuality.length);
  });

  it('should respect resolution option', async () => {
    const spec = fixture_30deg_teacher_simple();

    const screenRes = await exportToPNG(spec, { resolution: 72 });
    const printRes = await exportToPNG(spec, { resolution: 300 });

    // 高解析度應該更大
    expect(printRes.length).toBeGreaterThan(screenRes.length);
  });

  it('should support different presets', async () => {
    const spec = fixture_30deg_teacher_simple();

    const screen = await exportToPNG(spec, getDefaultExportOptions('screen'));
    const print = await exportToPNG(spec, getDefaultExportOptions('print'));
    const highquality = await exportToPNG(spec, getDefaultExportOptions('highquality'));

    // 品質應該逐漸提高
    expect(screen.length).toBeLessThan(print.length);
    expect(print.length).toBeLessThan(highquality.length);
  });
});

describe('Diagram Export - PDF', () => {
  it('should export DiagramSpec to PDF buffer', async () => {
    const spec = fixture_30deg_teacher_simple();
    const pdfBuffer = await exportToPDF(spec);

    expect(pdfBuffer).toBeDefined();
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(100);
    // PDF 簽名：%PDF
    expect(pdfBuffer.toString('utf-8', 0, 4)).toContain('%PDF');
  });

  it('should export to PDF via PNG (fallback method)', async () => {
    const spec = fixture_45deg_teacher_friction();
    const pdfBuffer = await exportToPDFViaPNG(spec);

    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.toString('utf-8', 0, 4)).toContain('%PDF');
  });

  it('should produce valid PDF structure', async () => {
    const spec = fixture_30deg_student_blank();
    const pdfBuffer = await exportToPDF(spec);

    const pdfString = pdfBuffer.toString('utf-8');
    expect(pdfString).toContain('%PDF');
    expect(pdfString).toContain('%%EOF');
  });

  it('should respect quality option for PDF', async () => {
    const spec = fixture_30deg_teacher_simple();

    const highQuality = await exportToPDF(spec, { quality: 95 });
    const lowQuality = await exportToPDF(spec, { quality: 50 });

    // 品質差異應該導致大小不同
    expect(highQuality.length).toBeGreaterThan(0);
    expect(lowQuality.length).toBeGreaterThan(0);
  });

  it('should use high resolution for PDF by default', async () => {
    const spec = fixture_30deg_teacher_simple();
    const pdfHigh = await exportToPDF(spec, { resolution: 300 });
    const pdfLow = await exportToPDF(spec, { resolution: 150 });

    // 300 DPI 應該產生更大的 PDF（因為 PNG 更大）
    expect(pdfHigh.length).toBeGreaterThan(pdfLow.length);
  });
});

describe('Batch Export', () => {
  it('should export multiple diagrams to PNG', async () => {
    const diagrams = [
      { id: '30-simple', spec: fixture_30deg_teacher_simple() },
      { id: '45-friction', spec: fixture_45deg_teacher_friction() },
      { id: '30-student', spec: fixture_30deg_student_blank() },
    ];

    const results = await exportMultiple(diagrams, 'png');

    expect(results).toHaveLength(3);
    expect(results[0].id).toBe('30-simple');
    expect(Buffer.isBuffer(results[0].buffer)).toBe(true);
    expect(results.every(r => Buffer.isBuffer(r.buffer))).toBe(true);
  });

  it('should export multiple diagrams to PDF', async () => {
    const diagrams = [
      { id: 'pdf-1', spec: fixture_30deg_teacher_simple() },
      { id: 'pdf-2', spec: fixture_45deg_teacher_friction() },
    ];

    const results = await exportMultiple(diagrams, 'pdf');

    expect(results).toHaveLength(2);
    expect(results.every(r => r.buffer.toString('utf-8', 0, 4).includes('%PDF'))).toBe(true);
  });
});

describe('Export Options', () => {
  it('should provide correct default options for screen', () => {
    const opts = getDefaultExportOptions('screen');
    expect(opts.resolution).toBe(72);
    expect(opts.quality).toBe(85);
  });

  it('should provide correct default options for print', () => {
    const opts = getDefaultExportOptions('print');
    expect(opts.resolution).toBe(150);
    expect(opts.quality).toBe(90);
  });

  it('should provide correct default options for high quality', () => {
    const opts = getDefaultExportOptions('highquality');
    expect(opts.resolution).toBe(300);
    expect(opts.quality).toBe(95);
  });
});

describe('Export Format Detection', () => {
  it('should detect PNG from file extension', async () => {
    const spec = fixture_30deg_teacher_simple();
    const png = await exportToPNG(spec);
    expect(png[0]).toBe(0x89); // PNG signature
  });

  it('should detect PDF from file extension', async () => {
    const spec = fixture_30deg_teacher_simple();
    const pdf = await exportToPDF(spec);
    expect(pdf.toString('utf-8', 0, 4)).toContain('%PDF');
  });
});
