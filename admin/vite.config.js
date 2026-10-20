import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // In development the admin calls /api/... on its own origin and Vite forwards it to the API
      // (stripping the /api prefix). The login cookie is then first-party and CORS never comes into
      // play. In production, netlify.toml does the same job.
      proxy: {
        '/api': {
          target: env.API_PROXY_TARGET || 'http://localhost:4000',
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
