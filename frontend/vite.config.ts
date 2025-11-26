import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  base: '/UsageMons/',
// ...existing code...
  server: {
    allowedHosts: ['unfascinating-unaxiomatically-lora.ngrok-free.dev'],
  }
})
