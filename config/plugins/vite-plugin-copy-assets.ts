import fs from "fs";
import path from "path";

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
        console.log("Copying assets to dist folder...");

        // Copy images
        const srcImgDir = path.resolve("src/img");
        const distImgDir = path.resolve(`${buildFolder}/img`);

        if (fs.existsSync(srcImgDir)) {
          await fs.promises.mkdir(distImgDir, { recursive: true });
          await copyDir(srcImgDir, distImgDir);
          console.log("Copied src/img to dist/img successfully");
        }

        // Copy fonts
        const srcFontsDir = path.resolve("src/fonts");
        const distFontsDir = path.resolve(`${buildFolder}/fonts`);

        if (fs.existsSync(srcFontsDir)) {
          await fs.promises.mkdir(distFontsDir, { recursive: true });
          await copyDir(srcFontsDir, distFontsDir);
          console.log("Copied src/fonts to dist/fonts successfully");
        }
      } catch (error) {
        console.error("Error copying assets:", error);
      }
    }
  };
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
