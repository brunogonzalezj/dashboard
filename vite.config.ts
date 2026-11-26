// vite.config.js
import { defineConfig } from 'vite';
// @ts-ignore
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'axios'],
          charts: ['recharts'],
          xlsx: ['file-saver'],
        }
      }
    }
  }
});

