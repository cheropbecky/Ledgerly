import { defineConfig } from 'vite';
<<<<<<< HEAD
import react from '@vitejs/plugin-react';
=======
import react from '@vitejs/plugin-react'; // <-- Changed this line
>>>>>>> 4fa06f71d7e43376934d28ed585830ff5fcc7ee6
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite'; // <-- 1. Add this import

export default defineConfig({
  plugins: [
<<<<<<< HEAD
    tailwindcss(), // <-- 2. Add the tailwind compiler initialization here
    react(),
=======
    react(), // This will now run perfectly
>>>>>>> 4fa06f71d7e43376934d28ed585830ff5fcc7ee6
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Ledgerly Retail Credit Manager',
        short_name: 'Ledgerly',
        description: 'Manage retail storefront credit lines and client ledgers.',
        theme_color: '#0ea5e9',
        background_color: '#f8fafc',
        display: 'standalone',
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
