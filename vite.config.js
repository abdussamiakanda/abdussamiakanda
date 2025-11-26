import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      // Rewrite extensionless routes to their static HTML counterparts in /public.
      name: 'static-html-rewrite',
      configureServer(server) {
        const staticRoots = new Set(['/log', '/logs', '/fax', '/quran'])
        server.middlewares.use((req, _res, next) => {
          if (!req.url) return next()
          const urlPath = req.url.split('?')[0]
          if (staticRoots.has(urlPath)) {
            req.url = `${urlPath}/index.html`
          }
          next()
        })
      },
    },
  ],
})
