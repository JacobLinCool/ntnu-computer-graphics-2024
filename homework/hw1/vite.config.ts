import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const dirnames = path.dirname(fileURLToPath(import.meta.url)).split(path.sep);
const dirname = dirnames.pop();
const parent = dirnames.pop();

export default defineConfig({
	base: "./",
	build: {
		minify: false,
		modulePreload: {
			polyfill: false,
		},
		outDir: `../../dist/${parent}-${dirname}`,
	},
});
