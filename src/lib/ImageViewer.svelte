<script>
  import { onDestroy } from 'svelte';

  export let image;
  export let isFavorite;
  export let onClose;
  export let onToggleFavorite;
  export let allImages = [];

  let currentIndex = allImages.findIndex(img => img.id === image.id);
  let isZoomed = false;
  let loading = true;
  let imageError = false;
  let isFullscreen = false;
  let viewerElement;

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      if (isFullscreen) {
        exitFullscreen();
      } else {
        onClose();
      }
    } else if (e.key === 'ArrowLeft') {
      navigatePrev();
    } else if (e.key === 'ArrowRight') {
      navigateNext();
    } else if (e.key === ' ') {
      e.preventDefault();
      onToggleFavorite();
    } else if (e.key === 'f' || e.key === 'F') {
      toggleFullscreen();
    }
  }

  function navigatePrev() {
    if (currentIndex > 0) {
      currentIndex--;
      image = allImages[currentIndex];
      loading = true;
      imageError = false;
      isZoomed = false;
    }
  }

  function navigateNext() {
    if (currentIndex < allImages.length - 1) {
      currentIndex++;
      image = allImages[currentIndex];
      loading = true;
      imageError = false;
      isZoomed = false;
    }
  }

  function handleImageLoad() {
    loading = false;
    imageError = false;
  }

  function handleImageError() {
    loading = false;
    imageError = true;
  }

  function retryImage() {
    imageError = false;
    loading = true;
    const img = viewerElement?.querySelector('img');
    if (img) {
      const sep = image.full.includes('?') ? '&' : '?';
      img.src = image.full + sep + '_t=' + Date.now();
    }
  }

  function toggleZoom() {
    if (!imageError) {
      isZoomed = !isZoomed;
    }
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget && !isFullscreen) {
      onClose();
    }
  }

  // Touch/swipe support
  let touchStartX = 0;
  let touchStartY = 0;

  function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }

  function handleTouchEnd(e) {
    if (!e.changedTouches.length) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const minSwipe = 50;

    if (Math.abs(dx) > minSwipe && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx > 0) {
        navigatePrev();
      } else {
        navigateNext();
      }
    }
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          await document.documentElement.webkitRequestFullscreen();
        }
        isFullscreen = true;
      } else {
        await exitFullscreen();
      }
    } catch (err) {
      console.log('Fullscreen request failed:', err);
      isFullscreen = !isFullscreen;
    }
  }

  async function exitFullscreen() {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      }
      isFullscreen = false;
    } catch (err) {
      console.log('Exit fullscreen failed:', err);
      isFullscreen = false;
    }
  }

  function handleFullscreenChange() {
    isFullscreen = !!document.fullscreenElement;
  }

  // Bind and clean up fullscreen event listeners
  if (typeof document !== 'undefined') {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  }

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    }
  });

  $: if (allImages[currentIndex]) {
    image = allImages[currentIndex];
    isFavorite = onToggleFavorite ? isFavorite : false;
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div
  bind:this={viewerElement}
  class="{isFullscreen ? 'fixed inset-0 z-[9999]' : 'fixed inset-0 z-50'} flex items-center justify-center bg-black/95 backdrop-blur-sm animate-fade-in"
  style="{isFullscreen ? 'position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 2147483647 !important;' : ''}"
  on:click={handleBackdropClick}
  on:touchstart={handleTouchStart}
  on:touchend={handleTouchEnd}
  role="dialog"
  aria-label="Image viewer"
  tabindex="-1"
>
  <button
    on:click={onClose}
    class="absolute top-4 right-4 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
    aria-label="Close viewer"
  >
    <svg class="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
    </svg>
  </button>

  <div class="absolute top-4 left-4 flex items-center gap-3">
    <button
      on:click={onToggleFavorite}
      class="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
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
      class="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
      aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
    >
      <svg class="w-6 h-6 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {#if isZoomed}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10h-2m0 0H9m2 0v2m0-2V8"/>
        {:else}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10h4m-2-2v4"/>
        {/if}
      </svg>
    </button>

    <button
      on:click={toggleFullscreen}
      class="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      title="Press F for fullscreen"
    >
      <svg class="w-6 h-6 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {#if isFullscreen}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        {:else}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 3H5a2 2 0 00-2 2v3m2 0V6a2 2 0 012-2h3m0 0h6m-6 0V3m6 0v3M3 16v3a2 2 0 002 2h3m0 0h6m-6 0v2m6-2a2 2 0 002-2v-3M3 16h3m0 0V8m0 8h8m0 0V8m0 8v3"/>
        {/if}
      </svg>
    </button>

    {#if isZoomed}
      <span class="px-3 py-1 rounded-full bg-black/60 text-white/80 text-xs font-medium">Zoomed</span>
    {/if}
  </div>

  <!-- Navigation: always visible, disabled at boundaries -->
  <button
    on:click={navigatePrev}
    disabled={currentIndex <= 0}
    class="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white transition-all duration-200 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 {currentIndex <= 0 ? 'opacity-30 cursor-default' : 'hover:bg-white/20'}"
    aria-label="Previous image"
  >
    <svg class="w-6 h-6 {currentIndex > 0 ? 'group-hover:-translate-x-1' : ''} transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
    </svg>
  </button>

  <button
    on:click={navigateNext}
    disabled={currentIndex >= allImages.length - 1}
    class="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white transition-all duration-200 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 {currentIndex >= allImages.length - 1 ? 'opacity-30 cursor-default' : 'hover:bg-white/20'}"
    aria-label="Next image"
  >
    <svg class="w-6 h-6 {currentIndex < allImages.length - 1 ? 'group-hover:translate-x-1' : ''} transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
    </svg>
  </button>

  <div class="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
    {#if loading}
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    {/if}

    {#if imageError}
      <div class="flex flex-col items-center gap-4 text-white/60 p-10">
        <svg class="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <p class="text-base">Failed to load image</p>
        <button
          on:click={retryImage}
          class="px-5 py-2 rounded-lg bg-white/15 border border-white/20 text-white hover:bg-white/25 transition-colors text-sm"
        >Retry</button>
      </div>
    {:else}
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <img
        src={image.full}
        alt={image.name}
        on:load={handleImageLoad}
        on:error={handleImageError}
        on:click={toggleZoom}
        class="{isFullscreen ? 'max-w-[100vw] max-h-[100vh]' : 'max-w-full max-h-[85vh]'} object-contain rounded-lg shadow-2xl cursor-zoom-in transition-all duration-300 {isZoomed ? 'scale-150 cursor-zoom-out' : ''} {loading ? 'opacity-0' : 'opacity-100'}"
        style="{isFullscreen ? 'max-width: 100vw !important; max-height: 100vh !important;' : ''}"
      />
    {/if}
  </div>

  <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
    {#if allImages.length <= 100}
      <div class="flex gap-1" role="tablist" aria-label="Image navigation">
        {#each allImages as _, i}
          <button
            on:click={() => {
              currentIndex = i;
              image = allImages[i];
              loading = true;
              imageError = false;
              isZoomed = false;
            }}
            class="w-2 h-2 rounded-full transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 {i === currentIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/70'}"
            role="tab"
            aria-label="Go to image {i + 1}"
            aria-selected={i === currentIndex}
            tabindex={i === currentIndex ? 0 : -1}
          />
        {/each}
      </div>
    {/if}
    <div class="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white">
      <p class="text-sm font-medium">
        {image.name} &bull; {currentIndex + 1} / {allImages.length}
      </p>
    </div>
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
