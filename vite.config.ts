import path from 'path';

import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_BASE_URL;

  return {
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
      ...(apiTarget && {
        proxy: {
          '/api': {
            target: apiTarget,
            changeOrigin: true,
          },
        },
      }),
    },
  };
});
