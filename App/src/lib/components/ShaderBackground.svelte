<script lang="ts">
    import { onMount } from 'svelte';

    let canvas: HTMLCanvasElement;
    let gl: WebGLRenderingContext;
    let program: WebGLProgram;
    let timeLocation: WebGLUniformLocation;
    let resolutionLocation: WebGLUniformLocation;
    let time = 0;
    let animationFrame: number;

    const vertexShaderSource = `
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    const fragmentShaderSource = `
        precision highp float;
        uniform float time;
        uniform vec2 resolution;

        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        float squareNoise(vec2 st, float scale) {
            vec2 i = floor(st * scale);
            float r = random(i);
            // Smooth the edges slightly
            vec2 f = fract(st * scale);
            vec2 smooth = smoothstep(0.0, 0.1, f) * smoothstep(1.0, 0.9, f);
            return r * smooth.x * smooth.y;
        }

        float vignette(vec2 uv, float strength) {
            vec2 position = uv - 0.5;
            return 1.0 - (length(position * position) * strength);
        }

        void main() {
            vec2 uv = gl_FragCoord.xy/resolution.xy;
            float aspect = resolution.x/resolution.y;
            vec2 normalizedUV = vec2(uv.x * aspect, uv.y);
            
            float pattern = 0.0;
            
            // Large squares
            vec2 baseUV = normalizedUV + vec2(
                sin(time * 0.05) * 0.1,
                cos(time * 0.04) * 0.1
            );
            float baseNoise = squareNoise(baseUV + time * 0.04, 8.0) * 0.35;
            
            // Medium squares
            vec2 detailUV = normalizedUV + vec2(
                sin(time * 0.15 + baseNoise) * 0.2,
                cos(time * 0.1 + baseNoise) * 0.2
            );
            float detailNoise = squareNoise(detailUV + time * 0.08, 16.0) * 0.25;
            
            // Small squares
            vec2 fineUV = normalizedUV + vec2(
                sin(time * 0.1 + detailNoise) * 0.1,
                cos(time * 0.08 + detailNoise) * 0.1
            );
            float fineNoise = squareNoise(fineUV + time * 0.06, 32.0) * 0.2;
            
            // Very small squares
            vec2 ultraFineUV = normalizedUV + vec2(
                sin(time * 0.12 + fineNoise) * 0.05,
                cos(time * 0.1 + fineNoise) * 0.05
            );
            float ultraFineNoise = squareNoise(ultraFineUV + time * 0.08, 64.0) * 0.15;
            
            // Tiny squares
            vec2 microUV = normalizedUV + vec2(
                sin(time * 0.15 + ultraFineNoise) * 0.025,
                cos(time * 0.12 + ultraFineNoise) * 0.025
            );
            float microNoise = squareNoise(microUV + time * 0.09, 128.0) * 0.05;
            
            // Ultra tiny squares
            vec2 nanoUV = normalizedUV + vec2(
                sin(time * 0.18 + microNoise) * 0.0125,
                cos(time * 0.15 + microNoise) * 0.0125
            );
            float nanoNoise = squareNoise(nanoUV + time * 0.1, 256.0) * 0.025;
            
            // Grid flow effect
            float flow = step(0.5, sin(normalizedUV.x * 8.0 + time * 0.08 + baseNoise)) * 
                        step(0.5, cos(normalizedUV.y * 8.0 + time * 0.05 + detailNoise)) * 0.12;
            
            // Combine all layers
            pattern = baseNoise + detailNoise + fineNoise + ultraFineNoise + microNoise + nanoNoise + flow;
            
            // Add grid pattern
            float grid = step(0.9, sin(normalizedUV.x * 32.0 - time * 0.1)) * 
                        step(0.9, sin(normalizedUV.y * 32.0 - time * 0.1)) * 0.06;
            pattern += grid;
            
            // Create gradient with subtle depth
            vec3 color1 = vec3(0.01, 0.01, 0.01);
            vec3 color2 = vec3(0.12, 0.12, 0.12);
            vec3 finalColor = mix(color1, color2, pattern * 0.5 + 0.5);
            
            // Add subtle vignette
            float vig = vignette(uv, 1.2);
            finalColor *= mix(0.85, 1.0, vig);
            
            gl_FragColor = vec4(finalColor, 0.7);
        }
    `;

    function createShader(type: number, source: string): WebGLShader {
        const shader = gl.createShader(type);
        if (!shader) throw new Error('Failed to create shader');
        
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error('Shader compile error: ' + info);
        }
        
        return shader;
    }

    function initWebGL() {
        gl = canvas.getContext('webgl') as WebGLRenderingContext;
        if (!gl) throw new Error('WebGL not supported');

        const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

        program = gl.createProgram() as WebGLProgram;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error('Program link error: ' + gl.getProgramInfoLog(program));
        }

        const positions = new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            1, 1,
        ]);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        timeLocation = gl.getUniformLocation(program, 'time') as WebGLUniformLocation;
        resolutionLocation = gl.getUniformLocation(program, 'resolution') as WebGLUniformLocation;
    }

    function resizeCanvas() {
        const { width, height } = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function render() {
        time += 0.001;
        
        gl.useProgram(program);
        gl.uniform1f(timeLocation, time);
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        animationFrame = requestAnimationFrame(render);
    }

    onMount(() => {
        initWebGL();
        resizeCanvas();
        render();

        const handleResize = () => {
            resizeCanvas();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrame);
        };
    });
</script>

<canvas
    bind:this={canvas}
    class="shader-background"
/>

<style>
    .shader-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        pointer-events: none;
    }
</style> 