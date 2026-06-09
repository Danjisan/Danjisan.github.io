import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Site de utilizator (danjisan.github.io) → base rămâne "/"
export default defineConfig({
  plugins: [react()],
});
