import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src")
    },
    extensions: ['.mjs', '.js', '.jsx', '.json', '.ts', '.tsx']
  },
  optimizeDeps: {
    include: ['jsvectormap']
  },
  build: {
    commonjsOptions: {
      include: [/jsvectormap/, /node_modules/]
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'jsvectormap': ['jsvectormap']
        }
      }
    }
  }
});