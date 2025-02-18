<script lang="ts">
    import { onMount } from 'svelte';
    import '../app.css';

    onMount(() => {
        // Prevent default zoom behavior on mobile devices
        document.addEventListener('touchmove', (event: TouchEvent & { scale?: number }) => {
            if (event.scale !== 1) {
                event.preventDefault();
            }
        }, { passive: false });
        
        document.addEventListener('gesturestart', (event: Event) => {
            event.preventDefault();
        });
    });
</script>

<style lang="scss">
    /* CSS Reset */
    *, *::before, *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    :global(html, body) {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
    }

    :global(body) {
        scroll-behavior: smooth;
        text-rendering: optimizeSpeed;
        background: 
            radial-gradient(#ffffff10 1px, transparent 1px),
            linear-gradient(45deg, #090909, #131313);
        background-size: 30px 30px, 100% 100%;
        background-blend-mode: normal;
        position: fixed;
        font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        color: #fff;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    :global(main) {
        height: 100vh;
        width: 100vw;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    :global(ul[class], ol[class]) {
        list-style: none;
    }

    :global(a:not([class])) {
        text-decoration-skip-ink: auto;
    }

    :global(img) {
        max-width: 100%;
        display: block;
    }

    @media (prefers-reduced-motion: reduce) {
        :global(*) {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
        }
    }

    :global(*) {
        box-sizing: border-box;
    }

    :global(a) {
        color: inherit;
        text-decoration: none;
    }

    :global(button) {
        font-family: inherit;
    }
</style>

<slot />
