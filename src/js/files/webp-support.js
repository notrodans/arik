/**
 * Check if browser supports WebP format and add webp or no-webp class to HTML
 */
export function isWebp() {
	// Check WebP support
	function testWebP(callback) {
		const webP = new Image();
		webP.onload = webP.onerror = function () {
			callback(webP.height === 2);
		};
		webP.src =
			"data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
	}

	// Add class to HTML
	testWebP(function (support) {
		const className = support ? "webp" : "no-webp";
		document.documentElement.classList.add(className);
	});
}
