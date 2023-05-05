import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: [new URL("src/index.tsx", import.meta.url).pathname],
      fileName: "index",
      formats: ["es"],
    },
  },
});
