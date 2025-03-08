import fs from "fs";
import path from "path";
import sharp from "sharp";
import { createRequire } from "module";

// Helper function to check if a file is a font
function isFontFile(filename: string): boolean {
	const fontExtensions = [".ttf", ".otf", ".woff", ".woff2"];
	return fontExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

// Helper function to check if a file is an image
function isImageFile(filename: string): boolean {
	const imgExtensions = [".jpg", ".jpeg", ".png", ".gif", ".svg"];
	return imgExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

/*
// Convert TTF to WOFF2 using ttf2woff2
async function convertTtfToWoff2(ttfFile: string, fontsFolderDest: string): Promise<boolean> {
  try {
    const filename = path.basename(ttfFile);
    const basename = filename.replace(".ttf", "");
    const woff2Path = path.join(fontsFolderDest, `${basename}.woff2`);

    // Read TTF file
    const ttfBuffer = await fs.promises.readFile(ttfFile);

    // Use createRequire to import CommonJS module
    const require = createRequire(import.meta.url);
    const ttf2woff2 = require('ttf2woff2');
    
    // Convert TTF to WOFF2
    console.log(`Converting ${filename} to WOFF2...`);
    const woff2Buffer = ttf2woff2(ttfBuffer);
    
    // Write WOFF2 file directly
    await fs.promises.writeFile(woff2Path, woff2Buffer);
    
    // Add short delay and verify
    await new Promise(resolve => setTimeout(resolve, 50));
    await fs.promises.access(woff2Path, fs.constants.R_OK);
    
    console.log(`Converted ${filename} to WOFF2 successfully`);
    return true;
  } catch (error) {
    console.error(`Error converting ${path.basename(ttfFile)} to WOFF2:`, error.message);
    return false;
  }
}
*/

// Convert image to WebP format
async function convertToWebP(imgPath: string, destDir: string): Promise<void> {
	try {
		const filename = path.basename(imgPath);
		const webpPath = path.join(destDir, `${path.parse(filename).name}.webp`);

		// Skip if already converted
		if (fs.existsSync(webpPath)) {
			return;
		}

		await sharp(imgPath).webp({ quality: 80 }).toFile(webpPath);

		console.log(`Converted ${filename} to WebP`);
	} catch (err) {
		console.error(`Error converting ${path.basename(imgPath)} to WebP:`, err.message);
	}
}

/**
 * Plugin to handle asset copying with improved error handling
 * @param isBuild - Whether we're in build mode
 * @param buildFolder - The output directory for the build
 */
export default function copyAssets(isBuild: boolean, buildFolder: string) {
	return {
		name: "vite-plugin-copy-assets",
		apply: "build",

		async closeBundle() {
			if (!isBuild) return;

			try {
				console.log("Copying and processing assets...");

				// Create destination directories
				const distImgDir = path.resolve(`${buildFolder}/img`);
				const distFontsDir = path.resolve(`${buildFolder}/fonts`);
				await fs.promises.mkdir(distImgDir, { recursive: true });
				await fs.promises.mkdir(distFontsDir, { recursive: true });

				// Process images
				const srcImgDir = path.resolve("src/img");
				if (fs.existsSync(srcImgDir)) {
					await processImagesInDir(srcImgDir, distImgDir);
					console.log("Processed src/img to dist/img successfully");
				}

				// Process fonts
				const srcFontsDir = path.resolve("src/fonts");
				if (fs.existsSync(srcFontsDir)) {
					await processFontsInDir(srcFontsDir, distFontsDir);
					console.log("Processed src/fonts to dist/fonts successfully");
				}
			} catch (error) {
				console.error("Error processing assets:", error);
			}
		}
	};
}

async function processImagesInDir(dir: string, destDir: string): Promise<void> {
	try {
		// First copy all files
		await copyDir(dir, destDir);

		// Then process conversions
		const files = await fs.promises.readdir(dir);
		const operations = [];

		for (const file of files) {
			const filePath = path.join(dir, file);
			const stats = await fs.promises.stat(filePath);

			if (stats.isDirectory()) {
				operations.push(processImagesInDir(filePath, path.join(destDir, file)));
			} else if (isImageFile(file) && !file.toLowerCase().endsWith(".svg")) {
				operations.push(convertToWebP(filePath, destDir));
			}
		}

		await Promise.all(operations);
	} catch (error) {
		console.error(`Error processing images in ${dir}:`, error.message);
	}
}

async function processFontsInDir(dir: string, destDir: string): Promise<void> {
	try {
		// First copy all files
		await copyDir(dir, destDir);

		/*
    // Then process conversions
    const files = await fs.promises.readdir(dir);
    const processPromises = [];
    let conversionCount = 0;

    for (const file of files) {
      if (isFontFile(file) && file.toLowerCase().endsWith(".ttf")) {
        const srcPath = path.join(dir, file);
        processPromises.push(
          (async () => {
            const success = await convertTtfToWoff2(srcPath, destDir);
            if (success) conversionCount++;
          })()
        );
      }
    }

    await Promise.all(processPromises);
    console.log(`Processed all fonts. Converted ${conversionCount} TTF files to WOFF2`);
    */
	} catch (error) {
		console.error("Error processing fonts:", error.message);
	}
}

/**
 * Helper function to recursively copy a directory
 */
async function copyDir(src: string, dest: string) {
	const entries = await fs.promises.readdir(src, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);

		if (entry.isDirectory()) {
			await fs.promises.mkdir(destPath, { recursive: true });
			await copyDir(srcPath, destPath);
		} else {
			await fs.promises.copyFile(srcPath, destPath);
		}
	}
}
