import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@graphite/diagram-spec': resolve(__dirname, '../../packages/diagram-spec/src'),
      '@graphite/render-svg': resolve(__dirname, '../../packages/render-svg/src'),
      '@graphite/templates': resolve(__dirname, '../../packages/templates/src'),
    },
  },
});
