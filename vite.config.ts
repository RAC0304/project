import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react", "pg", "bcryptjs"],
  },
  define: {
    global: "globalThis",
  },
  resolve: {
    alias: {
      // Add fallbacks for Node.js modules that don't work in browser
      pg: "pg/lib/index.js",
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": ["framer-motion", "lucide-react"],
          "vendor-leaflet": ["leaflet", "react-leaflet"],
          "vendor-charts": ["recharts"],
        },
      },
    },
    // Increase the warning limit if desired
    chunkSizeWarningLimit: 800,
  },
});
