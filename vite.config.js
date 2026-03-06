import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles'),
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    // Warn when a chunk exceeds 500 kB (Lighthouse best practice)
    chunkSizeWarningLimit: 500,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn'],
      },
    },
    rollupOptions: {
      output: {
        // Split by logical feature boundaries to maximise caching
        manualChunks(id) {
          // React runtime — smallest chunk, most cacheable
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) {
            return 'react-runtime';
          }
          // Router
          if (id.includes('react-router-dom') || id.includes('react-router/')) {
            return 'react-router';
          }
          // TanStack Query
          if (id.includes('@tanstack/react-query')) {
            return 'react-query';
          }
          // Recharts — large charting library, only used on /admin
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-')) {
            return 'recharts';
          }
          // Socket.IO client
          if (id.includes('socket.io-client') || id.includes('engine.io-client')) {
            return 'socketio';
          }
          // Lucide icons
          if (id.includes('lucide-react')) {
            return 'icons';
          }
        },
        // Use content hashes for long-term caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      }
    }
  }
})
