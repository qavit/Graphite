import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { buildDiagramSpec, loadDocumentFromUnknown, readSvgFromSpec } from '../document';

const dir = path.resolve(__dirname, '../../../../../docs/stage-0/evidence');

describe('saved authoring document → exported SVG', () => {
  it('reproduces the SVG exported from the browser session byte-for-byte', () => {
    const doc = loadDocumentFromUnknown(JSON.parse(fs.readFileSync(path.join(dir, 'incline-friction-37.json'), 'utf8')));
    const svg = readSvgFromSpec(buildDiagramSpec(doc));
    expect(svg).toBe(fs.readFileSync(path.join(dir, 'incline-friction-37.svg'), 'utf8'));
    expect(svg).not.toMatch(/graphite-(hit|handle|selected)/);
  });
});
