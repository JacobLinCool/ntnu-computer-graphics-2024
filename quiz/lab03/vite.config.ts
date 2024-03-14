import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const dirname = path
	.dirname(fileURLToPath(import.meta.url))
	.split(path.sep)
	.pop();

export default defineConfig({
	base: "./",
	build: {
		minify: false,
		modulePreload: {
			polyfill: false,
		},
		outDir: `../../dist/${dirname}`,
	},
});
