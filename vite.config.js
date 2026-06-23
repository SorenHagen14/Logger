import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/Logger/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'Logger',
        short_name: 'Logger',
        description: 'Track your workouts',
        start_url: '/Logger/',
        scope: '/Logger/',
        display: 'standalone',
        background_color: '#0D0D0F',
        theme_color: '#0D0D0F',
        icons: [
          { src: '/Logger/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/Logger/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/Logger/icon-1024.png', sizes: '1024x1024', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
      },
    }),
  ],
})
