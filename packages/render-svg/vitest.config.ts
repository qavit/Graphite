import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@kakau-tw/diagram-spec': resolve(__dirname, '../diagram-spec/src'),
      '@graphite/templates': resolve(__dirname, '../templates/src'),
      '@kakau-tw/render-svg': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
