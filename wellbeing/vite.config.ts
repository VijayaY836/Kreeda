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
      // The plugin's recommended config would also base64-inline every image
      // (~47 MB of HTML), so it's disabled and the build options below are set
      // by hand instead: images ship as separate files in dist/assets/, which
      // plain <img> tags load fine under file://.
      viteSingleFile({ useRecommendedBuildConfig: false }),
    ],
    build: {
      assetsInlineLimit: 4096,
      cssCodeSplit: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: { inlineDynamicImports: true },
      },
    },
    // Vite resolves asset URLs relative to the emitted chunk (in assets/), but
    // the chunk gets inlined into index.html — so resolve from the page itself.
    experimental: {
      renderBuiltUrl(filename: string, { hostType }: { hostType: 'js' | 'css' | 'html' }) {
        return hostType === 'js'
          ? { runtime: `new URL(${JSON.stringify('./' + filename)}, import.meta.url).href` }
          : './' + filename;
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
