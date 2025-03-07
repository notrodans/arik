# Modern Web Project with Vite

This project has been migrated from Webpack/Gulp to Vite for improved performance and developer experience.

## Features

- **Vite** - Fast, modern frontend build tool
- **SCSS/SASS** - Preprocessor scripting language
- **Font Processing** - Automatically converts fonts to WOFF2 format with original fallback
- **Image Optimization** - Processes images and generates WebP versions with `<picture>` tags
- **SVG Sprites** - Support for SVG sprite generation
- **React Support** - Optional React integration
- **Component Libraries** - Swiper, Tippy.js, NoUISlider, Isotope, SimpleBar

## Getting Started

### Prerequisites

- Node.js (current LTS version recommended)

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

### Build for Production

```bash
# Create a production build
npm run build
```

### Preview Production Build

```bash
# Preview the production build
npm run preview
```

### Font Processing

```bash
# Process fonts (converts original formats to WOFF2 and generates CSS)
npm run fonts
```

## Project Structure

- **/src** - Source files
  - **/fonts** - Font files (original formats)
  - **/img** - Image files
  - **/js** - JavaScript files
  - **/scss** - SCSS styles
  - **/svgicons** - SVG sprites
- **/dist** - Build output
- **/plugins** - Custom Vite plugins
- **/scripts** - Utility scripts

## Build Options

The build process supports several flags that can be added to the commands:

- `--nowebp` - Disables WebP image generation
- `--noimgopt` - Disables image optimization

Example:

```bash
npm run build -- --nowebp
```

## Key Features

### WebP Support

The build automatically detects WebP support in the browser and adds either `webp` or `no-webp` class to the HTML tag, enabling proper CSS styling. Images are automatically wrapped in `<picture>` tags with WebP and original format sources.

### Font Processing

Fonts are processed in two formats:

1. Original font (TTF, OTF, etc.)
2. WOFF2 (optimized web format)

Font weights are automatically determined from filenames:

- `FontFamily-Bold.ttf` → weight 700
- `FontFamily-700.ttf` → weight 700
- `FontFamily-Medium.ttf` → weight 500

### Optional Features

The project includes many optional features that can be enabled by uncommenting the relevant sections in the main JS file (`src/js/app.js`):

- Spoilers system
- Tabs functionality
- "Show More" functionality
- Ripple effects
- Popup system
- Mouse parallax
- Form validation
- and more...
