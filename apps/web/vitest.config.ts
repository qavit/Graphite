import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@kakau/diagram-spec': resolve(__dirname, '../../packages/diagram-spec/src'),
      '@kakau/render-svg': resolve(__dirname, '../../packages/render-svg/src'),
      '@graphite/templates': resolve(__dirname, '../../packages/templates/src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
