import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(() => {
  return {
    // Relative asset paths so the built dist/ is portable — it's linked to
    // from kreeda.html (chadarangam/dist/index.html), which may be opened
    // via file:// or served from a nested path, not always from the domain root.
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      // Inline JS/CSS into index.html — Chromium blocks external ES-module
      // <script> fetches under file://, and kreeda.html (the hub this links
      // from) is itself a plain double-clicked file, not served over http(s).
      // A single self-contained HTML file sidesteps that entirely, matching
      // the rest of the KREEDA project's "no server required" design.
      viteSingleFile(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
