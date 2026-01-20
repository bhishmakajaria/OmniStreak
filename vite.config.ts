
import { defineConfig } from 'vite';

export default defineConfig({
  // Using base: './' allows the app to be deployed in any subfolder or subdomain
  base: './',
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.META_APP_ID': JSON.stringify(process.env.META_APP_ID || 'YOUR_APP_ID_HERE')
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // Ensure the build is optimized for production
    minify: 'terser',
  }
});
