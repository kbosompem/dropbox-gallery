<script>
  export let image;
  export let isFavorite;
  export let onClose;
  export let onToggleFavorite;
  export let allImages = [];

  let currentIndex = allImages.findIndex(img => img.id === image.id);
  let isZoomed = false;
  let loading = true;

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft') {
      navigatePrev();
    } else if (e.key === 'ArrowRight') {
      navigateNext();
    } else if (e.key === ' ') {
      e.preventDefault();
      onToggleFavorite();
    }
  }

  function navigatePrev() {
    if (currentIndex > 0) {
      currentIndex--;
      image = allImages[currentIndex];
      loading = true;
      isZoomed = false;
    }
  }

  function navigateNext() {
    if (currentIndex < allImages.length - 1) {
      currentIndex++;
      image = allImages[currentIndex];
      loading = true;
      isZoomed = false;
    }
  }

  function handleImageLoad() {
    loading = false;
  }

  function toggleZoom() {
    isZoomed = !isZoomed;
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-fade-in"
  on:click={handleBackdropClick}
  role="button"
  tabindex="-1"
>
  <button
    on:click={onClose}
    class="absolute top-4 right-4 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 group"
    aria-label="Close viewer"
  >
    <svg class="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
    </svg>
  </button>

  <div class="absolute top-4 left-4 flex items-center gap-3">
    <button
      on:click={onToggleFavorite}
      class="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 group"
      aria-label="Toggle favorite"
    >
      <svg
        class="w-6 h-6 transition-all duration-200 {isFavorite ? 'text-red-500 fill-current scale-110' : 'group-hover:scale-110'}"
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>

    <button
      on:click={toggleZoom}
      class="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 group"
      aria-label="Toggle zoom"
    >
      <svg class="w-6 h-6 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {#if isZoomed}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10h-2m0 0H9m2 0v2m0-2V8"/>
        {:else}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10h4m-2-2v4"/>
        {/if}
      </svg>
    </button>
  </div>

  {#if currentIndex > 0}
    <button
      on:click={navigatePrev}
      class="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 group"
      aria-label="Previous image"
    >
      <svg class="w-6 h-6 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
      </svg>
    </button>
  {/if}

  {#if currentIndex < allImages.length - 1}
    <button
      on:click={navigateNext}
      class="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 group"
      aria-label="Next image"
    >
      <svg class="w-6 h-6 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
      </svg>
    </button>
  {/if}

  <div class="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
    {#if loading}
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    {/if}

    <img
      src={image.full}
      alt={image.name}
      on:load={handleImageLoad}
      on:click={toggleZoom}
      class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl cursor-zoom-in transition-all duration-300 {isZoomed ? 'scale-150 cursor-zoom-out' : ''} {loading ? 'opacity-0' : 'opacity-100'}"
    />
  </div>

  <div class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white">
    <p class="text-sm font-medium">
      {image.name} • {currentIndex + 1} / {allImages.length}
    </p>
  </div>
</div>

<style>
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .animate-fade-in {
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>