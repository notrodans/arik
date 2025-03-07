/**
 * Plugin to handle script tag optimization
 */
export default function scriptOptimization() {
  return {
    name: "vite-plugin-script-optimization",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html: string) {
        // Remove duplicate script tags
        return html
          .replace(/\s+crossorigin(=["'][^"']*["'])?/g, '')
          .replace(/\s+type="module"/g, '')
          .replace(/<script /g, '<script defer ');
      }
    }
  };
}
