import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  root: '.', // Thư mục gốc chứa index.html
  plugins: [vue()], // Plugin Vue
  build: {
    outDir: 'dist', // Thư mục output
    assetsDir: 'assets', // Thư mục chứa assets
    sourcemap: false, // Tắt sourcemap để giảm kích thước build
  },
  base: '/', // Đường dẫn cơ sở mặc định
  resolve: {
    alias: {
      '@': '/src', // Alias để import dễ dàng hơn
    },
  },
})