class DropboxGallery {
    constructor() {
        this.images = [];
        this.currentIndex = 0;
        this.favorites = new Set();
        this.isZoomed = false;
        this.loadData();
    }

    async loadData() {
        try {
            // Load images from chrome storage
            const result = await chrome.storage.local.get(['galleryImages', 'folderName', 'favorites']);

            if (!result.galleryImages || result.galleryImages.length === 0) {
                this.showError('No images found');
                return;
            }

            this.images = result.galleryImages;
            if (result.favorites) {
                this.favorites = new Set(result.favorites);
            }

            // Update page title
            if (result.folderName) {
                document.title = `Gallery - ${result.folderName}`;
            }

            this.hideLoading();
            this.render();
            this.bindEvents();
        } catch (error) {
            console.error('Failed to load gallery data:', error);
            this.showError('Failed to load gallery data');
        }
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showError(message) {
        document.getElementById('loading').style.display = 'none';
        const errorEl = document.getElementById('error');
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }

    render() {
        // Show all elements
        document.getElementById('gallery-close-btn').style.display = 'block';
        document.querySelector('.gallery-top-controls').style.display = 'flex';
        document.getElementById('gallery-image-container').style.display = 'flex';
        document.getElementById('gallery-bottom-info').style.display = 'flex';

        this.updateImage();
    }

    updateImage() {
        if (!this.images[this.currentIndex]) return;

        const currentImage = this.images[this.currentIndex];
        const img = document.getElementById('gallery-main-image');
        const info = document.getElementById('gallery-image-info');
        const dots = document.getElementById('gallery-dots');

        img.src = currentImage.full;
        img.alt = currentImage.name;
        this.isZoomed = false;
        img.classList.remove('zoomed');

        if (info) {
            info.textContent = `${currentImage.name} • ${this.currentIndex + 1} / ${this.images.length}`;
        }

        // Update dots
        if (dots) {
            dots.innerHTML = '';
            this.images.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = `gallery-dot ${i === this.currentIndex ? 'active' : ''}`;
                dot.addEventListener('click', () => {
                    this.currentIndex = i;
                    this.updateImage();
                });
                dots.appendChild(dot);
            });
        }

        this.updateFavoriteButton();
        this.updateNavigationButtons();
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
            } else {
                svg.setAttribute('fill', 'none');
                svg.style.color = 'white';
            }
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
        } else {
            this.favorites.add(currentImage.id);
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
    }

    async toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (err) {
            // Fallback: tell user to use F11
            alert('Use F11 to enter fullscreen mode');
        }
    }

    close() {
        window.close();
    }

    handleKeydown(e) {
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
            case 'F11':
                // Browser handles this natively
                break;
        }
    }

    bindEvents() {
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Button events
        document.getElementById('gallery-close-btn').addEventListener('click', () => this.close());
        document.getElementById('gallery-favorite-btn').addEventListener('click', () => this.toggleFavorite());
        document.getElementById('gallery-fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('gallery-prev-btn').addEventListener('click', () => this.navigate('prev'));
        document.getElementById('gallery-next-btn').addEventListener('click', () => this.navigate('next'));

        // Image click to zoom
        document.getElementById('gallery-main-image').addEventListener('click', () => this.toggleZoom());
    }
}

// Initialize gallery when page loads
document.addEventListener('DOMContentLoaded', () => {
    new DropboxGallery();
});