import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // THÊM DÒNG NÀY

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // THÊM DÒNG NÀY VÀO TRONG MẢNG PLUGINS
  ],
})