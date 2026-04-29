import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    host: true,
    port: 5173,
    proxy: {
      "/loki": {
        target: process.env.VITE_LOKI_URL || "http://loki:3100",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/loki/, ""),
      },
    },
  },
});
