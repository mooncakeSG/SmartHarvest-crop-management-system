import { defineConfig } from 'vite';

export default defineConfig({
  root: './frontend',
  publicDir: 'public',
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: '/index.html'
      }
    }
  },
  envDir: './frontend',
  envPrefix: 'VITE_',
}); 