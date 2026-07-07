import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'

// In production this remote is served from its own Vercel origin, so its
// assets (including the exposed component's CSS) must resolve there — not
// against the host shell. Use the absolute deploy URL for builds; '/' for dev.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? 'https://super-app-todo.vercel.app/' : '/',
  plugins: [
    react(),
    federation({
      name: 'todoApp',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App',
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
      },
    }),
  ],
  server: {
    port: 3001,
    origin: 'http://localhost:3001',
  },
  build: { target: 'esnext' },
}))
