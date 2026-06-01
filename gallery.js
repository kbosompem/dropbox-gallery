class DropboxGallery {
    constructor() {
        this.images = [];
        this.currentIndex = 0;
        this.favorites = new Set();
        this.isZoomed = false;
        this.helpVisible = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.blobCache = {};
        this.loadData();
    }

    async loadData() {
        try {
            const result = await chrome.storage.local.get(['galleryImages', 'folderName', 'favorites']);

            if (!result.galleryImages || result.galleryImages.length === 0) {
                this.showError('No images found', 'Navigate to a Dropbox folder containing images and try again.');
                return;
            }

            this.images = result.galleryImages;
            if (result.favorites) {
                this.favorites = new Set(result.favorites);
            }

            if (result.folderName) {
                document.title = `Gallery - ${result.folderName}`;
            }

            this.hideLoading();
            this.render();
            this.bindEvents();
        } catch (error) {
            console.error('Failed to load gallery data:', error);
            if (error.message && error.message.includes('storage')) {
                this.showError('Storage access denied', 'The extension needs storage permission. Try reinstalling the extension.');
            } else {
                this.showError('Failed to load gallery', 'An unexpected error occurred. Try reopening the gallery.');
            }
        }
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showError(message, detail) {
        document.getElementById('loading').style.display = 'none';
        const errorEl = document.getElementById('error');
        document.getElementById('error-message').textContent = message;
        const detailEl = document.getElementById('error-detail');
        if (detail) {
            detailEl.textContent = detail;
        }
        errorEl.style.display = 'flex';
    }

    showToast(message, type) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type || 'info'}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // Fetch image via fetch() with credentials to get Dropbox cookies,
    // then convert to a blob URL that works on the extension page.
    async fetchImageAsBlob(url) {
        if (this.blobCache[url]) return this.blobCache[url];

        // Data URLs already work directly
        if (url.startsWith('data:')) {
            this.blobCache[url] = url;
            return url;
        }

        try {
            const resp = await fetch(url, { credentials: 'include' });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const blob = await resp.blob();
            const blobUrl = URL.createObjectURL(blob);
            this.blobCache[url] = blobUrl;
            return blobUrl;
        } catch (err) {
            console.warn('Failed to fetch image:', url, err);
            // Return original URL as last resort
            return url;
        }
    }

    render() {
        document.getElementById('gallery-close-btn').style.display = 'block';
        document.querySelector('.gallery-top-controls').style.display = 'flex';
        document.getElementById('gallery-image-container').style.display = 'flex';
        document.getElementById('gallery-bottom-info').style.display = 'flex';
        document.getElementById('gallery-prev-btn').style.display = 'block';
        document.getElementById('gallery-next-btn').style.display = 'block';

        this.updateImage();
    }

    async updateImage() {
        if (!this.images[this.currentIndex]) return;

        const currentImage = this.images[this.currentIndex];
        const img = document.getElementById('gallery-main-image');
        const info = document.getElementById('gallery-image-info');
        const dots = document.getElementById('gallery-dots');
        const errorEl = document.getElementById('gallery-image-error');
        const loadingEl = document.getElementById('image-loading');

        // Reset zoom
        this.isZoomed = false;
        img.classList.remove('zoomed');
        this.updateZoomIndicator();

        // Show image loading state
        img.classList.add('loading-img');
        loadingEl.classList.add('visible');
        errorEl.style.display = 'none';
        img.style.display = 'block';

        // Fetch image as blob to bypass cookie/CORS issues
        const blobUrl = await this.fetchImageAsBlob(currentImage.full);
        img.src = blobUrl;
        img.alt = currentImage.name;

        if (info) {
            info.textContent = `${currentImage.name} \u2022 ${this.currentIndex + 1} / ${this.images.length}`;
        }

        // Update dots (limit to prevent perf issues with 1000+ images)
        if (dots) {
            dots.innerHTML = '';
            const maxDots = 100;
            if (this.images.length <= maxDots) {
                this.images.forEach((_, i) => {
                    const dot = document.createElement('button');
                    dot.className = `gallery-dot ${i === this.currentIndex ? 'active' : ''}`;
                    dot.setAttribute('role', 'tab');
                    dot.setAttribute('aria-label', `Image ${i + 1} of ${this.images.length}`);
                    dot.setAttribute('aria-selected', i === this.currentIndex ? 'true' : 'false');
                    dot.setAttribute('tabindex', i === this.currentIndex ? '0' : '-1');
                    dot.addEventListener('click', () => {
                        this.currentIndex = i;
                        this.updateImage();
                    });
                    dots.appendChild(dot);
                });
            }
        }

        this.updateFavoriteButton();
        this.updateNavigationButtons();
    }

    handleImageLoad() {
        const img = document.getElementById('gallery-main-image');
        const loadingEl = document.getElementById('image-loading');
        img.classList.remove('loading-img');
        loadingEl.classList.remove('visible');
    }

    handleImageError() {
        const img = document.getElementById('gallery-main-image');
        const loadingEl = document.getElementById('image-loading');
        const errorEl = document.getElementById('gallery-image-error');
        img.classList.remove('loading-img');
        loadingEl.classList.remove('visible');
        img.style.display = 'none';
        errorEl.style.display = 'flex';
    }

    async retryImage() {
        const currentImage = this.images[this.currentIndex];
        if (!currentImage) return;
        // Clear cache for this URL so it re-fetches
        delete this.blobCache[currentImage.full];
        await this.updateImage();
    }

    updateFavoriteButton() {
        const currentImage = this.images[this.currentIndex];
        const btn = document.getElementById('gallery-favorite-btn');
        if (btn && currentImage) {
            const isFavorite = this.favorites.has(currentImage.id);
            const svg = btn.querySelector('svg');
            if (isFavorite) {
                svg.setAttribute('fill', 'currentColor');
                svg.style.color = '#ef4444';
                btn.setAttribute('aria-label', 'Remove from favorites');
            } else {
                svg.setAttribute('fill', 'none');
                svg.style.color = 'white';
                btn.setAttribute('aria-label', 'Add to favorites');
            }
        }
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

    updateZoomIndicator() {
        const indicator = document.getElementById('zoom-indicator');
        if (indicator) {
            indicator.classList.toggle('visible', this.isZoomed);
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

    async saveFavorites() {
        try {
            await chrome.storage.local.set({ favorites: Array.from(this.favorites) });
        } catch (e) {
            console.log('Could not save favorites:', e);
        }
    }

    toggleZoom() {
        const img = document.getElementById('gallery-main-image');
        this.isZoomed = !this.isZoomed;
        img.classList.toggle('zoomed', this.isZoomed);
        this.updateZoomIndicator();
    }

    async toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (err) {
            this.showToast('Press F11 to enter fullscreen mode', 'info');
        }
    }

    toggleHelp() {
        const modal = document.getElementById('help-modal');
        this.helpVisible = !this.helpVisible;
        modal.classList.toggle('visible', this.helpVisible);
    }

    close() {
        // Clean up blob URLs
        Object.values(this.blobCache).forEach(url => {
            if (url.startsWith('blob:')) URL.revokeObjectURL(url);
        });
        window.close();
    }

    handleKeydown(e) {
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
                    this.close();
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
        document.addEventListener('keydown', (e) => this.handleKeydown(e));

        document.getElementById('gallery-close-btn').addEventListener('click', () => this.close());
        document.getElementById('gallery-favorite-btn').addEventListener('click', () => this.toggleFavorite());
        document.getElementById('gallery-fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('gallery-help-btn').addEventListener('click', () => this.toggleHelp());
        document.getElementById('gallery-prev-btn').addEventListener('click', () => this.navigate('prev'));
        document.getElementById('gallery-next-btn').addEventListener('click', () => this.navigate('next'));
        document.getElementById('gallery-retry-btn').addEventListener('click', () => this.retryImage());

        const img = document.getElementById('gallery-main-image');
        img.addEventListener('click', () => this.toggleZoom());
        img.addEventListener('load', () => this.handleImageLoad());
        img.addEventListener('error', () => this.handleImageError());

        const container = document.getElementById('gallery-image-container');
        container.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        container.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

        document.getElementById('help-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.toggleHelp();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DropboxGallery();
});
