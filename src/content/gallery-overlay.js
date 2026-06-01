// Inject gallery overlay styles
(function injectOverlayStyles() {
  if (document.getElementById('dropbox-gallery-overlay-styles')) return;
  const style = document.createElement('style');
  style.id = 'dropbox-gallery-overlay-styles';
  style.textContent = `
#dropbox-gallery-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 2147483647 !important;
  background: rgba(0, 0, 0, 0.95) !important;
  backdrop-filter: blur(10px) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  animation: galleryFadeIn 0.3s ease-out !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
}
.gallery-backdrop {
  position: relative !important;
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
.gallery-control-btn {
  padding: 12px !important;
  border-radius: 50% !important;
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px) !important;
  border: none !important;
  color: white !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  z-index: 10 !important;
  line-height: 0 !important;
}
.gallery-control-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: scale(1.1) !important;
}
.gallery-control-btn:focus-visible {
  outline: 2px solid #667eea !important;
  outline-offset: 2px !important;
}
.gallery-close {
  position: absolute !important;
  top: 20px !important;
  right: 20px !important;
}
.gallery-top-controls {
  position: absolute !important;
  top: 20px !important;
  left: 20px !important;
  display: flex !important;
  gap: 10px !important;
  z-index: 10 !important;
}
.gallery-nav-btn {
  position: absolute !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  padding: 12px !important;
  border-radius: 50% !important;
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px) !important;
  border: none !important;
  color: white !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  z-index: 10 !important;
  line-height: 0 !important;
}
.gallery-nav-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: translateY(-50%) scale(1.1) !important;
}
.gallery-nav-btn:disabled {
  opacity: 0.3 !important;
  cursor: default !important;
}
.gallery-nav-btn:focus-visible {
  outline: 2px solid #667eea !important;
  outline-offset: 2px !important;
}
.gallery-prev { left: 20px !important; }
.gallery-next { right: 20px !important; }
.gallery-image-container {
  max-width: 90vw !important;
  max-height: 90vh !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  position: relative !important;
}
.gallery-main-image {
  max-width: 100% !important;
  max-height: 85vh !important;
  object-fit: contain !important;
  border-radius: 8px !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5) !important;
  cursor: zoom-in !important;
  transition: all 0.3s ease !important;
}
.gallery-main-image.gallery-zoomed {
  cursor: zoom-out !important;
  transform: scale(1.5) !important;
}
.gallery-main-image.gallery-loading-img {
  opacity: 0.3 !important;
}
.gallery-image-loading-overlay {
  position: absolute !important;
  inset: 0 !important;
  display: none !important;
  align-items: center !important;
  justify-content: center !important;
  pointer-events: none !important;
}
.gallery-image-loading-overlay.visible {
  display: flex !important;
}
.gallery-loading-spinner {
  width: 40px !important;
  height: 40px !important;
  border: 3px solid rgba(255, 255, 255, 0.2) !important;
  border-top-color: white !important;
  border-radius: 50% !important;
  animation: gallerySpinAnim 0.8s linear infinite !important;
}
.gallery-image-error {
  flex-direction: column !important;
  align-items: center !important;
  gap: 16px !important;
  color: rgba(255, 255, 255, 0.6) !important;
  padding: 40px !important;
}
.gallery-image-error svg { opacity: 0.5 !important; }
.gallery-image-error p { font-size: 16px !important; color: rgba(255, 255, 255, 0.6) !important; margin: 0 !important; }
.gallery-retry-btn {
  padding: 8px 20px !important;
  border-radius: 8px !important;
  background: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: white !important;
  cursor: pointer !important;
  font-size: 14px !important;
  transition: background 0.2s !important;
  font-family: inherit !important;
}
.gallery-retry-btn:hover { background: rgba(255, 255, 255, 0.25) !important; }
.gallery-zoom-indicator {
  position: absolute !important;
  top: 10px !important;
  right: 10px !important;
  background: rgba(0, 0, 0, 0.7) !important;
  color: white !important;
  padding: 4px 10px !important;
  border-radius: 12px !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  opacity: 0 !important;
  transition: opacity 0.2s !important;
  pointer-events: none !important;
}
.gallery-zoom-indicator.visible { opacity: 1 !important; }
.gallery-bottom-info {
  position: absolute !important;
  bottom: 20px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  gap: 10px !important;
}
.gallery-dots {
  display: flex !important;
  gap: 8px !important;
  max-width: 80vw !important;
  overflow-x: auto !important;
  padding: 10px !important;
}
.gallery-dot {
  width: 8px !important;
  height: 8px !important;
  border-radius: 50% !important;
  background: rgba(255, 255, 255, 0.4) !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  flex-shrink: 0 !important;
  padding: 0 !important;
}
.gallery-dot:hover { background: rgba(255, 255, 255, 0.6) !important; }
.gallery-dot:focus-visible { outline: 2px solid #667eea !important; outline-offset: 2px !important; }
.gallery-dot.active {
  width: 32px !important;
  border-radius: 16px !important;
  background: white !important;
}
.gallery-info-text {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px) !important;
  padding: 8px 16px !important;
  border-radius: 20px !important;
  color: white !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  white-space: nowrap !important;
}
.gallery-info-text p { margin: 0 !important; color: white !important; }
.gallery-toast-container {
  position: absolute !important;
  top: 20px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  z-index: 20 !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
  pointer-events: none !important;
}
.gallery-toast {
  padding: 10px 20px !important;
  border-radius: 8px !important;
  color: white !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  backdrop-filter: blur(10px) !important;
  opacity: 0 !important;
  transform: translateY(-10px) !important;
  animation: galleryToastIn 0.3s ease forwards !important;
  pointer-events: auto !important;
}
.gallery-toast-info { background: rgba(102, 126, 234, 0.9) !important; }
.gallery-toast-error { background: rgba(239, 68, 68, 0.9) !important; }
.gallery-toast-out { animation: galleryToastOut 0.3s ease forwards !important; }
.gallery-help-modal-overlay {
  position: absolute !important;
  inset: 0 !important;
  background: rgba(0, 0, 0, 0.8) !important;
  display: none !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 30 !important;
}
.gallery-help-modal-overlay.visible { display: flex !important; }
.gallery-help-modal {
  background: #1a1a2e !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 16px !important;
  padding: 32px !important;
  max-width: 420px !important;
  width: 90vw !important;
  color: white !important;
}
.gallery-help-modal h2 { font-size: 20px !important; font-weight: 600 !important; margin-bottom: 20px !important; color: white !important; }
.gallery-help-row {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  padding: 8px 0 !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}
.gallery-help-row:last-of-type { border-bottom: none !important; }
.gallery-help-key {
  display: inline-block !important;
  background: rgba(255, 255, 255, 0.12) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 6px !important;
  padding: 3px 10px !important;
  font-size: 13px !important;
  font-family: monospace !important;
  min-width: 32px !important;
  text-align: center !important;
  color: white !important;
}
.gallery-help-desc { color: rgba(255, 255, 255, 0.7) !important; font-size: 14px !important; }
.gallery-help-close-hint { text-align: center !important; margin-top: 16px !important; color: rgba(255, 255, 255, 0.4) !important; font-size: 13px !important; }
@keyframes galleryFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes gallerySpinAnim { to { transform: rotate(360deg); } }
@keyframes galleryToastIn { to { opacity: 1; transform: translateY(0); } }
@keyframes galleryToastOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-10px); } }
#dropbox-gallery-overlay:fullscreen { background: rgba(0, 0, 0, 1) !important; }
#dropbox-gallery-overlay:fullscreen .gallery-main-image { max-height: 95vh !important; }
.gallery-dots::-webkit-scrollbar { height: 4px !important; }
.gallery-dots::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1) !important; border-radius: 2px !important; }
.gallery-dots::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3) !important; border-radius: 2px !important; }
.gallery-dots::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.5) !important; }
  `;
  document.head.appendChild(style);
})();

