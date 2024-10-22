import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["./**/*.ts"],
  format: "cjs",
  clean: true,
  minify: true,
  outDir: "dist",
  bundle: false,
  esbuildOptions(options, ctx) {
    options.outbase = "."
  },
  dts: false,
  sourcemap: false,
})
