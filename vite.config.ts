/**
 * @fileoverview Vite configuration for WordWise AI
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Vite build configuration with React plugin and optimized settings.
 * Includes path aliases, development server settings, and build optimizations.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  
  // Path aliases for clean imports
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@/hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@/services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@/stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
      '@/lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
      '@/types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '@/styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
    },
  },
  
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    host: true,
  },
  
  // Build optimizations
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          editor: ['@tiptap/core', '@tiptap/react', '@tiptap/starter-kit'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
  
  // Environment variables prefix
  envPrefix: 'VITE_',
  
  // Preview configuration
  preview: {
    port: 3000,
    open: true,
  },
}); 