// Gallery overlay that gets injected into the Dropbox page
class DropboxGalleryOverlay {
  constructor() {
    this.images = [];
    this.currentIndex = 0;
    this.favorites = new Set();
    this.isVisible = false;
    this.isFullscreen = false;
    this.isZoomed = false;
    this.helpVisible = false;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.loadFavorites();
  }

  async loadFavorites() {
    try {
      const result = await chrome.storage.local.get(['favorites']);
      if (result.favorites) {
        this.favorites = new Set(result.favorites);
      }
    } catch (e) {
      console.log('Could not load favorites:', e);
    }
  }

  async saveFavorites() {
    try {
      await chrome.storage.local.set({ favorites: Array.from(this.favorites) });
    } catch (e) {
      console.log('Could not save favorites:', e);
    }
  }

  show(images, startIndex = 0) {
    this.images = images;
    this.currentIndex = startIndex;
    this.isVisible = true;
    this.isZoomed = false;
    this.helpVisible = false;
    this.render();
    this.bindEvents();
    // Prevent body scroll while overlay is open
    document.body.style.overflow = 'hidden';
  }

  hide() {
    this.isVisible = false;
    this.unbindEvents();
    const overlay = document.getElementById('dropbox-gallery-overlay');
    if (overlay) {
      overlay.remove();
    }
    document.body.style.overflow = '';
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  // Derive a full-size image URL from the tiny list thumbnail.
  // Dropbox list thumbnails look like:
  //   https://previews.dropbox.com/p/thumb/<TOKEN>/p.jpeg?size=32x32&size_mode=2
  // The <TOKEN> in the path authorizes the file; the `size` is just a query
  // param we can raise. Bumping it to a large bounding box returns the full
  // image scaled to fit (size_mode=2 preserves aspect ratio), so no page
  // scraping or fetching is needed -- the URL loads directly as an <img> src
  // with the page's session cookies.
  buildFullSizeUrl(thumbnailUrl) {
    if (!thumbnailUrl) return null;
    try {
      const url = new URL(thumbnailUrl);
      if (url.hostname !== 'previews.dropbox.com') return null;
      url.searchParams.set('size', '2048x2048');
      url.searchParams.set('size_mode', '2');
      return url.toString();
    } catch {
      return null;
    }
  }

  showToast(message, type) {
    const container = document.getElementById('gallery-toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'gallery-toast gallery-toast-' + (type || 'info');
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('gallery-toast-out');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  toggleFavorite() {
    const currentImage = this.images[this.currentIndex];
    if (!currentImage) return;

    if (this.favorites.has(currentImage.id)) {
      this.favorites.delete(currentImage.id);
      this.showToast('Removed from favorites', 'info');
    } else {
      this.favorites.add(currentImage.id);
      this.showToast('Added to favorites', 'info');
    }
    this.saveFavorites();
    this.updateFavoriteButton();
  }

  updateFavoriteButton() {
    const currentImage = this.images[this.currentIndex];
    const btn = document.getElementById('gallery-favorite-btn');
    if (btn && currentImage) {
      const isFavorite = this.favorites.has(currentImage.id);
      const svg = btn.querySelector('svg');
      if (svg) {
        svg.setAttribute('fill', isFavorite ? 'currentColor' : 'none');
        svg.style.color = isFavorite ? '#ef4444' : 'white';
      }
      btn.setAttribute('aria-label', isFavorite ? 'Remove from favorites' : 'Add to favorites');
    }
  }

  navigate(direction) {
    if (direction === 'prev' && this.currentIndex > 0) {
      this.currentIndex--;
    } else if (direction === 'next' && this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
    }
    this.updateImage();
  }

  async updateImage() {
    const img = document.getElementById('gallery-main-image');
    const info = document.getElementById('gallery-image-info');
    const dots = document.getElementById('gallery-dots');
    const errorEl = document.getElementById('gallery-image-error');
    const loadingEl = document.getElementById('gallery-image-loading');

    if (!img || !this.images[this.currentIndex]) return;

    const currentImage = this.images[this.currentIndex];
    const indexAtStart = this.currentIndex;

    // Reset zoom
    this.isZoomed = false;
    img.classList.remove('gallery-zoomed');
    this.updateZoomIndicator();

    // Show loading, hide error, clear previous image
    img.classList.add('gallery-loading-img');
    if (loadingEl) loadingEl.classList.add('visible');
    if (errorEl) errorEl.style.display = 'none';
    img.style.display = 'block';

    // Always clear previous image first to avoid stale display
    img.src = '';
    img.alt = currentImage.name;

    // Show thumbnail immediately (fast), then try to upgrade to high-res
    if (currentImage.thumbnail) {
      img.src = currentImage.thumbnail;
    }

    if (info) {
      info.textContent = currentImage.name + ' \u2022 ' + (this.currentIndex + 1) + ' / ' + this.images.length;
    }

    // Update dots (limit to 100)
    if (dots) {
      dots.innerHTML = '';
      const maxDots = 100;
      if (this.images.length <= maxDots) {
        this.images.forEach((_, i) => {
          const dot = document.createElement('button');
          dot.className = 'gallery-dot' + (i === this.currentIndex ? ' active' : '');
          dot.setAttribute('role', 'tab');
          dot.setAttribute('aria-label', 'Image ' + (i + 1) + ' of ' + this.images.length);
          dot.setAttribute('aria-selected', i === this.currentIndex ? 'true' : 'false');
          dot.setAttribute('tabindex', i === this.currentIndex ? '0' : '-1');
          dot.dataset.index = i;
          dots.appendChild(dot);
        });
      }
    }

    this.updateFavoriteButton();
    this.updateNavigationButtons();

    // Upgrade the tiny list thumbnail to a full-size preview. Preload it off
    // screen, then swap it in only once it has decoded and if the user hasn't
    // navigated away -- so they see the thumbnail instantly and the sharp
    // image moments later, with no flash of broken/blank image.
    const fullUrl = this.buildFullSizeUrl(currentImage.thumbnail);
    if (fullUrl && fullUrl !== currentImage.thumbnail) {
      const preloader = new Image();
      preloader.onload = () => {
        if (this.isVisible && this.currentIndex === indexAtStart) {
          img.src = fullUrl;
        }
      };
      preloader.src = fullUrl;
    }
  }

  handleImageLoad() {
    const img = document.getElementById('gallery-main-image');
    const loadingEl = document.getElementById('gallery-image-loading');
    if (img) img.classList.remove('gallery-loading-img');
    if (loadingEl) loadingEl.classList.remove('visible');
  }

  handleImageError() {
    const img = document.getElementById('gallery-main-image');
    const loadingEl = document.getElementById('gallery-image-loading');
    const errorEl = document.getElementById('gallery-image-error');

    if (img) {
      img.classList.remove('gallery-loading-img');
      img.style.display = 'none';
    }
    if (loadingEl) loadingEl.classList.remove('visible');
    if (errorEl) errorEl.style.display = 'flex';
  }

  retryImage() {
    const currentImage = this.images[this.currentIndex];
    if (!currentImage) return;
    this.updateImage();
  }

  updateNavigationButtons() {
    const prevBtn = document.getElementById('gallery-prev-btn');
    const nextBtn = document.getElementById('gallery-next-btn');

    if (prevBtn) {
      prevBtn.disabled = this.currentIndex <= 0;
    }
    if (nextBtn) {
      nextBtn.disabled = this.currentIndex >= this.images.length - 1;
    }
  }

  toggleZoom() {
    const img = document.getElementById('gallery-main-image');
    if (!img) return;
    this.isZoomed = !this.isZoomed;
    img.classList.toggle('gallery-zoomed', this.isZoomed);
    this.updateZoomIndicator();
  }

  updateZoomIndicator() {
    const indicator = document.getElementById('gallery-zoom-indicator');
    if (indicator) {
      indicator.classList.toggle('visible', this.isZoomed);
    }
  }

  async toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        const overlay = document.getElementById('dropbox-gallery-overlay');
        if (overlay) {
          await overlay.requestFullscreen();
        }
        this.isFullscreen = true;
      } else {
        await document.exitFullscreen();
        this.isFullscreen = false;
      }
    } catch (err) {
      this.showToast('Press F11 to enter fullscreen mode', 'info');
    }
  }

