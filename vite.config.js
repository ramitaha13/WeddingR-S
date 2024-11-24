import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
  plugins: [react()],
  base: "/",
  resolve: {
    alias: {
      "@": "/src", // This helps with imports if you use @ aliases
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
