import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/customers': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/api/properties': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
      '/api/applications': {
        target: 'http://localhost:5004',
        changeOrigin: true,
      },
    },
  },
});
