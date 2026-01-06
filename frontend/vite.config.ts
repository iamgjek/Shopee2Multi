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
        manualChunks: (id) => {
          // 將 node_modules 中的依賴分組
          if (id.includes('node_modules')) {
            // React 核心庫
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // Ant Design
            if (id.includes('antd') || id.includes('@ant-design')) {
              return 'antd-vendor';
            }
            // 其他第三方庫
            return 'vendor';
          }
        },
        // 優化 chunk 命名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    // 啟用源映射（生產環境可選，關閉以提升性能）
    sourcemap: false,
    // 優化構建大小（使用 esbuild，更快且無需額外依賴）
    minify: 'esbuild',
    // 設置 chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
    // 啟用 CSS 代碼分割
    cssCodeSplit: true,
    // 壓縮 CSS
    cssMinify: true,
    // 啟用 tree shaking
    treeshake: true,
    // 目標瀏覽器（提升兼容性和性能）
    target: ['es2015', 'edge88', 'firefox78', 'chrome87', 'safari14'],
  },
  // 優化依賴預構建
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'antd'],
  },
})
