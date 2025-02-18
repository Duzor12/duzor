<script lang="ts">
  import { onMount } from 'svelte';
  import { draggable } from '@neodrag/svelte';
  import { getAssetUrl } from '$lib/b2Config';

  export let item: {
    type: 'image' | 'video' | 'resume';
    src: string;
    title: string;
    description: string;
    section: '3d' | 'software';
    initialPosition: { x: number; y: number };
  };

  export let index: number; // For staggered animation

  let showDetails = false;
  let showResume = false;
  let assetUrl = getAssetUrl(item.src);
  let resumeUrl = 'https://s3.us-east-005.backblazeb2.com/davidmedia/Resume-David+Uzor.pdf';

  $: console.log('Current asset URL:', item.type === 'resume' ? resumeUrl : assetUrl);

  let isLoaded = false;
  let isVisible = false;

  onMount(() => {
    // Add staggered delay based on index
    setTimeout(() => {
      isVisible = true;
    }, index * 100);

    if (item.type === 'image') {
      const img = new Image();
      img.src = assetUrl;
      img.onload = () => {
        isLoaded = true;
      };
    } else if (item.type === 'video') {
      const video = document.createElement('video');
      video.src = assetUrl;
      video.onloadeddata = () => {
        isLoaded = true;
      };
    } else if (item.type === 'resume') {
      // For resume, we'll check if the PDF exists
      fetch(resumeUrl, { method: 'HEAD' })
        .then(response => {
          isLoaded = response.ok;
        })
        .catch(() => {
          isLoaded = false;
        });
    }
  });

  function handleImageError() {
    const img = document.querySelector(`img[src="${assetUrl}"]`) as HTMLImageElement;
    if (img) img.style.opacity = '0.5';
  }

  function openResume() {
    if (item.type === 'resume') {
      showResume = true;
    }
  }
</script>

<div
  class="item"
  class:resume={item.type === 'resume'}
  class:loaded={isLoaded}
  class:visible={isVisible}
  use:draggable={{
    position: item.initialPosition,
    bounds: 'parent',
    defaultClass: 'false',
    axis: 'both'
  }}
  on:mouseenter={() => showDetails = true}
  on:mouseleave={() => showDetails = false}
  role="button"
  tabindex="0"
  aria-label={item.title}
>
  {#if !isLoaded}
    <div class="loading-skeleton" />
  {/if}
  
  {#if item.type === 'image'}
    <img 
      src={assetUrl} 
      alt={item.title} 
      draggable="false"
      decoding="async"
      on:error={handleImageError}
    />
  {:else if item.type === 'video'}
    <video 
      src={assetUrl} 
      autoplay 
      loop 
      muted 
      playsinline
      draggable="false"
      preload="metadata"
    />
  {:else if item.type === 'resume'}
    <button 
      class="resume-button"
      on:click|stopPropagation={openResume}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
      <span>View Resume</span>
    </button>
  {/if}

  {#if showDetails && item.type !== 'resume'}
    <div class="details">
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </div>
  {/if}
</div>

{#if showResume && item.type === 'resume'}
  <div class="resume-modal" on:click|self={() => showResume = false}>
    <div class="resume-content">
      <button class="close-button" on:click={() => showResume = false}>×</button>
      <iframe 
        src={resumeUrl}
        title="Resume PDF"
        width="100%"
        height="100%"
        frameborder="0"
      />
    </div>
  </div>
{/if}

<style lang="scss">
  .item {
    border-radius: 8px;
    overflow: hidden;
    cursor: grab;
    user-select: none;
    background: rgba(0, 0, 0, 0.2);
    position: absolute;
    transition: box-shadow 0.3s ease, opacity 0.5s ease, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    touch-action: none;
    max-width: 400px;
    width: auto;
    opacity: 0;
    transform: scale(0.95) translateY(10px);
    
    &.visible {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
    
    &.resume {
      width: 180px;
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(20, 20, 20, 0.95);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    &:hover {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      z-index: 10;
    }
    
    &:active {
      cursor: grabbing;
      z-index: 100;
    }

    img, video {
      display: block;
      width: auto;
      max-height: 400px;
      object-fit: contain;
      pointer-events: none;
      transition: opacity 0.3s ease;
      will-change: transform;
      backface-visibility: hidden;
      opacity: 0;
    }

    &.loaded {
      img, video {
        opacity: 1;
      }
    }
  }

  .loading-skeleton {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.05) 25%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.05) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  .resume-button {
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    width: 100%;
    height: 100%;
    cursor: pointer;
    background: none;
    border: none;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    svg {
      width: 48px;
      height: 48px;
      stroke: currentColor;
      stroke-width: 1.5;
    }

    span {
      font-size: 1rem;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
  }

  .resume-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .resume-content {
    position: relative;
    width: 90%;
    max-width: 1000px;
    height: 90vh;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  }

  .close-button {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    background: rgba(0, 0, 0, 0.8);
    border: none;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: 1.8rem;
    line-height: 1;
    cursor: pointer;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

    &:hover {
      background: rgba(0, 0, 0, 1);
      transform: scale(1.1);
    }
  }

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }

  .details {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1.5rem;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
    color: white;
    z-index: 2;
    transform: translateY(0);
    transition: transform 0.3s ease;

    h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.2rem;
      font-weight: 500;
    }

    p {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.8;
      line-height: 1.4;
    }
  }
</style> 