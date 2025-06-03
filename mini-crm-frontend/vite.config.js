import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Only proxy in development - production will use absolute URLs from api.js
      '/auth': 'http://localhost:5000',
      '/api': 'http://localhost:5000',
    },
    // Add history API fallback for client-side routing
    historyApiFallback: true,
  },
})
