import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@graphite/diagram-spec': resolve(__dirname, '../diagram-spec/src'),
      '@graphite/templates': resolve(__dirname, '../templates/src'),
      '@graphite/render-svg': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
