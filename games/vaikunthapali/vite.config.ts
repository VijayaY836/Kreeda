import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  // Inline JS/CSS into index.html — Chromium blocks external ES-module
  // <script> fetches under file://, and kreeda.html (the hub this is opened
  // from) is itself a plain double-clicked file, not served over http(s).
  plugins: [react(), tailwindcss(), viteSingleFile()],
  base: './',
})
