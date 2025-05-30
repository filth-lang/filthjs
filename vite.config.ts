/// <reference types="vitest" />

import path from 'node:path';
import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import pkg from './package.json' with { type: 'json' };

// https://vite.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/lib/index.ts'),
      fileName: 'index',
      formats: ['es']
    },
    minify: 'esbuild',
    rollupOptions: {
      external: ['preact'],
      output: {
        globals: {
          preact: 'preact'
        }
      }
    },
    sourcemap: true
  },
  define: {
    __API_URL__: 'window.__backend_api_url',
    __APP_VERSION__: JSON.stringify(pkg.version)
  },
  plugins: [dts(), preact()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@filth': path.resolve(__dirname, './src/lib'),
      '@helpers': path.resolve(__dirname, './src/helpers'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@model': path.resolve(__dirname, './src/model')
    }
  }
});
