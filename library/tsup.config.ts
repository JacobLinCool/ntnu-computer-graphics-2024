import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts", "src/cuon-matrix.ts"],
	format: ["esm"],
	target: "es2021",
	platform: "browser",
	dts: true,
});
