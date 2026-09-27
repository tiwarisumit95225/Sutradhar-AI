import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const offlineAppShell: Plugin = {
  name: 'offline-app-shell-manifest',
  generateBundle(_options, bundle) {
    const files = Object.keys(bundle).filter((file) => /\.(js|css)$/.test(file)).map((file) => `/${file}`);
    this.emitFile({ type: 'asset', fileName: 'precache-manifest.json', source: JSON.stringify(files) });
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), offlineAppShell],
  server: {
    port: 3000,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/src/ai/') || id.endsWith('/AiAssistCard.tsx')) return 'ai-assist';
        }
      }
    }
  }
});
