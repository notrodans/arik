import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";
import { execSync } from "child_process";
import autoprefixer from "autoprefixer";
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import webpHtmlPlugin from "./config/plugins/vite-plugin-webp-html";
import imgPath from "./config/plugins/vite-plugin-img-path";
import htmlTemplate from "./config/plugins/vite-plugin-html-template";
import copyAssets from "./config/plugins/vite-plugin-copy-assets";
import scriptOptimization from "./config/plugins/vite-plugin-script-optimization";
import viteHTMLIncludes from "@kingkongdevs/vite-plugin-html-includes";

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
			sourcemap: true,
			//assetsDir: 'assets',
			//assetsInlineLimit: 4096, // 4kb - файлы меньше будут инлайниться
			//assetsInclude: ['**/*.{png,jpg,jpeg,gif,svg,webp,avif}'],
			rollupOptions: {
				input: Object.fromEntries(
					htmlPages.map(page => [page.replace(/\.html$/, ""), resolve(srcFolder, page)])
				),
				output: {
					entryFileNames: "js/[name].[hash].js",
					chunkFileNames: "js/[name].[hash].js",
					assetFileNames: (assetInfo) => {
						if (!assetInfo.name) return 'assets/[name][extname]';

						// Получаем путь относительно src
						const srcPath = assetInfo.name.split('/src/').pop() || assetInfo.name;
						
						// Получаем расширение файла
						const extType = srcPath.split('.').at(-1);
						
						// Получаем путь к директории относительно src
						const dirPath = srcPath.split('/').slice(0, -1).join('/');
						
						// Распределяем файлы по папкам в зависимости от расширения и пути
						if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(extType)) {
							// Если файл уже в папке img или её подпапке, сохраняем структуру
							if (dirPath.startsWith('img/')) {
								return `${dirPath}/[name][extname]`;
							}
							return `img/[name][extname]`;
						}
						
						if (/woff2?|ttf|otf|eot/i.test(extType)) {
							// Если файл уже в папке fonts или её подпапке, сохраняем структуру
							if (dirPath.startsWith('fonts/')) {
								return `${dirPath}/[name][extname]`;
							}
							return `fonts/[name][extname]`;
						}

						if (/css/i.test(extType)) {
							// Если файл уже в папке css или её подпапке, сохраняем структуру
							if (dirPath.startsWith('css/')) {
								return `${dirPath}/[name].minify[extname]`;
							}
							return `css/[name].minify[extname]`;
						}

						// Для всех остальных файлов сохраняем оригинальную структуру папок
						if (dirPath) {
							return `${dirPath}/[name][extname]`;
						}
						return `assets/[name][extname]`;
					}
				}
			}
		},

		plugins: [
			// HTML includes
			viteHTMLIncludes({
				componentsPath: "/html/"
			}),

			// HTML template processing
			htmlTemplate(),

			// Asset copying
			copyAssets(isBuild, buildFolder),

			// Script optimization
			scriptOptimization(),

			//// WebP HTML support
			webpHtmlPlugin(),

			// Image path handling
			imgPath(),

			// Image optimization
			ViteImageOptimizer({
				test: /\.(jpe?g|png|gif|tiff|webp|svg|avif)$/i,
				include: ['src/**/*'],
				exclude: ['node_modules/**/*'],
				svgo: {
					multipass: true,
					plugins: [
						{ name: 'preset-default' },
						{ name: 'removeViewBox', active: false }
					]
				},
				png: {
					quality: 80
				},
				jpeg: {
					quality: 80
				},
				jpg: {
					quality: 80
				},
				webp: {
          smartSubsample: true,
          force: true,
					lossless: true
				}
			})
		]
	};
});

