<script>
  import { onMount } from 'svelte';
  import Gallery from './lib/Gallery.svelte';
  import ImageViewer from './lib/ImageViewer.svelte';

  let images = [];
  let folderName = 'Dropbox Gallery';
  let selectedImage = null;
  let favorites = new Set();
  let showFavoritesOnly = false;
  let searchQuery = '';

  onMount(async () => {
    const stored = await chrome.storage.local.get(['galleryImages', 'folderName', 'favorites']);
    if (stored.galleryImages) {
      images = stored.galleryImages;
      folderName = stored.folderName || 'Dropbox Gallery';
    }
    if (stored.favorites) {
      favorites = new Set(stored.favorites);
    }

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]?.url?.includes('dropbox.com')) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getImages' }, (response) => {
          if (response?.images?.length > 0) {
            images = response.images;
            folderName = tabs[0].title;
            chrome.storage.local.set({
              galleryImages: images,
              folderName: folderName
            });
          }
        });
      }
    });
  });

  function toggleFavorite(imageId) {
    if (favorites.has(imageId)) {
      favorites.delete(imageId);
    } else {
      favorites.add(imageId);
    }
    favorites = new Set(favorites);
    chrome.storage.local.set({ favorites: Array.from(favorites) });
  }

  function handleImageSelect(image) {
    selectedImage = image;
  }

  function closeViewer() {
    selectedImage = null;
  }

  $: filteredImages = images.filter(img => {
    const matchesSearch = !searchQuery ||
      img.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorites = !showFavoritesOnly || favorites.has(img.id);
    return matchesSearch && matchesFavorites;
  });
</script>

<div class="h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
  <header class="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <svg class="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
        </svg>
        <div>
          <h1 class="text-xl font-bold text-slate-800">{folderName}</h1>
          <p class="text-sm text-slate-500">{images.length} images • {favorites.size} favorites</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="relative">
          <input
            type="text"
            placeholder="Search images..."
            bind:value={searchQuery}
            class="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64"
          />
          <svg class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>

        <button
          on:click={() => showFavoritesOnly = !showFavoritesOnly}
          class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all {showFavoritesOnly ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}"
        >
          <svg class="w-4 h-4" fill={showFavoritesOnly ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
          <span class="text-sm font-medium">Favorites</span>
        </button>
      </div>
    </div>
  </header>

  <main class="flex-1 overflow-auto scrollbar-thin p-6">
    {#if filteredImages.length > 0}
      <Gallery
        images={filteredImages}
        {favorites}
        onImageSelect={handleImageSelect}
        onToggleFavorite={toggleFavorite}
      />
    {:else if images.length === 0}
      <div class="flex flex-col items-center justify-center h-full text-slate-400">
        <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <p class="text-lg font-medium">No images found</p>
        <p class="text-sm mt-2">Navigate to a Dropbox folder with images</p>
      </div>
    {:else}
      <div class="flex flex-col items-center justify-center h-full text-slate-400">
        <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <p class="text-lg font-medium">No matches found</p>
        <p class="text-sm mt-2">Try adjusting your search or filters</p>
      </div>
    {/if}
  </main>

  {#if selectedImage}
    <ImageViewer
      image={selectedImage}
      isFavorite={favorites.has(selectedImage.id)}
      onClose={closeViewer}
      onToggleFavorite={() => toggleFavorite(selectedImage.id)}
      allImages={filteredImages}
    />
  {/if}
</div>