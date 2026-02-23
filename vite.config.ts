import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const pwa = VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['/apple-touch-icon.png'],
  manifest: {
    name: 'DripCalc — Калькулятор автополива',
    short_name: 'DripCalc',
    start_url: '.',
    display: 'standalone',
    background_color: '#f5f6f9',
    theme_color: '#f5f6f9',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
    runtimeCaching: [
      {
        urlPattern: ({ request }) => request.destination === 'document',
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages',
          expiration: { maxEntries: 10 }
        }
      },
      {
        urlPattern: ({ request }) =>
          ['style', 'script', 'image', 'font'].includes(request.destination),
        handler: 'CacheFirst',
        options: {
          cacheName: 'assets',
          expiration: { maxEntries: 50 }
        }
      }
    ]
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pwa],
  server: {
    host: '0.0.0.0', // Доступ по IP адресу
    port: 5173,
  },
})
