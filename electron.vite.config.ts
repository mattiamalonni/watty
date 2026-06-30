import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'electron-vite'
import { resolve } from 'path'
import { viteSingleFile } from 'vite-plugin-singlefile'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  main: {
    build: {
      externalizeDeps: true,
      rollupOptions: {
        external: ['better-sqlite3', 'electron-updater']
      }
    }
  },
  preload: {
    build: {
      externalizeDeps: true
    }
  },
  renderer: {
    root: resolve(__dirname, 'src/renderer'),
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'src/renderer/index.html')
      }
    },
    plugins: [svgr(), react(), tailwindcss(), viteSingleFile()]
  }
})
