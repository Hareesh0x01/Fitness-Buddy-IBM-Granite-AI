import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Optional: proxy /api requests to backend during dev
      // Uncomment if you want to use same-origin requests (no CORS needed)
      // '/api': {
      //   target: 'http://localhost:5000',
      //   changeOrigin: true,
      // },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
});
