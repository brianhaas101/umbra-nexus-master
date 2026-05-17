import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  cacheDir: path.resolve("C:/Temp/nexus-vite-cache"),

  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    hmr: false,
    allowedHosts: true
  },
});
