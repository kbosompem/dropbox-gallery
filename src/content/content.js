let galleryInjected = false;

function detectImageFolder() {
  const images = document.querySelectorAll('img[src*="thumbnails"], img[src*="dropbox.com"]');
  const fileLinks = document.querySelectorAll('a[href*=".jpg"], a[href*=".jpeg"], a[href*=".png"], a[href*=".gif"], a[href*=".webp"]');

  return images.length > 2 || fileLinks.length > 2;
}

function extractImages() {
  const images = [];

  const imgElements = document.querySelectorAll('img[src*="thumbnails"], img[src*="dropbox.com"]');
  imgElements.forEach(img => {
    const fullSrc = img.src.replace(/w=\d+&h=\d+/, 'w=1920&h=1080').replace('/thumbnails/', '/files/');
    const filename = img.alt || img.title || fullSrc.split('/').pop().split('?')[0];

    images.push({
      thumbnail: img.src,
      full: fullSrc,
      name: filename,
      id: btoa(fullSrc).replace(/=/g, '').substring(0, 16)
    });
  });

  const links = document.querySelectorAll('a[href*=".jpg"], a[href*=".jpeg"], a[href*=".png"], a[href*=".gif"], a[href*=".webp"]');
  links.forEach(link => {
    const href = link.href;
    const filename = link.textContent || href.split('/').pop().split('?')[0];

    if (!images.find(img => img.full === href)) {
      images.push({
        thumbnail: href,
        full: href,
        name: filename,
        id: btoa(href).replace(/=/g, '').substring(0, 16)
      });
    }
  });

  return images;
}

function injectGalleryButton() {
  if (galleryInjected) return;

  const toolbar = document.querySelector('[role="toolbar"], .toolbar, .header-actions') ||
                   document.querySelector('header') ||
                   document.body;

  const button = document.createElement('button');
  button.id = 'dropbox-gallery-btn';
  button.className = 'gallery-view-btn';
  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
    Gallery View
  `;

  button.addEventListener('click', () => {
    const images = extractImages();
    if (images.length > 0) {
      chrome.runtime.sendMessage({
        action: 'openGallery',
        images: images,
        folderName: document.title
      });
    } else {
      alert('No images found in this folder');
    }
  });

  toolbar.appendChild(button);
  galleryInjected = true;
}

function checkAndInject() {
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

setTimeout(checkAndInject, 1000);
setTimeout(checkAndInject, 3000);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getImages') {
    sendResponse({ images: extractImages() });
  }
});