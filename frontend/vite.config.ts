import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '..', '')
  return {
  envDir: '..',
  resolve: { alias: [{ find: /^@tarojs\/components$/, replacement: fileURLToPath(new URL('./src/components/taro-h5.ts', import.meta.url)) }] },
  plugins: [react(), {
    name: 'require-frontend-port-5173',
    configResolved(config) {
      if (config.server.port !== 5173 || config.preview.port !== 5173) {
        throw new Error('点点会前端只允许使用 5173 端口。')
      }
    },
  }],
  preview: { host: env.VITE_HOST || '0.0.0.0', port: 5173, strictPort: true },
  server: {
    host: env.VITE_HOST || '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: env.API_PROXY_TARGET || 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
}
})
