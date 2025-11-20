import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import flowbiteReact from 'flowbite-react/plugin/vite'

export default defineConfig({
  base: '/',                           // ensure asset paths work on OBS
  plugins: [react(), tailwindcss(), flowbiteReact()],
  build: { 
    sourcemap: false,                  // Disable source maps for production (reduces build size)
  },
  server: {
    proxy: {
      // dev only: Vite forwards /api/v1 to your backend
      '/api/v1': {
        target: 'http://101.46.58.237:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p
      },
      // Admin API routes
      '/api/admin': {
        target: 'http://101.46.58.237:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p
      }
    }
  }
})
