import path from "path";
import fs from "fs";
import sharp from "sharp";
import { Plugin } from "vite";

export default function vitePluginWebP(): Plugin {
	return {
		name: "vite-plugin-webp",
		async generateBundle() {
			const imgDir = path.resolve(__dirname, "../../src/public/img");
			const destDir = path.resolve(__dirname, "../../website/img");

			if (!fs.existsSync(destDir)) {
				fs.mkdirSync(destDir, { recursive: true });
			}

			const processImages = async (dir: string, relativePath: string = "") => {
				const files = fs.readdirSync(dir);

				for (const file of files) {
					const filePath = path.join(dir, file);
					const stat = fs.statSync(filePath);

					if (stat.isDirectory()) {
						await processImages(filePath, path.join(relativePath, file));
					} else if (/\.(png|jpg|jpeg)$/i.test(file)) {
						const destSubDir = path.join(destDir, relativePath);

						if (!fs.existsSync(destSubDir)) {
							fs.mkdirSync(destSubDir, { recursive: true });
						}

						await convertToWebP(filePath, destSubDir);
					}
				}
			};

			await processImages(imgDir);
		}
	};
}

async function convertToWebP(imgPath: string, destDir: string) {
	try {
		const filename = path.basename(imgPath);
		const webpPath = path.join(destDir, `${path.parse(filename).name}.webp`);

		if (fs.existsSync(webpPath)) {
			return;
		}

		await sharp(imgPath).webp({ quality: 80 }).toFile(webpPath);
		console.log(`Converted ${filename} to WebP`);
	} catch (err) {
		console.error(
			`Error converting ${path.basename(imgPath)} to WebP:`,
			err instanceof Error ? err.message : err
		);
	}
}
