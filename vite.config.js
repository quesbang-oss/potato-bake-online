import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs';

export default defineConfig({
  root: 'client',
  base: './',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    assetsDir: '',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'client/index.html')
      },
      output: {
        entryFileNames: '[name]-[hash].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'manifest.json') {
            return 'manifest.json';
          }
          return '[name]-[hash].[ext]';
        }
      }
    }
  },
  // Inline all assets for maximum compatibility
  assetsInlineLimit: 100000000,
  plugins: [
    {
      name: 'copy-manifest',
      writeBundle() {
        // Copy manifest.json to root
        const manifestSrc = resolve(__dirname, 'client/manifest.json');
        const manifestDest = resolve(__dirname, 'dist/manifest.json');
        
        if (existsSync(manifestSrc)) {
          copyFileSync(manifestSrc, manifestDest);
        }
        
        // Copy icons folder
        const iconsSrc = resolve(__dirname, 'client/icons');
        const iconsDest = resolve(__dirname, 'dist/icons');
        
        if (existsSync(iconsSrc)) {
          if (!existsSync(iconsDest)) {
            mkdirSync(iconsDest, { recursive: true });
          }
          
          const files = readdirSync(iconsSrc);
          files.forEach(file => {
            const srcPath = resolve(iconsSrc, file);
            const destPath = resolve(iconsDest, file);
            copyFileSync(srcPath, destPath);
          });
        }
      }
    }
  ],
  server: {
    port: 3000,
    proxy: {
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true
      }
    }
  }
});
