import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  server: {
    proxy: {
      "/api": process.env.CALCULATOR_API_TARGET || "http://127.0.0.1:8080",
    },
  },
  esbuild: { jsx: "automatic" },
  optimizeDeps: { esbuildOptions: { loader: { ".js": "jsx" } } },
});
