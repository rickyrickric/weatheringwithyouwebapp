import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

const apiProxyTarget = process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:3000'
const frontendPort = Number(process.env.FRONTEND_PORT || process.env.VITE_FRONTEND_PORT || 5173)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    host: '127.0.0.1',
    port: Number.isFinite(frontendPort) ? frontendPort : 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      }
    }
  }
})
