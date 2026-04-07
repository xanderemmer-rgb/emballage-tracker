import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        landing: resolve(__dirname, 'landing.html'),
        blog: resolve(__dirname, 'blog/index.html'),
        'blog-emballage-kosten': resolve(__dirname, 'blog/emballage-kosten-horeca.html'),
        'blog-statiegeld': resolve(__dirname, 'blog/emballage-statiegeld-regels.html'),
        'blog-tips': resolve(__dirname, 'blog/tips-emballagebeheer.html'),
      },
    },
  },
})
