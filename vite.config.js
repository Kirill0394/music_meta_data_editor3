import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  base: "/music_meta_data_editor3/",   // имя вашего репо
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
});
