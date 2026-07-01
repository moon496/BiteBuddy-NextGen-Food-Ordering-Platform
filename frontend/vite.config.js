import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/menu-items': 'http://127.0.0.1:8000',
      '/order-status': 'http://127.0.0.1:8000',
    }
  }
})