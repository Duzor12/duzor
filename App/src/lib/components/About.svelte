<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { onMount } from 'svelte';

    let showModal = false;
    let aboutElement: HTMLElement;
    let isDragging = false;
    let position = { x: 0, y: 0 };
    let dragStart = { x: 0, y: 0 };

    function handleMouseDown(e: MouseEvent) {
        if (e.target === aboutElement) {
            isDragging = true;
            const rect = aboutElement.getBoundingClientRect();
            dragStart = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            e.preventDefault();
        }
    }

    function handleMouseMove(e: MouseEvent) {
        if (!isDragging) return;
        
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        const viewportWidth = document.documentElement.clientWidth;
        const viewportHeight = document.documentElement.clientHeight;
        
        const padding = 20;
        const maxX = viewportWidth - aboutElement.offsetWidth - padding;
        const maxY = viewportHeight - aboutElement.offsetHeight - padding;
        
        position = {
            x: Math.max(padding, Math.min(maxX, newX)),
            y: Math.max(padding, Math.min(maxY, newY))
        };
        
        aboutElement.style.transform = `translate(${position.x - viewportWidth + aboutElement.offsetWidth + padding}px, ${position.y}px)`;
    }

    function handleMouseUp() {
        isDragging = false;
    }

    onMount(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    });
</script>

<div
    bind:this={aboutElement}
    class="about-trigger"
    on:mousedown={handleMouseDown}
    role="button"
    tabindex="0"
    aria-label="Open about section"
    on:keydown={(e) => e.key === 'Enter' && (showModal = true)}
    on:click={() => showModal = true}
>
    about
</div>

{#if showModal}
    <div class="modal-backdrop" transition:fade on:click={() => showModal = false}>
        <div 
            class="modal" 
            transition:fly={{ y: 20, duration: 300 }}
            on:click={(e) => e.stopPropagation()}
        >
            <button 
                class="close-button"
                on:click={() => showModal = false}
                aria-label="Close modal"
            >
                ×
            </button>
            <div class="modal-content">
                <h2>About Me</h2>
                <p class="bio">
                    Hey, I'm David! I love creating cool stuff with code and 3D graphics. What started as 
                    messing around with Blender in early 2024 quickly turned into an obsession with making 
                    things look awesome on screens. These days, I split my time between building interactive 
                    web experiences and diving deep into 3D graphics—everything from fluid simulations to 
                    character animations. I'm particularly excited about where AI and computational graphics 
                    are heading, and I'm always tinkering with new ways to blend technical and artistic elements 
                    in my work.
                </p>
            </div>
        </div>
    </div>
{/if}

<style lang="scss">
    .about-trigger {
        position: fixed;
        top: 20px;
        right: 20px;
        cursor: grab;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(8px);
        padding: 0.8rem 1.2rem;
        border-radius: 4px;
        font-size: 0.9rem;
        color: white;
        user-select: none;
        transition: background 0.3s ease;
        z-index: 100;
        transform: translate(0, 0);

        &:hover {
            background: rgba(255, 255, 255, 0.15);
        }

        &:active {
            cursor: grabbing;
        }
    }

    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal {
        position: relative;
        background: rgba(20, 20, 20, 0.95);
        backdrop-filter: blur(12px);
        border-radius: 8px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .close-button {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.5rem;
        line-height: 1;
        opacity: 0.7;
        transition: opacity 0.3s ease;

        &:hover {
            opacity: 1;
        }
    }

    .modal-content {
        h2 {
            margin: 0 0 1.5rem 0;
            font-size: 2rem;
            font-weight: 500;
            background: linear-gradient(90deg, #fff, #fff8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .bio {
            margin: 0;
            line-height: 1.7;
            color: rgba(255, 255, 255, 0.9);
            font-size: 1.1rem;
            letter-spacing: 0.2px;
        }
    }
</style> 