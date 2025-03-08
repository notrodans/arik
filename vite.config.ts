import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";
import { execSync } from "child_process";
import autoprefixer from "autoprefixer";
import webpHtmlPlugin from "./config/plugins/vite-plugin-webp-html";
import copyAssets from "./config/plugins/vite-plugin-copy-assets";
import scriptOptimization from "./config/plugins/vite-plugin-script-optimization";
import viteHTMLIncludes from "@kingkongdevs/vite-plugin-html-includes";
import { PathResolverOptions, createPathPlugin } from "./config/abstractions/path-resolver";

// Build paths
const srcFolder = "src";
const buildFolder = "dist";

// HTML page files
const htmlPages = fs.readdirSync(srcFolder).filter(file => file.endsWith(".html"));

// Configure Vite
export default defineConfig(({ command, mode }) => {
	const isBuild = command === "build";

	return {
		root: srcFolder,
		base: "./",
		publicDir: "public",

		server: {
			port: 3000,
			host: true,
			open: false,
			hmr: true
		},

		css: {
			devSourcemap: true,
			postcss: {
				plugins: [autoprefixer()]
			}
		},

		build: {
			outDir: `../${buildFolder}`,
			emptyOutDir: true,
			assetsInclude: ["**/*.{png,jpg,jpeg,gif,svg,webp,avif}"],
			rollupOptions: {
				input: Object.fromEntries(
					htmlPages.map(page => [page.replace(/\.html$/, ""), resolve(srcFolder, page)])
				),
				output: {
					entryFileNames: "js/[name].[hash].js",
					chunkFileNames: "js/[name].[hash].js",
					assetFileNames: assetInfo => {
						if (!assetInfo.name) return "assets/[name][extname]";

						const srcPath = assetInfo.name.split("/src/").pop() || assetInfo.name;

						const extType = srcPath.split(".").at(-1);

						if (!extType) return "assets/default.[extname]";

						const dirPath = srcPath.split("/").slice(0, -1).join("/");

						if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(extType)) {
							if (dirPath.startsWith("img/")) {
								return `${dirPath}/[name][extname]`;
							}
							return `img/[name][extname]`;
						}

						if (/woff2?|ttf|otf|eot/i.test(extType)) {
							if (dirPath.startsWith("fonts/")) {
								return `${dirPath}/[name][extname]`;
							}
							return `fonts/[name][extname]`;
						}

						if (/css/i.test(extType)) {
							if (dirPath.startsWith("css/")) {
								return `${dirPath}/[name].minify[extname]`;
							}
							return `css/[name].minify[extname]`;
						}

						if (dirPath) {
							return `${dirPath}/[name][extname]`;
						}
						return `assets/[name][extname]`;
					}
				}
			}
		},

		plugins: [
			// Asset copying
			copyAssets(isBuild, buildFolder),

			// Images path handling
			createPathPlugin({
				name: "images",
				prefix: "@img",
				folder: "img/",
				emoji: "🖼️",
				devRoot: "src",
				prodRoot: "dist"
			}),

			// Fonts path plugin
			createPathPlugin({
				name: "fonts",
				prefix: "@fonts",
				folder: "fonts",
				emoji: "🔤",
				devRoot: "src",
				prodRoot: "dist"
			}),

			// HTML includes
			viteHTMLIncludes({
				componentsPath: "/html/"
			}),

			// Script optimization
			scriptOptimization(),

			// WebP HTML support
			webpHtmlPlugin()
		]
	};
});
