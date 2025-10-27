import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
  ],
  css: {
    postcss: './postcss.config.js',
  },
  // Base path configuration
  // Docker/Production: / (served from document root)
  // Local development (Laragon): /prms/prms-frontend/dist/
  base: process.env.VITE_BASE_PATH || '/',
})
