<script lang="ts">
    import { onMount } from 'svelte';
    import Item from '$lib/components/Item.svelte';
    import About from '$lib/components/About.svelte';
    import ShaderBackground from '$lib/components/ShaderBackground.svelte';
    
    let scale = 1;
    let activeSection = '3d';
    let container: HTMLElement;
    
    type ItemType = {
        type: 'image' | 'video' | 'resume';
        src: string;
        title: string;
        description: string;
        section: '3d' | 'software';
        initialPosition: { x: number; y: number };
    };
    
    const items: ItemType[] = [
        // 3D Design Projects
        { 
            type: 'video', 
            src: '1715Slotmachine.mp4', 
            title: 'Slot Machine Animation', 
            description: '3D animated slot machine with detailed mechanics and lighting', 
            section: '3d',
            initialPosition: { x: 40, y: 40 }
        },
        { 
            type: 'image', 
            src: 'ChelseaAwayJersey.png', 
            title: 'Chelsea Away Jersey', 
            description: 'Photorealistic jersey design with fabric simulation', 
            section: '3d',
            initialPosition: { x: 340, y: 40 }
        },
        { 
            type: 'video', 
            src: 'Clothesfinalvox.mp4', 
            title: 'Clothing Animation', 
            description: 'Dynamic cloth simulation with advanced materials', 
            section: '3d',
            initialPosition: { x: 640, y: 40 }
        },
        { 
            type: 'image', 
            src: 'LatteDrink.png', 
            title: 'Latte Visualization', 
            description: 'Stylized beverage render with volumetric lighting', 
            section: '3d',
            initialPosition: { x: 940, y: 40 }
        },
        { 
            type: 'image', 
            src: 'ManSittingDown.png', 
            title: 'Character Pose', 
            description: 'Character visualization with ambient lighting', 
            section: '3d',
            initialPosition: { x: 40, y: 290 }
        },
        { 
            type: 'video', 
            src: 'Vcardvideo.mp4', 
            title: 'Video Card Animation', 
            description: 'Animated graphics card with detailed components', 
            section: '3d',
            initialPosition: { x: 340, y: 290 }
        },
        { 
            type: 'image', 
            src: 'WomanSittingComposited.png', 
            title: 'Character Composition', 
            description: 'Composited character render with environmental lighting', 
            section: '3d',
            initialPosition: { x: 640, y: 290 }
        },
        {
            type: 'video',
            src: 'Vibesandbottles.mp4',
            title: '3D Video',
            description: 'Promotional video for Vibes and Bottles 2.0 - a club event',
            section: '3d',
            initialPosition: { x: 940, y: 290 }
        },
        
        // Software Engineering Section
        { 
            type: 'resume',
            src: 'Resume-David+Uzor.pdf',
            title: 'Software Engineering Resume',
            description: 'View my professional experience and technical skills',
            section: 'software',
            initialPosition: { x: window.innerWidth / 2 - 90, y: window.innerHeight / 2 - 90 }
        }
    ];

    onMount(() => {
        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
                scale = Math.min(Math.max(0.5, scale + (e.deltaY * -0.001)), 3);
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        
        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    });
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
</svelte:head>

<main bind:this={container}>
    <ShaderBackground />
    
    <div class="nav">
        <button class:active={activeSection === '3d'} on:click={() => activeSection = '3d'}>3D Design</button>
        <button class:active={activeSection === 'software'} on:click={() => activeSection = 'software'}>Software Engineering</button>
    </div>

    <div class="gallery" style="transform: scale({scale})">
        {#each items.filter(item => item.section === activeSection) as item, index}
            <Item {item} {index} />
        {/each}
    </div>
    <About />
</main>

<style lang="scss">
    main {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        background: #090909;
        position: relative;
        font-family: 'DM Sans', sans-serif;


        &::after {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(
                circle 60rem at center,
                transparent 0%,
                rgba(0, 0, 0, 1) 100%
            );
            pointer-events: none;
            z-index: 2;
        }
    }

    .nav {
        position: fixed;
        top: 2rem;
        left: 50%;
        transform: translateX(-50%);
        z-index: 20;
        display: flex;
        gap: 2rem;
        
        button {
            background: none;
            border: none;
            color: #ffffff80;
            font-size: 1.2rem;
            cursor: pointer;
            transition: color 0.3s ease;
            font-family: 'DM Sans', sans-serif;
            
            &.active {
                color: #fff;
            }
            
            &:hover {
                color: #fff;
            }
        }
    }

    .gallery {

       column-count: 3;
        position: relative;
        width: 100%;
        min-height: calc(100vh - 8rem);
        height: 100%;
        transform-origin: center center;
        padding: 2rem;
        z-index: 10;
        display: flex;
        flex-wrap: nowrap;
        gap: 2rem;
        overflow-x: auto;
        overflow-y: visible;
        align-items: start;
        
        /* Smooth scrolling */
        scroll-behavior: smooth;
        /* Hide scrollbar but keep functionality */
        scrollbar-width: none;
        -ms-overflow-style: none;
        &::-webkit-scrollbar {
            display: none;
        }
        
        /* Enable touch scrolling on mobile */
        -webkit-overflow-scrolling: touch;
        
        @media (max-width: 768px) {
            gap: 1.5rem;
            padding: 1.5rem;
        }
    }

    .about-container {
        position: absolute;
        top: 20px;
        right: 20px;
        z-index: 15;
    }

    :global(body) {
        margin: 0;
        padding: 0;
        font-family: 'DM Sans', sans-serif !important;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        background: #090909;
        color: #fff;
    }
</style>