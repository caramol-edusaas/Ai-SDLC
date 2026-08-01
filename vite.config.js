import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // Ye line 'global is not defined' error ko hamesha ke liye khatam kar degi!
    global: "window",
  },
});
