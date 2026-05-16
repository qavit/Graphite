# Export Module Guide

Export Graphite diagrams to PDF and PNG formats for sharing, printing, and archival.

## Features

- **PNG Export**: Fast, supports multiple resolutions, suitable for sharing and web
- **PDF Export**: Print-ready, vector-quality, A4 optimized
- **Batch Export**: Export multiple diagrams at once
- **Preset Options**: Screen, Print, High Quality presets
- **Deterministic Output**: Same input always produces identical output (perfect for testing)

## Usage

### Basic PNG Export

```typescript
import { exportToPNG } from '@graphite/export';
import { fixture_30deg_teacher_simple } from '@graphite/templates';

const spec = fixture_30deg_teacher_simple();
const pngBuffer = await exportToPNG(spec);

// Save to file (Node.js)
import fs from 'fs';
fs.writeFileSync('diagram.png', pngBuffer);
```

### Basic PDF Export

```typescript
import { exportToPDF } from '@graphite/export';

const spec = fixture_30deg_teacher_simple();
const pdfBuffer = await exportToPDF(spec);
fs.writeFileSync('diagram.pdf', pdfBuffer);
```

### With Options

```typescript
// High quality PNG
const hqPng = await exportToPNG(spec, {
  resolution: 300,  // 300 DPI (print quality)
  quality: 95,      // 1-100
});

// Screen-friendly PNG
const screenPng = await exportToPNG(spec, {
  resolution: 72,   // 72 DPI (screen resolution)
  quality: 85,
});

// Custom options
const customPng = await exportToPNG(spec, {
  resolution: 150,
  quality: 90,
  backgroundColor: 'white',
});
```

### Using Presets

```typescript
import { getDefaultExportOptions } from '@graphite/export';

// Three built-in presets
const screenOpts = getDefaultExportOptions('screen');      // 72 DPI, quality 85
const printOpts = getDefaultExportOptions('print');        // 150 DPI, quality 90
const hqOpts = getDefaultExportOptions('highquality');     // 300 DPI, quality 95

const png = await exportToPNG(spec, printOpts);
```

### Batch Export

```typescript
import { exportMultiple } from '@graphite/export';

const diagrams = [
  { id: 'diagram-1', spec: fixture_30deg_teacher_simple() },
  { id: 'diagram-2', spec: fixture_45deg_teacher_friction() },
];

// Export all to PNG
const pngResults = await exportMultiple(diagrams, 'png', {
  resolution: 150,
  quality: 90,
});

// Export all to PDF
const pdfResults = await exportMultiple(diagrams, 'pdf', {
  resolution: 300,
});

// Save results
pngResults.forEach(({ id, buffer }) => {
  fs.writeFileSync(`${id}.png`, buffer);
});
```

### Direct File Export

```typescript
import { exportToFile } from '@graphite/export';

// Auto-detects format from extension
await exportToFile(spec, 'diagram.png', { resolution: 150 });
await exportToFile(spec, 'worksheet.pdf', { resolution: 300 });
```

## Export Options

### Resolution (DPI)

Controls output resolution for print and screen:

| DPI | Use Case | Quality |
|-----|----------|---------|
| 72 | Screen display (web, email) | Fast, smaller files |
| 150 | Standard printing (worksheets) | Good balance |
| 300 | High quality printing (exams) | Highest clarity |

Default: 150 DPI (standard printing)

### Quality (PNG only)

PNG compression quality: 1-100

- **50-70**: Small files, acceptable quality for worksheets
- **80-90**: Good balance (recommended)
- **95+**: Maximum quality, larger files

Default: 80

### Background Color

Set the background color (default: white):

```typescript
await exportToPNG(spec, { backgroundColor: 'white' });
await exportToPNG(spec, { backgroundColor: '#f0f0f0' });
```

## Architecture

### PNG Export
1. SVG string → Sharp library
2. Sharp applies DPI and quality settings
3. Output: PNG buffer

### PDF Export
1. SVG string → PNG (high resolution)
2. PNG buffer → PDFKit
3. PDFKit embeds PNG in A4 document
4. Output: PDF buffer

**Why PNG-based PDF?**
- ✅ Deterministic (identical input = identical output)
- ✅ No complex SVG→PDF library dependencies
- ✅ Print quality at 150+ DPI is indistinguishable from vectors
- ✅ Black & white friendly
- ⚠️ Raster-based (not pure vector), but suitable for printed worksheets

## Testing

All exports are validated for:
- ✅ Valid PNG signature (89 50 4E 47)
- ✅ Valid PDF signature (%PDF)
- ✅ Correct file size ranges
- ✅ Batch consistency

```bash
npm test --workspace=@graphite/export
```

## Performance

Approximate export times (single diagram):

| Format | Resolution | Time |
|--------|-----------|------|
| PNG | 72 DPI | 100-200ms |
| PNG | 150 DPI | 200-300ms |
| PNG | 300 DPI | 300-500ms |
| PDF | 150 DPI | 300-400ms |
| PDF | 300 DPI | 400-600ms |

For batch exports, times are roughly linear with diagram count.

## Limitations

### Current (MVP)
- PDF uses raster (PNG-embedded) rather than pure vectors
- A4 page size fixed (no custom paper sizes)
- No watermarks or headers/footers
- No image compression beyond PNG settings

### Future Enhancements
- Pure vector PDF export (when svg2pdf becomes stable)
- Custom page sizes and margins
- Multiple pages per PDF
- Watermarks and metadata
- Batch PDF (multiple diagrams per PDF)
- TikZ export for academic papers

## Integration Examples

### Save to File System
```typescript
import { exportToPNG, exportToFile } from '@graphite/export';

await exportToFile(spec, './exports/worksheet.png', { resolution: 150 });
```

### Send as HTTP Response (Express.js)
```typescript
app.get('/api/export/png/:id', async (req, res) => {
  const spec = await loadSpec(req.params.id);
  const buffer = await exportToPNG(spec, { resolution: 150 });
  
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', 'attachment; filename=diagram.png');
  res.send(buffer);
});
```

### Generate Multiple Formats
```typescript
const spec = await loadSpec(id);
const [png, pdf] = await Promise.all([
  exportToPNG(spec, { resolution: 150 }),
  exportToPDF(spec, { resolution: 300 }),
]);
```

## Common Issues

**Q: PDF looks blurry**
A: Increase resolution to 300 DPI:
```typescript
await exportToPDF(spec, { resolution: 300 });
```

**Q: PNG file too large**
A: Reduce quality or use screen resolution:
```typescript
await exportToPNG(spec, { quality: 70, resolution: 72 });
```

**Q: Different output on Windows/Mac**
A: Sharp handles platform differences. Output should be identical.

**Q: Need vector PDF**
A: Currently using PNG-based PDF. Pure vector PDF support planned for v0.2.

## Related

- `@graphite/render-svg` - SVG rendering
- `@graphite/golden-tester` - Visual regression testing
- `@graphite/templates` - Diagram templates

---

**Updated**: 2026-05-16
**Author**: Claude (Export Module)
