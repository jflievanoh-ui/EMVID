// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy REST API
      "/api": {
        target: "https://emvid.onrender.com",
        changeOrigin: true,
        secure: true,
      },
      // Proxy Socket.IO
      "/socket.io": {
        target: "https://emvid.onrender.com",
        ws: true,
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    outDir: "dist", // obligatorio para deploy en Render
  },
});
// Configuración de Vite para React con proxy para la API y Socket.IO
// - Proxy para la API REST y Socket.IO hacia el backend en Render  