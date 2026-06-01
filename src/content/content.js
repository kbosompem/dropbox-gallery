let galleryInjected = false;
let currentUrl = window.location.href;

// Inject styles for the button and toast
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

  .gallery-view-btn:disabled {
    opacity: 0.7;
    cursor: wait;
  }

  .gallery-view-btn svg {
    width: 20px;
    height: 20px;
  }

  .gallery-view-btn .btn-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: gallery-btn-spin 0.6s linear infinite;
  }

  @keyframes gallery-btn-spin {
    to { transform: rotate(360deg); }
  }

  .dbx-gallery-toast {
    position: fixed;
    bottom: 80px;
    right: 30px;
    z-index: 10000;
    padding: 10px 20px;
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    opacity: 0;
    transform: translateY(10px);
    animation: dbx-toast-in 0.3s ease forwards;
  }

  .dbx-gallery-toast.toast-error {
    background: rgba(239, 68, 68, 0.95);
  }

  .dbx-gallery-toast.toast-info {
    background: rgba(102, 126, 234, 0.95);
  }

  .dbx-gallery-toast.toast-out {
    animation: dbx-toast-out 0.3s ease forwards;
  }

  @keyframes dbx-toast-in {
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes dbx-toast-out {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(10px); }
  }
  `;
  document.head.appendChild(style);
}

function showToast(message, type) {
  // Remove any existing toast
  const existing = document.querySelector('.dbx-gallery-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `dbx-gallery-toast toast-${type || 'info'}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function detectImageFolder() {
  // Check for Dropbox content thumbnails (from previews.dropbox.com etc)
  const thumbnails = document.querySelectorAll('img[src*="previews.dropbox"], img[src*="dropboxusercontent"]');
  if (thumbnails.length > 2) return true;

  // Also check for image file links
  const imageLinks = document.querySelectorAll(
    'a[href*=".jpg"], a[href*=".jpeg"], a[href*=".png"], a[href*=".gif"], a[href*=".webp"]'
  );
  return imageLinks.length > 2;
}

function extractImages() {
  const images = [];
  const seenNames = new Set();
  const imageExtPattern = /\.(jpg|jpeg|png|gif|webp)$/i;

  // Strategy: find all <a> links to image files in the file list,
  // then find the associated thumbnail <img> for each.
  // The <a> gives us the filename and file path.
  // The <img> gives us a working thumbnail URL.
  const allLinks = document.querySelectorAll('a[href]');

  allLinks.forEach(link => {
    const href = link.href || '';
    if (!href) return;

    // Must be a Dropbox link to an image file
    let urlObj;
    try { urlObj = new URL(href); } catch { return; }
    if (urlObj.hostname !== 'www.dropbox.com') return;

    // Extract filename from the link text or href path
    const linkText = link.textContent.trim();
    const pathFilename = decodeURIComponent(urlObj.pathname.split('/').pop() || '');

    // The filename must have an image extension
    const filename = (imageExtPattern.test(linkText) ? linkText : null)
                  || (imageExtPattern.test(pathFilename) ? pathFilename : null);
    if (!filename) return;

    // Dedup by filename
    const nameKey = filename.toLowerCase();
    if (seenNames.has(nameKey)) return;

    // Find the thumbnail <img> associated with this link.
    // Walk up to the file row, then find the preview thumbnail inside it.
    const row = link.closest('tr, li, [role="listitem"], [role="row"], [role="option"]')
                || link.closest('[class*="file"], [class*="item"]')
                || link.parentElement?.parentElement;
    if (!row) return;

    // Look for a thumbnail image from previews.dropbox.com in this row
    let thumbnailUrl = '';
    const imgs = row.querySelectorAll('img');
    for (const img of imgs) {
      const src = img.src || '';
      if (src.includes('previews.dropbox.com') || src.includes('dropboxusercontent.com')) {
        thumbnailUrl = src;
        break;
      }
    }

    // The file path from the link (e.g. /home/Camera%20Uploads/file.jpg or /preview/file.jpg)
    const filePath = urlObj.pathname;

    seenNames.add(nameKey);
    images.push({
      thumbnail: thumbnailUrl,
      full: thumbnailUrl, // will be upgraded to high-res by the overlay via fetch
      filePath: filePath,
      name: filename,
      id: btoa(filename).replace(/[+=\/]/g, '').substring(0, 16)
    });
  });

  return images;
}

function extractFilename(url) {
  try {
    const path = new URL(url).pathname;
    const filename = path.split('/').pop();
    if (filename && filename.includes('.')) {
      return decodeURIComponent(filename);
    }
  } catch (e) {
    // Malformed URL - fall through to regex fallback
  }

  const match = url.match(/\/([^/]+\.(jpg|jpeg|png|gif|webp))/i);
  if (match) {
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  }

  return 'Image';
}

function logExtractedImages(images) {
  console.log('[Gallery] Extracted', images.length, 'images:');
  images.slice(0, 3).forEach((img, i) => {
    console.log('[Gallery]', i, {
      name: img.name,
      filePath: img.filePath,
      thumbnail: img.thumbnail?.substring(0, 120),
      full: img.full?.substring(0, 120)
    });
  });
}

function openGalleryOverlay(images) {
  // Also store in chrome.storage for the popup to access
  try {
    chrome.storage.local.set({
      galleryImages: images,
      folderName: document.title,
      currentFolder: window.location.href
    });
  } catch (e) {
    // Non-critical - popup just won't have data
  }

  if (window.dropboxGallery) {
    window.dropboxGallery.show(images);
  } else {
    showToast('Gallery failed to initialize. Try reloading the page.', 'error');
  }
}

function injectGalleryButton() {
  // Prevent duplicate buttons
  if (galleryInjected || document.getElementById('dropbox-gallery-btn')) return;

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
    // Show loading state
    button.disabled = true;
    const originalContent = button.innerHTML;
    button.innerHTML = '';
    const spinner = document.createElement('div');
    spinner.className = 'btn-spinner';
    button.appendChild(spinner);
    const loadingText = document.createTextNode(' Opening...');
    button.appendChild(loadingText);

    try {
      const images = extractImages();
      logExtractedImages(images);
      if (images.length > 0) {
        openGalleryOverlay(images);
      } else {
        showToast('No images found in this folder', 'error');
      }
    } finally {
      // Restore button after short delay
      setTimeout(() => {
        button.innerHTML = originalContent;
        button.disabled = false;
      }, 1000);
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
