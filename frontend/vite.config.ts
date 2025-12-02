import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// Vite configuration
// Vite configuration
export default defineConfig({
  plugins: [react()],
  base: '/UsageMons/',
// ...existing code...
  server: {
    allowedHosts: ['unfascinating-unaxiomatically-lora.ngrok-free.dev'],
  }
})
