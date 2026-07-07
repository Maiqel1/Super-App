import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "shell",
      remotes: {
        // Local dev remotes. Restore the Vercel URLs (kept below) once the
        // apps are redeployed.
        todoApp: {
          type: "module",
          name: "todoApp",
          entry: "http://localhost:3001/remoteEntry.js",
          // entry: "https://super-app-chi-eosin.vercel.app/remoteEntry.js",
        },
        notesApp: {
          type: "module",
          name: "notesApp",
          entry: "http://localhost:3002/remoteEntry.js",
          // entry: "https://super-app-notes.vercel.app/remoteEntry.js",
        },
        weatherApp: {
          type: "module",
          name: "weatherApp",
          entry: "http://localhost:3003/remoteEntry.js",
          // entry: "https://super-app-weather.vercel.app/remoteEntry.js",
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