  toggleHelp() {
    const modal = document.getElementById('gallery-help-modal');
    if (!modal) return;
    this.helpVisible = !this.helpVisible;
    modal.classList.toggle('visible', this.helpVisible);
  }

  handleKeydown(e) {
    if (!this.isVisible) return;

    if (this.helpVisible) {
      if (e.key === 'Escape' || e.key === '?') {
        this.toggleHelp();
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          this.hide();
        }
        break;
      case 'ArrowLeft':
        this.navigate('prev');
        break;
      case 'ArrowRight':
        this.navigate('next');
        break;
      case ' ':
        e.preventDefault();
        this.toggleFavorite();
        break;
      case 'f':
      case 'F':
        this.toggleFullscreen();
        break;
      case '?':
        this.toggleHelp();
        break;
    }
  }

  handleTouchStart(e) {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
  }

  handleTouchEnd(e) {
    if (!e.changedTouches.length) return;
    const dx = e.changedTouches[0].clientX - this.touchStartX;
    const dy = e.changedTouches[0].clientY - this.touchStartY;
    const minSwipe = 50;

    if (Math.abs(dx) > minSwipe && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx > 0) {
        this.navigate('prev');
      } else {
        this.navigate('next');
      }
    }
  }

  bindEvents() {
    this.keydownHandler = (e) => this.handleKeydown(e);
    document.addEventListener('keydown', this.keydownHandler);

    this.fullscreenHandler = () => {
      this.isFullscreen = !!document.fullscreenElement;
    };
    document.addEventListener('fullscreenchange', this.fullscreenHandler);
  }

  unbindEvents() {
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
    }
    if (this.fullscreenHandler) {
      document.removeEventListener('fullscreenchange', this.fullscreenHandler);
    }
  }

  render() {
    // Remove existing overlay
    const existing = document.getElementById('dropbox-gallery-overlay');
    if (existing) {
      existing.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = 'dropbox-gallery-overlay';

    // Build DOM with createElement for CSP compliance
    const backdrop = document.createElement('div');
    backdrop.className = 'gallery-backdrop';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.id = 'gallery-close-btn';
    closeBtn.className = 'gallery-control-btn gallery-close';
    closeBtn.setAttribute('aria-label', 'Close gallery');
    closeBtn.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';
    backdrop.appendChild(closeBtn);

    // Top controls
    const topControls = document.createElement('div');
    topControls.className = 'gallery-top-controls';

    const favBtn = document.createElement('button');
    favBtn.id = 'gallery-favorite-btn';
    favBtn.className = 'gallery-control-btn';
    favBtn.setAttribute('aria-label', 'Toggle favorite');
    favBtn.title = 'Toggle favorite (Space)';
    favBtn.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24" style="color: white;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>';
    topControls.appendChild(favBtn);

    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.id = 'gallery-fullscreen-btn';
    fullscreenBtn.className = 'gallery-control-btn';
    fullscreenBtn.setAttribute('aria-label', 'Toggle fullscreen');
    fullscreenBtn.title = 'Toggle fullscreen (F)';
    fullscreenBtn.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>';
    topControls.appendChild(fullscreenBtn);

    const helpBtn = document.createElement('button');
    helpBtn.id = 'gallery-help-btn';
    helpBtn.className = 'gallery-control-btn';
    helpBtn.setAttribute('aria-label', 'Show keyboard shortcuts');
    helpBtn.title = 'Keyboard shortcuts (?)';
    helpBtn.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    topControls.appendChild(helpBtn);

    backdrop.appendChild(topControls);

    // Navigation buttons (always visible, disabled at boundaries)
    const prevBtn = document.createElement('button');
    prevBtn.id = 'gallery-prev-btn';
    prevBtn.className = 'gallery-nav-btn gallery-prev';
    prevBtn.setAttribute('aria-label', 'Previous image');
    prevBtn.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>';
    backdrop.appendChild(prevBtn);

    const nextBtn = document.createElement('button');
    nextBtn.id = 'gallery-next-btn';
    nextBtn.className = 'gallery-nav-btn gallery-next';
    nextBtn.setAttribute('aria-label', 'Next image');
    nextBtn.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>';
    backdrop.appendChild(nextBtn);

    // Image container
    const imgContainer = document.createElement('div');
    imgContainer.id = 'gallery-image-container';
    imgContainer.className = 'gallery-image-container';

    const img = document.createElement('img');
    img.id = 'gallery-main-image';
    img.className = 'gallery-main-image';
    imgContainer.appendChild(img);

    // Image loading spinner
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'gallery-image-loading';
    loadingOverlay.className = 'gallery-image-loading-overlay';
    const spinner = document.createElement('div');
    spinner.className = 'gallery-loading-spinner';
    loadingOverlay.appendChild(spinner);
    imgContainer.appendChild(loadingOverlay);

    // Zoom indicator
    const zoomIndicator = document.createElement('span');
    zoomIndicator.id = 'gallery-zoom-indicator';
    zoomIndicator.className = 'gallery-zoom-indicator';
    zoomIndicator.textContent = 'Zoomed';
    imgContainer.appendChild(zoomIndicator);

    // Image error state
    const errorDiv = document.createElement('div');
    errorDiv.id = 'gallery-image-error';
    errorDiv.className = 'gallery-image-error';
    errorDiv.style.display = 'none';
    errorDiv.innerHTML = '<svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>';
    const errorText = document.createElement('p');
    errorText.textContent = 'Failed to load image';
    errorDiv.appendChild(errorText);
    const retryBtn = document.createElement('button');
    retryBtn.id = 'gallery-retry-btn';
    retryBtn.className = 'gallery-retry-btn';
    retryBtn.textContent = 'Retry';
    errorDiv.appendChild(retryBtn);
    imgContainer.appendChild(errorDiv);

    backdrop.appendChild(imgContainer);

    // Bottom info and dots
    const bottomInfo = document.createElement('div');
    bottomInfo.className = 'gallery-bottom-info';

    const dots = document.createElement('div');
    dots.id = 'gallery-dots';
    dots.className = 'gallery-dots';
    dots.setAttribute('role', 'tablist');
    dots.setAttribute('aria-label', 'Image navigation');
    bottomInfo.appendChild(dots);

    const infoText = document.createElement('div');
    infoText.className = 'gallery-info-text';
    const infoP = document.createElement('p');
    infoP.id = 'gallery-image-info';
    infoText.appendChild(infoP);
    bottomInfo.appendChild(infoText);

    backdrop.appendChild(bottomInfo);
    overlay.appendChild(backdrop);

    // Toast container
    const toastContainer = document.createElement('div');
    toastContainer.id = 'gallery-toast-container';
    toastContainer.className = 'gallery-toast-container';
    overlay.appendChild(toastContainer);

    // Help modal
    const helpModal = document.createElement('div');
    helpModal.id = 'gallery-help-modal';
    helpModal.className = 'gallery-help-modal-overlay';
    helpModal.setAttribute('role', 'dialog');
    helpModal.setAttribute('aria-label', 'Keyboard shortcuts');
    helpModal.innerHTML = '<div class="gallery-help-modal">' +
      '<h2>Keyboard Shortcuts</h2>' +
      '<div class="gallery-help-row"><span class="gallery-help-desc">Previous image</span><span class="gallery-help-key">\u2190</span></div>' +
      '<div class="gallery-help-row"><span class="gallery-help-desc">Next image</span><span class="gallery-help-key">\u2192</span></div>' +
      '<div class="gallery-help-row"><span class="gallery-help-desc">Toggle favorite</span><span class="gallery-help-key">Space</span></div>' +
      '<div class="gallery-help-row"><span class="gallery-help-desc">Toggle fullscreen</span><span class="gallery-help-key">F</span></div>' +
      '<div class="gallery-help-row"><span class="gallery-help-desc">Toggle zoom</span><span class="gallery-help-key">Click</span></div>' +
      '<div class="gallery-help-row"><span class="gallery-help-desc">Close gallery</span><span class="gallery-help-key">Esc</span></div>' +
      '<div class="gallery-help-row"><span class="gallery-help-desc">Show this help</span><span class="gallery-help-key">?</span></div>' +
      '<p class="gallery-help-close-hint">Press Esc or ? to close</p>' +
      '</div>';
    overlay.appendChild(helpModal);

    document.body.appendChild(overlay);

    // Wire up event listeners
    closeBtn.addEventListener('click', () => this.hide());
    favBtn.addEventListener('click', () => this.toggleFavorite());
    fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    helpBtn.addEventListener('click', () => this.toggleHelp());
    prevBtn.addEventListener('click', () => this.navigate('prev'));
    nextBtn.addEventListener('click', () => this.navigate('next'));
    retryBtn.addEventListener('click', () => this.retryImage());

    img.addEventListener('click', () => this.toggleZoom());
    img.addEventListener('load', () => this.handleImageLoad());
    img.addEventListener('error', () => this.handleImageError());

    // Touch/swipe on image container
    imgContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
    imgContainer.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

    // Dot navigation
    dots.addEventListener('click', (e) => {
      const dot = e.target.closest('.gallery-dot');
      if (dot && dot.dataset.index !== undefined) {
        this.currentIndex = parseInt(dot.dataset.index);
        this.updateImage();
      }
    });

    // Backdrop click to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target === backdrop) {
        this.hide();
      }
    });

    // Help modal backdrop click
    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal) {
        this.toggleHelp();
      }
    });

    this.updateImage();
  }
}

// Global instance
window.dropboxGallery = new DropboxGalleryOverlay();
