import path from 'path';

import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [react(), vanillaExtractPlugin(), svgr()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@routes': path.resolve(__dirname, './src/routes'),
      '@apis': path.resolve(__dirname, './src/shared/apis'),
      '@assets': path.resolve(__dirname, './src/shared/assets'),
      '@components': path.resolve(__dirname, './src/shared/components'),
      '@hooks': path.resolve(__dirname, './src/shared/hooks'),
      '@styles': path.resolve(__dirname, './src/shared/styles'),
      '@utils': path.resolve(__dirname, './src/shared/utils'),
      '@constants': path.resolve(__dirname, './src/shared/constants'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
  server: {
    port: 3000,
    // 백엔드 개발 완료 후 아래 프록시 주석 해제
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:8080',
    //     changeOrigin: true,
    //   },
    //   '/ws': {
    //     target: 'ws://localhost:8080',
    //     ws: true,
    //   },
    // },
  },
});
