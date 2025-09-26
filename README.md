# Dropbox Gallery Viewer

A beautiful Chrome extension that transforms your Dropbox image folders into stunning galleries with favoriting capabilities.

## Features

- **Gallery View**: Transform Dropbox folders into beautiful image galleries
- **Favorites**: Mark your favorite images for quick access
- **Search**: Quickly find images by name
- **Lightbox Viewer**: Full-screen image viewing with keyboard navigation
- **Zoom**: Click to zoom in/out on images
- **Keyboard Shortcuts**:
  - `←` / `→` - Navigate between images
  - `Space` - Toggle favorite
  - `Escape` - Close viewer
- **Responsive Design**: Beautiful UI built with Svelte and Tailwind CSS

## Installation

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/kbosompem/dropbox-gallery.git
cd dropbox-gallery
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

### Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from the project

## Usage

1. **Sign in to Dropbox** in your browser
2. Navigate to any Dropbox folder containing images
3. Look for the **Gallery View** button (floating in bottom right)
4. Click to open the gallery
5. Click any image to view in lightbox mode
6. Use the heart icon to favorite images

## Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **Svelte** - Reactive UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool and dev server
- **Chrome Extensions Manifest V3** - Latest extension platform

## Project Structure

```
dropbox-gallery/
├── src/
│   ├── App.svelte          # Main app component
│   ├── lib/
│   │   ├── Gallery.svelte  # Image grid component
│   │   └── ImageViewer.svelte # Lightbox viewer
│   ├── content/            # Content scripts
│   │   ├── content.js      # Dropbox page integration
│   │   └── content.css     # Injected styles
│   └── background/
│       └── background.js   # Service worker
├── manifest.json           # Extension manifest
└── vite.config.js         # Build configuration
```

## Privacy

- All data is stored locally in your browser
- No external servers or tracking
- Works with your existing Dropbox authentication
- Open source and transparent

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for any purpose.

## Author

Created with ❤️ for the open source community