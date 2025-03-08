/**
 * Plugin to update HTML with picture tags for WebP support
 */
export default function webpHtmlPlugin() {
	return {
		name: "vite-plugin-webp-html",
		apply: "build",

		// Hook to transform HTML with picture tags
		transformIndexHtml: {
			order: "post",
			handler(html: string) {
				if (process.argv.includes("--nowebp")) {
					return html;
				}

				return processHtml(html);
			}
		}
	};

	/**
	 * Process HTML content and replace img tags with picture tags
	 */
	function processHtml(html: string) {
		// Match both single-line and multi-line img tags
		// This regex captures img tags, even those spanning multiple lines
		const imgRegex = /<img([^>]*?)src=['"]([^'"]+?)['"]([^>]*?)>/gs;

		return html.replace(imgRegex, (match, beforeSrc, src, afterSrc) => {
			// Skip SVG images
			if (src.toLowerCase().endsWith(".svg") || src.includes("data:image")) {
				return match;
			}

			// Skip already processed images in picture tags
			if (match.includes("<source") || match.includes("picture")) {
				return match;
			}

			// Create WebP path
			const webpSrc = src.substring(0, src.lastIndexOf(".")) + ".webp";

			// Keep any class attributes
			const classMatch = match.match(/class=["']([^"']+)["']/);
			const classAttr = classMatch ? ` class="${classMatch[1]}"` : "";

			// Combine all attributes
			const imgAttrs = (beforeSrc + afterSrc).replace(/class=["'][^"']+["']/, "");

			// Create picture tag with WebP source
			return `<picture>
        <source srcset="${webpSrc}" type="image/webp">
        <img${classAttr} ${imgAttrs} src="${src}">
      </picture>`;
		});
	}
}
