import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Simple plugin to copy preload.cjs
const copyPreloadPlugin = () => ({
  name: 'copy-preload',
  buildStart() {
    const src = path.join(__dirname, 'electron', 'preload.cjs')
    const dest = path.join(__dirname, 'dist-electron', 'preload.cjs')
    if (fs.existsSync(src)) {
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.copyFileSync(src, dest)
    }
  },
})

export default defineConfig({
  plugins: [
    react(),
    copyPreloadPlugin(),
    electron([
      {
        entry: 'electron/main.ts',
        onstart(options) {
          options.startup()
        },
        vite: {
          build: {
            ssr: true,
            outDir: 'dist-electron',
            target: 'node16',
            rollupOptions: {
              external: ['better-sqlite3', 'electron'],
              output: {
                format: 'es',
                entryFileNames: '[name].mjs',
              },
            },
          },
        },
      },
    ]),
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
