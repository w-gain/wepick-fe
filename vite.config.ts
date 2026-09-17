import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ command, mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };
  if (command === 'build' && env.VITE_DATA_MODE === 'mock') {
    throw new Error('Production builds cannot use VITE_DATA_MODE=mock.');
  }

  return {
    plugins: [react(), tailwindcss()],
    publicDir: 'static',
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/uploads': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      include: ['src/**/*.test.{ts,tsx}'],
      css: true,
    },
  };
});
