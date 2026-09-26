import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(() => {
  return {
    // Relative asset paths so the built dist/ is portable — it's linked to
    // from kreeda.html (wellbeing/dist/index.html), which may be opened via
    // file:// or served from a nested path, not always from the domain root.
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      // Inline JS/CSS into index.html — Chromium blocks external ES-module
      // <script> fetches under file://, and kreeda.html (the hub this links
      // from) is itself a plain double-clicked file, not served over http(s).
      // Images are NOT inlined (the plugin's default): base64-ing ~13 MB of
      // photos and GIFs made an 18 MB index.html that took seconds to parse.
      // Plain <img src> files load fine under file://.
      viteSingleFile({ useRecommendedBuildConfig: false }),
    ],
    build: {
      cssCodeSplit: false,
      assetsInlineLimit: 4096,
      chunkSizeWarningLimit: 100_000_000,
      rollupOptions: { output: { inlineDynamicImports: true } },
    },
    // Asset URLs are normally built relative to the JS file, but that JS is
    // inlined into index.html — so resolve them against the page instead.
    experimental: {
      renderBuiltUrl: (filename: string, { hostType }: { hostType: 'js' | 'css' | 'html' }) =>
        hostType === 'js'
          ? { runtime: `new URL(${JSON.stringify('./' + filename)}, document.baseURI).href` }
          : { relative: true },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
