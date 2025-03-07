/**
 * Plugin to handle HTML template modifications
 */
export default function htmlTemplate() {
  return {
    name: "vite-plugin-html-template",
    transformIndexHtml: {
      order: "pre",
      handler(html: string) {
        // Fix script tags to use modules for app.min.js
        return html.replace(
          "</body>",
          `<script type="module" src="js/app.js"></script>\n</body>`
        );
      }
    }
  };
}
