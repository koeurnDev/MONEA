import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps for mobile performance
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Critical mobile chunks
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-core'
          }
          if (id.includes('react-router-dom')) {
            return 'react-router'
          }
          
          // UI framework - split for lazy loading
          if (id.includes('@radix-ui/')) {
            return 'radix-ui'
          }
          if (id.includes('framer-motion')) {
            return 'animations' // Lazy load animations on mobile
          }
          if (id.includes('lucide-react')) {
            return 'icons'
          }
          
          // Form handling
          if (id.includes('react-hook-form') || id.includes('@hookform/resolvers') || id.includes('zod')) {
            return 'forms'
          }
          
          // Heavy features - separate for conditional loading
          if (id.includes('xlsx')) {
            return 'excel' // Load only when needed
          }
          if (id.includes('qr-code') || id.includes('qr-scanner') || id.includes('qrcode')) {
            return 'qr-code' // Load only for QR features
          }
          if (id.includes('date-fns') || id.includes('react-day-picker')) {
            return 'date-picker'
          }
          if (id.includes('react-easy-crop')) {
            return 'image-crop'
          }
          if (id.includes('canvas-confetti')) {
            return 'animations-extra'
          }
          
          // API and networking
          if (id.includes('swr')) {
            return 'data-fetching'
          }
          
          // Utilities - keep small
          if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
            return 'utilities'
          }
          
          // Default vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            // Route-based code splitting for mobile
            if (facadeModuleId.includes('/dashboard/')) {
              return 'routes/dashboard-[name]-[hash].js'
            }
            if (facadeModuleId.includes('/admin/')) {
              return 'routes/admin-[name]-[hash].js'
            }
            if (facadeModuleId.includes('/(auth)/')) {
              return 'routes/auth-[name]-[hash].js'
            }
            if (facadeModuleId.includes('/wedding/')) {
              return 'routes/wedding-[name]-[hash].js'
            }
          }
          return 'chunks/[name]-[hash].js'
        }
      }
    },
    // Reduced chunk size limit for mobile
    chunkSizeWarningLimit: 300,
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8787',
        changeOrigin: true,
        cookieDomainRewrite: 'localhost',
      },
    },
  },
})
