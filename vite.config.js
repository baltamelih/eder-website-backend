import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],

  resolve: {
    alias: {
      buffer: "buffer",
    },
  },

  optimizeDeps: {
    include: ["buffer"],
  },

  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("/react-router")) return "vendor-react";
          if (id.includes("/antd/") || id.includes("/@ant-design/")) return "vendor-antd";
          if (id.includes("/@sanity/") || id.includes("/sanity/")) return "vendor-sanity";
          if (id.includes("/framer-motion/")) return "vendor-motion";
          if (id.includes("/three/") || id.includes("/@react-three/")) return "vendor-three";
          if (id.includes("/lucide-react/")) return "vendor-icons";
          return "vendor";
        },
      },
    },

  },
});
