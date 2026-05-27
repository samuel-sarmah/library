import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.js'],
      css: false,
    },
    server: {
      proxy: {
        '/api/news': {
          target: 'https://api.spaceflightnewsapi.net',
          changeOrigin: true,
          rewrite: (path) => {
            const url = new URL(path, 'http://localhost');
            const launch = url.searchParams.get('launch');
            const limit = url.searchParams.get('limit') || '20';
            const qs = launch
              ? `?launch=${encodeURIComponent(launch)}&limit=${limit}`
              : `?limit=${limit}`;
            return `/v4/articles/${qs}`;
          },
        },
        '/api': {
          target: 'https://ll.thespacedevs.com',
          changeOrigin: true,
          rewrite: (path) => {
            // /api/launches?type=upcoming&limit=100 → /2.3.0/launches/upcoming/?limit=100
            const url = new URL(path, 'http://localhost');
            if (path.startsWith('/api/launches')) {
              const type = url.searchParams.get('type') || 'upcoming';
              const limit = url.searchParams.get('limit') || '100';
              return `/2.3.0/launches/${type}/?limit=${limit}&mode=normal`;
            }
            // /api/launch/:id → /2.3.0/launches/:id/?mode=detailed
            const match = path.match(/^\/api\/launch\/(.+)/);
            if (match) {
              return `/2.3.0/launches/${match[1]}/?mode=detailed`;
            }
            return path;
          },
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const apiKey = env.SPACE_DEVS_API_KEY;
              if (apiKey) {
                proxyReq.setHeader('Authorization', `Token ${apiKey}`);
              }
            });
          },
        },
      },
    },
  };
})
