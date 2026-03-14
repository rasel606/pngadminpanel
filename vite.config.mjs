import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import autoprefixer from 'autoprefixer'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = (env.VITE_API_URL || 'http://localhost:5000/api').trim()

  let proxyTarget = 'http://localhost:5000'
  try {
    proxyTarget = new URL(apiUrl).origin
  } catch {
    proxyTarget = 'http://localhost:5000'
  }

  return {
    base: './',
    build: {
      outDir: 'build',
    },
    css: {
      postcss: {
        plugins: [
          autoprefixer({}), // add options if needed
        ],
      },
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
    optimizeDeps: {
      force: true,
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: [
        {
          find: 'src/',
          replacement: `${path.resolve(__dirname, 'src')}/`,
        },
      ],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
      // Prevent accidental double-bundling of React (causes hook dispatcher errors)
      dedupe: ['react', 'react-dom'],
    },
    server: {
      // Keep the admin panel on its own port to avoid clashing with the player/affiliate apps
      port: 5173,
      proxy: {
        '/api': {
          // Proxy API calls to the backend API server
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
