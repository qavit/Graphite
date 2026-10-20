import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@kakau-tw/diagram-spec': resolve(__dirname, '../diagram-spec/src'),
      '@graphite/templates': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
