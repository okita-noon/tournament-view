import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Cloudflare Pagesではルートパス、GitHub Pagesではサブディレクトリ
  base: process.env.CF_PAGES ? '/' : '/tournament-view/',
})