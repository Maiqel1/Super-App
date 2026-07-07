import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "shell",
      remotes: {
        // Production remotes on Vercel. For local development, comment these
        // out and use the localhost entries below (run each remote's dev
        // server on its port).
        todoApp: {
          type: "module",
          name: "todoApp",
          entry: "https://super-app-todo.vercel.app/remoteEntry.js",
          // entry: "http://localhost:3001/remoteEntry.js",
        },
        notesApp: {
          type: "module",
          name: "notesApp",
          entry: "https://super-app-notes.vercel.app/remoteEntry.js",
          // entry: "http://localhost:3002/remoteEntry.js",
        },
        weatherApp: {
          type: "module",
          name: "weatherApp",
          entry: "https://super-app-weather.vercel.app/remoteEntry.js",
          // entry: "http://localhost:3003/remoteEntry.js",
        },
      },
      shared: {
        react: { singleton: true, eager: true },
        "react-dom": { singleton: true, eager: true },
      },
    }),
  ],
  server: { port: 3000 },
  build: { target: "esnext" },
});
