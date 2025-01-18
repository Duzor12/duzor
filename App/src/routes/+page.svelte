


<script>
    import * as THREE from 'three';
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    const renderer = new THREE.WebGLRenderer();
    let w =  window.innerWidth;
    let h = window.innerHeight;
    renderer.setSize( 1024, window.innerHeight );
    document.body.appendChild( renderer.domElement );


    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( { color: 0xFF4B2F } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    camera.position.z = 5;

    function animate() {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render( scene, camera );
    }

renderer.setAnimationLoop( animate );
</script>

<style>
   
</style>