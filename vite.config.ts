import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base = nom du dépôt pour un déploiement GitHub Pages (https://nades2.github.io/apricot-token-decoder/)
export default defineConfig({
  base: "/apricot-token-decoder/",
  plugins: [react()],
});
