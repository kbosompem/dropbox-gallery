# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build extension for production (required after code changes)
npm run preview      # Preview production build
npm run check        # Run Svelte type checking
```

### Chrome Extension Loading
After building, the extension needs to be reloaded in Chrome:
1. Navigate to `chrome://extensions/`
2. Click reload button on the "Dropbox Gallery Viewer" extension
3. Test on Dropbox folders containing images

## Architecture

This is a Chrome Extension (Manifest V3) that transforms Dropbox image folders into galleries. The extension uses a **new tab approach** rather than overlays to enable proper browser fullscreen functionality.

### Key Components

**Content Script Integration** (`src/content/content.js`):
- Injects a floating "Gallery View" button on Dropbox pages with images
- Extracts image data from Dropbox DOM elements
- Transforms Dropbox URLs to higher quality versions using size_mode and raw parameters
- Opens gallery in new tab using chrome.storage.local to pass image data

**Standalone Gallery** (`gallery.html` + `gallery.js`):
- Operates as web accessible resource in new tab
- Implements full gallery functionality: navigation, favorites, zoom, fullscreen
- Uses Chrome Storage API for data persistence between content script and gallery
- DropboxGallery class handles all gallery state and interactions

**Content Security Policy Compliance**:
- All JavaScript must be in external files (no inline scripts)
- DOM manipulation uses createElement, not innerHTML
- SVG elements created with createElementNS

### Data Flow
1. Content script detects images on Dropbox page
2. User clicks "Gallery View" button
3. Image data stored in chrome.storage.local
4. New tab opened with gallery.html
5. Gallery.js reads data from storage and renders gallery

### Chrome Extension Specifics
- **Manifest V3** with service worker background script
- **Host permissions** for dropbox.com domain only
- **Web accessible resources** allow gallery.html/gallery.js to be loaded in new tabs
- **Storage permission** for favorites and inter-tab communication

### Build System
- **Vite** with `@crxjs/vite-plugin` for Chrome extension support
- **Svelte** for popup UI components (though main gallery uses vanilla JS)
- **Tailwind CSS** for styling
- Build outputs to `dist/` directory which is loaded as unpacked extension

### Important Constraints
- No CSS references in manifest.json (causes build errors - remove manually if added)
- All scripts must comply with CSP (no inline JavaScript)
- Gallery opens in new tab to bypass popup size limitations for fullscreen
- Image URL transformation required for Dropbox high-quality images