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
  },
});
