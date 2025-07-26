import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true
  },
  css: {
    postcss: './postcss.config.js'
  },
  resolve: {
    alias: {
      'lightweight-charts': 'lightweight-charts'
    }
  },
  optimizeDeps: {
    exclude: ['lightweight-charts']
  }
});