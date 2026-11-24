import { fileURLToPath } from "node:url";
import { defineConfig, transformWithEsbuild } from "vite";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  server: {
    proxy: {
      "/api": process.env.CALCULATOR_API_TARGET || "http://127.0.0.1:8080",
    },
  },
  esbuild: { jsx: "automatic" },
  optimizeDeps: { esbuildOptions: { loader: { ".js": "jsx" } } },
  plugins: [{
    name: "calculator-entry-jsx",
    enforce: "pre",
    transform(code, id) {
      if (id.endsWith("/src/index.js")) {
        return transformWithEsbuild(code, id, { loader: "jsx", jsx: "automatic" });
      }
    }
  }]
});
