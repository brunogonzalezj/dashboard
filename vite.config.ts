// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'axios'],
          charts: ['recharts'],
          xlsx: ['xlsx-js-style', 'file-saver'],
        }
      }
    }
  }
});

