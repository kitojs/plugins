import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  outDir: "dist",
  minify: true,
  dts: true,
  tsconfig: "tsconfig.json",
});
