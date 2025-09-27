// Gallery overlay that gets injected into the Dropbox page
class DropboxGalleryOverlay {
  constructor() {
    this.images = [];
    this.currentIndex = 0;
    this.favorites = new Set();
    this.isVisible = false;
    this.isFullscreen = false;
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
    this.render();
    this.bindEvents();
  }

  hide() {
    this.isVisible = false;
    this.unbindEvents();
    const overlay = document.getElementById('dropbox-gallery-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  toggleFavorite() {
    const currentImage = this.images[this.currentIndex];
    if (!currentImage) return;

    if (this.favorites.has(currentImage.id)) {
      this.favorites.delete(currentImage.id);
    } else {
      this.favorites.add(currentImage.id);
    }
    this.saveFavorites();
    this.updateFavoriteButton();
  }

  updateFavoriteButton() {
    const currentImage = this.images[this.currentIndex];
    const btn = document.getElementById('gallery-favorite-btn');
    if (btn && currentImage) {
      const isFavorite = this.favorites.has(currentImage.id);
      btn.innerHTML = `
        <svg class="w-6 h-6 transition-all duration-200 ${isFavorite ? 'text-red-500 fill-current scale-110' : ''}"
             fill="${isFavorite ? 'currentColor' : 'none'}"
             stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
      `;
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

  updateImage() {
    const img = document.getElementById('gallery-main-image');
    const info = document.getElementById('gallery-image-info');
    const dots = document.getElementById('gallery-dots');

    if (img && this.images[this.currentIndex]) {
      const currentImage = this.images[this.currentIndex];
      img.src = currentImage.full;
      img.alt = currentImage.name;

      if (info) {
        info.textContent = `${currentImage.name} • ${this.currentIndex + 1} / ${this.images.length}`;
      }

      // Update dots
      if (dots) {
        dots.innerHTML = this.images.map((_, i) =>
          `<button class="gallery-dot ${i === this.currentIndex ? 'active' : ''}" data-index="${i}"></button>`
        ).join('');
      }

      this.updateFavoriteButton();
      this.updateNavigationButtons();
    }
  }

  updateNavigationButtons() {
    const prevBtn = document.getElementById('gallery-prev-btn');
    const nextBtn = document.getElementById('gallery-next-btn');

    if (prevBtn) {
      prevBtn.style.display = this.currentIndex > 0 ? 'block' : 'none';
    }
    if (nextBtn) {
      nextBtn.style.display = this.currentIndex < this.images.length - 1 ? 'block' : 'none';
    }
  }

  async toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        this.isFullscreen = true;
      } else {
        await document.exitFullscreen();
        this.isFullscreen = false;
      }
      this.updateFullscreenButton();
    } catch (err) {
      console.log('Fullscreen failed:', err);
    }
  }

  updateFullscreenButton() {
    const btn = document.getElementById('gallery-fullscreen-btn');
    if (btn) {
      btn.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${this.isFullscreen ?
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>' :
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 3H5a2 2 0 00-2 2v3m2 0V6a2 2 0 012-2h3m0 0h6m-6 0V3m6 0v3M3 16v3a2 2 0 002 2h3m0 0h6m-6 0v2m6-2a2 2 0 002-2v-3M3 16h3m0 0V8m0 8h8m0 0V8m0 8v3"/>'
          }
        </svg>
      `;
    }
  }

  handleKeydown(e) {
    if (!this.isVisible) return;

    switch (e.key) {
      case 'Escape':
        if (this.isFullscreen) {
          this.toggleFullscreen();
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
    }
  }

  bindEvents() {
    this.keydownHandler = this.handleKeydown.bind(this);
    document.addEventListener('keydown', this.keydownHandler);

    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen = !!document.fullscreenElement;
      this.updateFullscreenButton();
    });
  }

  unbindEvents() {
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
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
    overlay.innerHTML = `
      <div class="gallery-backdrop">
        <!-- Close button -->
        <button id="gallery-close-btn" class="gallery-control-btn gallery-close">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <!-- Top controls -->
        <div class="gallery-top-controls">
          <button id="gallery-favorite-btn" class="gallery-control-btn" title="Toggle favorite">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>

          <button id="gallery-fullscreen-btn" class="gallery-control-btn" title="Toggle fullscreen (F)">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 3H5a2 2 0 00-2 2v3m2 0V6a2 2 0 012-2h3m0 0h6m-6 0V3m6 0v3M3 16v3a2 2 0 002 2h3m0 0h6m-6 0v2m6-2a2 2 0 002-2v-3M3 16h3m0 0V8m0 8h8m0 0V8m0 8v3"/>
            </svg>
          </button>
        </div>

        <!-- Navigation -->
        <button id="gallery-prev-btn" class="gallery-nav-btn gallery-prev">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <button id="gallery-next-btn" class="gallery-nav-btn gallery-next">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>

        <!-- Main image -->
        <div class="gallery-image-container">
          <img id="gallery-main-image" class="gallery-main-image" />
        </div>

        <!-- Bottom info and dots -->
        <div class="gallery-bottom-info">
          <div id="gallery-dots" class="gallery-dots"></div>
          <div class="gallery-info-text">
            <p id="gallery-image-info"></p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Add event listeners
    document.getElementById('gallery-close-btn').addEventListener('click', () => this.hide());
    document.getElementById('gallery-favorite-btn').addEventListener('click', () => this.toggleFavorite());
    document.getElementById('gallery-fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());
    document.getElementById('gallery-prev-btn').addEventListener('click', () => this.navigate('prev'));
    document.getElementById('gallery-next-btn').addEventListener('click', () => this.navigate('next'));

    // Dot navigation
    document.getElementById('gallery-dots').addEventListener('click', (e) => {
      if (e.target.classList.contains('gallery-dot')) {
        this.currentIndex = parseInt(e.target.dataset.index);
        this.updateImage();
      }
    });

    // Backdrop click to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.classList.contains('gallery-backdrop')) {
        this.hide();
      }
    });

    this.updateImage();
  }
}

// Global instance
window.dropboxGallery = new DropboxGalleryOverlay();