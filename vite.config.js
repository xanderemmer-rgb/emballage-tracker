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
        // Dutch blog
        blog: resolve(__dirname, 'blog/index.html'),
        'blog-emballage-kosten': resolve(__dirname, 'blog/emballage-kosten-horeca.html'),
        'blog-statiegeld': resolve(__dirname, 'blog/emballage-statiegeld-regels.html'),
        'blog-tips': resolve(__dirname, 'blog/tips-emballagebeheer.html'),
        'blog-duurzaam': resolve(__dirname, 'blog/duurzaam-emballagebeheer.html'),
        // English blog
        'blog-en': resolve(__dirname, 'blog/en/index.html'),
        'blog-en-costs': resolve(__dirname, 'blog/en/packaging-costs-hospitality.html'),
        'blog-en-deposit': resolve(__dirname, 'blog/en/packaging-deposit-rules.html'),
        'blog-en-tips': resolve(__dirname, 'blog/en/packaging-management-tips.html'),
        'blog-en-sustainable': resolve(__dirname, 'blog/en/sustainable-packaging-management.html'),
      },
    },
  },
})
