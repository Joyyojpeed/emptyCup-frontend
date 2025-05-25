import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',  // 👈 Look for index.html in root
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html')  // 👈 Direct path to HTML
    }
  }
})