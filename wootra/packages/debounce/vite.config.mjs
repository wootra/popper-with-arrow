import { defineConfig } from "vite";
// import tsconfigPaths from "vite-tsconfig-paths";
// import dts from "vite-dts";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [dts({ insertTypesEntry: true, outputDir: "dist" })],
  build: {
    lib: {
      entry: [new URL("index.ts", import.meta.url).pathname],
      fileName: "index",
      formats: ["es"],
      name: "debounce",
    },
  },
});
