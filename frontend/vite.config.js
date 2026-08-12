import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/, // Ép Vite đọc các file .js trong thư mục src dưới dạng JSX
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx', // Sửa triệt để lỗi quét Dependency của esbuild
      },
    },
  },
})