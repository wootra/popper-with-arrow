import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts({ outputDir: "dist", insertTypesEntry: true })],
  build: {
    lib: {
      entry: [new URL("src/index.tsx", import.meta.url).pathname],
      fileName: "index",
      name: "tooltip-with-arrow",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "react-popper", "@popperjs/core"],
    },
  },
});
