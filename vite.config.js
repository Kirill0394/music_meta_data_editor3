import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/music_meta_data_editor3/",      // важно для GitHub Pages
});
