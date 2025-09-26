<script>
  export let images = [];
  export let favorites = new Set();
  export let onImageSelect;
  export let onToggleFavorite;

  function handleImageClick(image) {
    onImageSelect(image);
  }

  function handleFavoriteClick(e, imageId) {
    e.stopPropagation();
    onToggleFavorite(imageId);
  }
</script>

<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-fade-in">
  {#each images as image (image.id)}
    <div
      class="group relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
      on:click={() => handleImageClick(image)}
      role="button"
      tabindex="0"
      on:keydown={(e) => e.key === 'Enter' && handleImageClick(image)}
    >
      <div class="aspect-square relative bg-gradient-to-br from-slate-100 to-slate-200">
        <img
          src={image.thumbnail}
          alt={image.name}
          class="w-full h-full object-cover"
          loading="lazy"
        />

        <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <button
          on:click={(e) => handleFavoriteClick(e, image.id)}
          class="absolute top-2 right-2 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100"
          aria-label="Toggle favorite"
        >
          <svg
            class="w-5 h-5 transition-colors duration-200 {favorites.has(image.id) ? 'text-red-500 fill-current' : 'text-slate-600'}"
            fill={favorites.has(image.id) ? "currentColor" : "none"}
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

        <div class="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p class="text-sm font-medium truncate drop-shadow-lg">
            {image.name}
          </p>
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fadeIn 0.4s ease-out;
  }
</style>