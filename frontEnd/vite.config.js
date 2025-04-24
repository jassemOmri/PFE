import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 🔑 حتى يسمح بالوصول من الشبكة
    strictPort: true,
    port: 5173,
        origin: 'https://cb66-102-169-70-143.ngrok-free.app', // 🔄 ضع رابط ngrok متاعك هنا

    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
