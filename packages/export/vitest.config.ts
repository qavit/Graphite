import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@kakau/diagram-spec': resolve(__dirname, '../diagram-spec/src'),
      '@kakau/render-svg': resolve(__dirname, '../render-svg/src'),
      '@graphite/templates': resolve(__dirname, '../templates/src'),
      '@graphite/export': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000, // 匯出操作可能較慢
  },
});
