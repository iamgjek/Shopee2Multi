import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    // 啟用代碼分割
    rollupOptions: {
      output: {
        manualChunks: {
          // 將 React 和 React DOM 分離
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // 將 Ant Design 分離
          'antd-vendor': ['antd', '@ant-design/icons'],
          // 將其他第三方庫分離
          'utils-vendor': ['axios', 'zustand'],
        },
      },
    },
    // 啟用源映射（生產環境可選）
    sourcemap: false,
    // 優化構建大小（使用 esbuild，更快且無需額外依賴）
    minify: 'esbuild',
    // 設置 chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
  },
  // 優化依賴預構建
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'antd'],
  },
})
