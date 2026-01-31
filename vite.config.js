import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  publicDir: "public",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@core": path.resolve(__dirname, "./src/core"),
      "@effects": path.resolve(__dirname, "./src/effects"),
      "@ui": path.resolve(__dirname, "./src/ui"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@styles": path.resolve(__dirname, "./src/assets/styles"),
      "@images": path.resolve(__dirname, "./src/assets/images"),
      "@fonts": path.resolve(__dirname, "./src/assets/fonts"),
    },
  },
});
