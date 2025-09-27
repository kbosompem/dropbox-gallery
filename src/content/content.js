let galleryInjected = false;
let currentUrl = window.location.href;

// Inject styles for the button
function injectGalleryStyles() {
  if (document.getElementById('dropbox-gallery-styles')) return;

  const style = document.createElement('style');
  style.id = 'dropbox-gallery-styles';
  style.textContent = `
  .gallery-view-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    margin: 0 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 9999;
  }

  .gallery-view-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  }

  .gallery-view-btn svg {
    width: 20px;
    height: 20px;
  }
  `;
  document.head.appendChild(style);
}

function detectImageFolder() {
  const images = document.querySelectorAll('img[src*="thumbnails"], img[src*="dropbox.com"]');
  const fileLinks = document.querySelectorAll('a[href*=".jpg"], a[href*=".jpeg"], a[href*=".png"], a[href*=".gif"], a[href*=".webp"]');

  return images.length > 2 || fileLinks.length > 2;
}

function extractImages() {
  const images = [];
  const seenUrls = new Set();

  // Function to get better quality image URL
  function getDirectUrl(src) {
    if (src.includes('previews.dropbox.com')) {
      // For preview URLs, try to get larger size
      let url = src;
      // Replace size_mode to get larger images
      url = url.replace(/size_mode=\d+/g, 'size_mode=5');
      // Remove width/height constraints
      url = url.replace(/[?&](w|h)=\d+/g, '');
      return url;
    }

    // For regular dropbox.com URLs
    if (src.includes('dropbox.com')) {
      let url = src;
      // Remove size parameters
      url = url.replace(/[?&](w|h|size|fit|size_mode)=[^&]*/g, '');
      // Clean up URL
      url = url.replace(/[?&]+$/, '');
      // Add raw parameter for direct image access
      if (!url.includes('raw=')) {
        url += (url.includes('?') ? '&' : '?') + 'raw=1';
      }
      return url;
    }

    return src;
  }

  // Extract images from thumbnail elements
  const imgElements = document.querySelectorAll('img[src*="dropbox"], img[src*="preview"]');
  imgElements.forEach(img => {
    const fullSrc = getDirectUrl(img.src);
    const filename = img.alt || img.title || extractFilename(img.src);

    if (!seenUrls.has(fullSrc)) {
      seenUrls.add(fullSrc);
      images.push({
        thumbnail: img.src,
        full: fullSrc,
        name: filename,
        id: btoa(fullSrc + filename).replace(/[+=\/]/g, '').substring(0, 16)
      });
    }
  });

  // Extract from direct image links
  const links = document.querySelectorAll('a[href*=".jpg"], a[href*=".jpeg"], a[href*=".png"], a[href*=".gif"], a[href*=".webp"], a[href*=".JPG"], a[href*=".JPEG"], a[href*=".PNG"]');
  links.forEach(link => {
    const fullSrc = getDirectUrl(link.href);
    const filename = link.textContent.trim() || extractFilename(link.href);

    if (!seenUrls.has(fullSrc)) {
      seenUrls.add(fullSrc);
      images.push({
        thumbnail: fullSrc,
        full: fullSrc,
        name: filename,
        id: btoa(fullSrc + filename).replace(/[+=\/]/g, '').substring(0, 16)
      });
    }
  });

  return images;
}

function extractFilename(url) {
  try {
    // Try to extract filename from URL
    const path = new URL(url).pathname;
    const filename = path.split('/').pop();
    if (filename && filename.includes('.')) {
      return decodeURIComponent(filename);
    }
  } catch (e) {
    // Fallback for malformed URLs
  }

  // Fallback: extract from the end of the URL
  const match = url.match(/\/([^/]+\.(jpg|jpeg|png|gif|webp))/i);
  if (match) {
    return decodeURIComponent(match[1]);
  }

  return 'Image';
}

async function openGalleryInNewTab(images, folderName) {
  try {
    // Store image data in chrome storage for the new tab to access
    await chrome.storage.local.set({
      galleryImages: images,
      folderName: folderName || document.title
    });

    // Open gallery in new tab
    const galleryUrl = chrome.runtime.getURL('gallery.html');
    window.open(galleryUrl, '_blank');
  } catch (error) {
    console.error('Failed to open gallery:', error);
    alert('Failed to open gallery. Please try again.');
  }
}

function injectGalleryButton() {
  if (galleryInjected) return;

  const toolbar = document.querySelector('[role="toolbar"], .toolbar, .header-actions') ||
                   document.querySelector('header') ||
                   document.body;

  const button = document.createElement('button');
  button.id = 'dropbox-gallery-btn';
  button.className = 'gallery-view-btn';

  // Create SVG for button
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "20");
  svg.setAttribute("height", "20");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");

  // Create rectangles for grid icon
  const rects = [
    { x: "3", y: "3", width: "7", height: "7" },
    { x: "14", y: "3", width: "7", height: "7" },
    { x: "14", y: "14", width: "7", height: "7" },
    { x: "3", y: "14", width: "7", height: "7" }
  ];

  rects.forEach(rectData => {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", rectData.x);
    rect.setAttribute("y", rectData.y);
    rect.setAttribute("width", rectData.width);
    rect.setAttribute("height", rectData.height);
    svg.appendChild(rect);
  });

  button.appendChild(svg);

  const text = document.createTextNode(' Gallery View');
  button.appendChild(text);

  button.addEventListener('click', async () => {
    const images = extractImages();
    if (images.length > 0) {
      await openGalleryInNewTab(images, document.title);
    } else {
      alert('No images found in this folder');
    }
  });

  toolbar.appendChild(button);
  galleryInjected = true;
}

function checkAndInject() {
  // Reset if URL changed (folder navigation)
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    const existingBtn = document.getElementById('dropbox-gallery-btn');
    if (existingBtn) {
      existingBtn.remove();
    }
    galleryInjected = false;
  }

  if (detectImageFolder() && !galleryInjected) {
    injectGalleryButton();
  }
}

const observer = new MutationObserver(() => {
  checkAndInject();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initialize
injectGalleryStyles();
setTimeout(checkAndInject, 1000);
setTimeout(checkAndInject, 3000);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getImages') {
    sendResponse({ images: extractImages() });
  }
});