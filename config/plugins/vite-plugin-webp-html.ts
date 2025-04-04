import * as cheerio from "cheerio";

export default function webpHtmlPlugin() {
	return {
		name: "vite-plugin-webp-html",
		apply: "build",

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

	function processHtml(html: string) {
		const $ = cheerio.load(html);

		$("img").each(function () {
			const $img = $(this);
			const src = $img.attr("src");

			if (!src) {
				return;
			}

			if (src.toLowerCase().endsWith(".svg") || src.includes("data:image")) {
				return;
			}

			if ($img.parents("picture").length > 0) {
				return;
			}

			const webpSrc = replaceImageExtensions(src);

			const $picture = $("<picture>");
			$picture.append(`<source srcset="${webpSrc}" type="image/webp">`);

			const $newImg = $img.clone().removeAttr("src");
			$newImg.attr("src", src);
			$picture.append($newImg);

			$img.replaceWith($picture);
		});

		return $.html();
	}
}

function replaceImageExtensions(srcset: string): string {
	return srcset.replace(/\.(png|jpe?g|gif|bmp|tiff)/gi, ".webp");
}
