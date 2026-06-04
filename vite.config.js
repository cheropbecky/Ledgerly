import { defineConfig } from 'vite';
import react from '@vitejs/react-refresh';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Ledgerly Retail Credit Manager',
        short_name: 'Ledgerly',
        description: 'Manage retail storefront credit lines and client ledgers.',
        theme_color: '#0ea5e9', // Matches your Sky-500 theme color
        background_color: '#f8fafc', // Matches slate-50 background
        display: 'standalone', // Hides the browser URL bar on mobile phones
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});