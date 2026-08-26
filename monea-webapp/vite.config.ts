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
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React ecosystem
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'react-vendor'
          }
          
          // UI framework
          if (id.includes('@radix-ui/') || id.includes('framer-motion') || id.includes('lucide-react')) {
            return 'ui-vendor'
          }
          
          // Form and validation
          if (id.includes('react-hook-form') || id.includes('@hookform/resolvers') || id.includes('zod')) {
            return 'forms-vendor'
          }
          
          // Heavy libraries
          if (id.includes('xlsx')) {
            return 'xlsx-vendor'
          }
          if (id.includes('qr-code') || id.includes('qr-scanner')) {
            return 'qr-vendor'
          }
          if (id.includes('date-fns') || id.includes('react-day-picker')) {
            return 'date-vendor'
          }
          
          // Image processing
          if (id.includes('react-easy-crop') || id.includes('sharp')) {
            return 'image-vendor'
          }
          
          // Utility libraries
          if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority') || id.includes('canvas-confetti')) {
            return 'utils-vendor'
          }
          
          // Node modules default
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            // Create separate chunks for different app sections
            if (facadeModuleId.includes('/dashboard/')) {
              return 'assets/dashboard-[name]-[hash].js'
            }
            if (facadeModuleId.includes('/admin/')) {
              return 'assets/admin-[name]-[hash].js'
            }
            if (facadeModuleId.includes('/(auth)/')) {
              return 'assets/auth-[name]-[hash].js'
            }
          }
          return 'assets/[name]-[hash].js'
        }
      }
    },
    // Increase chunk size warning limit since we're optimizing
    chunkSizeWarningLimit: 600,
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
