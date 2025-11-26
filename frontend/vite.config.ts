import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
// ...existing code...
  server: {
    allowedHosts: ['unfascinating-unaxiomatically-lora.ngrok-free.dev'],
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      }
    }
  }
})
