import fs from "fs";
import path from "path";
import sharp from "sharp";

// Get project root directory
const projectRoot = path.resolve(process.cwd());

// Paths relative to project root
const srcFolder = path.resolve(projectRoot, "src");
const buildFolder = path.resolve(projectRoot, "dist");
const imgFolder = path.resolve(srcFolder, "img");
const imgFolderDest = path.resolve(buildFolder, "img");
const fontsFolder = path.resolve(srcFolder, "fonts");
const fontsFolderDest = path.resolve(buildFolder, "fonts");

// Helper function to check if a file is a font
function isFontFile(filename) {
	const fontExtensions = [".ttf", ".otf", ".woff", ".woff2"];
	return fontExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

// Helper function to check if a file is an image
function isImageFile(filename) {
	const imgExtensions = [".jpg", ".jpeg", ".png", ".gif", ".svg"];
	return imgExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

// Convert TTF to WOFF2 using ttf2woff2
async function convertTtfToWoff2(ttfFile, fontsFolderDest) {
	try {
		const filename = path.basename(ttfFile);
		const basename = filename.replace(".ttf", "");
		const woff2Path = path.join(fontsFolderDest, `${basename}.woff2`);

		// Read TTF file
		const ttfBuffer = await fs.promises.readFile(ttfFile);

		// Dynamically import ttf2woff2
		const ttf2woff2 = await import('ttf2woff2');
		
		// Convert TTF to WOFF2
		console.log(`Converting ${filename} to WOFF2...`);
		const woff2Buffer = ttf2woff2.default(ttfBuffer);
		
		// Write WOFF2 file
		await fs.promises.writeFile(woff2Path, woff2Buffer);
		console.log(`Converted ${filename} to WOFF2 successfully`);
		return true;
	} catch (error) {
		console.error(`Error converting ${path.basename(ttfFile)} to WOFF2:`, error.message);
		return false;
	}
}

// Convert image to WebP format
async function convertToWebP(imgPath, destDir) {
	try {
		const filename = path.basename(imgPath);
		const webpPath = path.join(destDir, `${path.parse(filename).name}.webp`);

		// Skip if already converted
		if (fs.existsSync(webpPath)) {
			return;
		}

		await sharp(imgPath)
			.webp({ quality: 80 })
			.toFile(webpPath);

		console.log(`Converted ${filename} to WebP`);
	} catch (err) {
		console.error(`Error converting ${path.basename(imgPath)} to WebP:`, err.message);
	}
}

// Process images in directory recursively (optimized)
async function processImagesInDir(dir, destDir) {
	try {
		if (!fs.existsSync(dir)) {
			console.log(`Image directory ${dir} does not exist, skipping processing`);
			return;
		}

		const files = await fs.promises.readdir(dir);
		const operations = [];

		for (const file of files) {
			const filePath = path.join(dir, file);
			const stats = await fs.promises.stat(filePath);
			const destPath = path.join(destDir, file);

			if (stats.isDirectory()) {
				// Create destination directory
				await fs.promises.mkdir(path.join(destDir, file), { recursive: true });

				// Process subdirectory recursively
				operations.push(processImagesInDir(filePath, path.join(destDir, file)));
			} else if (isImageFile(file)) {
				// Skip SVG files for WebP conversion
				if (!file.toLowerCase().endsWith('.svg')) {
					// Convert to WebP
					operations.push(convertToWebP(filePath, destDir));
				}
				// Copy original image
				operations.push(fs.promises.copyFile(filePath, destPath));
			}
		}

		// Wait for all operations to complete
		await Promise.all(operations);
	} catch (error) {
		console.error(`Error processing images in ${dir}:`, error.message);
	}
}

// Main function (optimized)
async function buildAssets() {
	console.log("Starting build assets process...");

	try {
		// Create necessary directories
		console.log("Creating build directories...");
		await fs.promises.mkdir(imgFolderDest, { recursive: true });
		await fs.promises.mkdir(fontsFolderDest, { recursive: true });

		// Parallel processing for better performance
		const tasks = [];

		// Process images (just copy them, Vite plugins will handle WebP)
		if (fs.existsSync(imgFolder)) {
			console.log("Processing images...");
			tasks.push(
				processImagesInDir(imgFolder, imgFolderDest).then(() => {
					console.log("Images processed successfully");
				})
			);
		}

		// Process fonts
		if (fs.existsSync(fontsFolder)) {
			console.log("Processing fonts...");
			tasks.push(
				(async () => {
					try {
						// Create fonts directory if it doesn't exist
						await fs.promises.mkdir(fontsFolderDest, { recursive: true });

						// Get all font files
						const fontFiles = await fs.promises.readdir(fontsFolder);
						const processPromises = [];
						let conversionCount = 0;

						for (const file of fontFiles) {
							if (isFontFile(file)) {
								const srcPath = path.join(fontsFolder, file);
								const destPath = path.join(fontsFolderDest, file);

								// Copy font file
								processPromises.push(
									(async () => {
										try {
											// Copy original font file
											await fs.promises.copyFile(srcPath, destPath);
											console.log(`Font ${file} copied successfully`);

											// Convert TTF to WOFF2 if applicable
											if (file.toLowerCase().endsWith(".ttf")) {
												const success = await convertTtfToWoff2(srcPath, fontsFolderDest);
												if (success) conversionCount++;
											}
										} catch (err) {
											console.error(`Error processing font ${file}:`, err);
										}
									})()
								);
							}
						}

						// Wait for all font processing to complete
						await Promise.all(processPromises);
						console.log(`Processed all fonts. Converted ${conversionCount} TTF files to WOFF2`);
					} catch (error) {
						console.error("Error processing fonts:", error.message);
					}
				})()
			);
		}

		// Copy SVG sprites if they exist
		const svgFolder = path.resolve(srcFolder, "svgicons");
		if (fs.existsSync(svgFolder)) {
			console.log("Copying SVG sprites...");
			tasks.push(
				(async () => {
					try {
						const imgDir = path.resolve(buildFolder, "img");
						await fs.promises.mkdir(imgDir, { recursive: true });

						// Get all SVG files
						const svgFiles = await fs.promises.readdir(svgFolder);
						const copyPromises = [];

						for (const file of svgFiles) {
							const srcPath = path.join(svgFolder, file);
							const destPath = path.join(imgDir, file);
							copyPromises.push(fs.promises.copyFile(srcPath, destPath));
						}

						await Promise.all(copyPromises);
						console.log("SVG sprites copied successfully");
					} catch (error) {
						console.error("Error copying SVG sprites:", error.message);
						throw error;
					}
				})()
			);
		}

		// Wait for all tasks to complete
		await Promise.all(tasks);
		console.log("Build assets process completed successfully!");
	} catch (err) {
		console.error("Error in build assets process:", err.message);
		process.exit(1);
	}
}

// Run the build process
buildAssets();
