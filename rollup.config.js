import { swc } from "rollup-plugin-swc3"

// biome-ignore lint/style/noDefaultExport: <explanation>
export default {
	input: "./src/index.ts",

	output: {
		file: "./dist/index.js",
		format: "es",
		preserveModules: false,
		sourcemap: false,
	},

	plugins: [swc()],
}
