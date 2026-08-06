import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs';

export default defineConfig({
  root: 'client',
  base: '/potato-bake-online/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'client/index.html')
      }
    }
  },
  plugins: [
    {
      name: 'copy-assets',
      writeBundle() {
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
