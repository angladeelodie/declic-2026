import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
// Import OrbitControls
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

type ConfiguratorCanvasProps = {
  topModelUrl: string | null;
  bottomModelUrl: string | null;
  sleeveModelUrl: string | null;
};

export function ConfiguratorCanvas({
  topModelUrl,
  bottomModelUrl,
  sleeveModelUrl,
}: ConfiguratorCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf3f4f6);

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    // Position camera higher up to look at the mannequin
    camera.position.set(0, 1.6, 3);

    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true; // Enable shadows for better depth
    container.appendChild(renderer.domElement);

    // --- CONTROLS ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 1, 0); // Focus on the chest area
    controls.minDistance = 1;      // Max zoom in
    controls.maxDistance = 10;     // Max zoom out

    // --- LIGHTS ---
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, 1);
    directional.position.set(5, 10, 7.5);
    directional.castShadow = true;
    scene.add(directional);

    // --- HELPERS & FLOOR ---
    // Grid helper at 0,0,0
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // Ground plane at y = 0
    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0; // Explicitly at 0
    ground.receiveShadow = true;
    scene.add(ground);

    const loader = new GLTFLoader();
    
    // --- LOAD MANNEQUIN (Static) ---
    loader.load('/mannequin.glb', (gltf) => {
      const mannequin = gltf.scene;
      mannequin.position.set(0, 0, 0); // Feet on the floor
      scene.add(mannequin);
    });

    // --- LOAD CLOTHING (Dynamic) ---
    let currentModel: THREE.Object3D | null = null;

    function loadClothing(url: string) {
      if (currentModel) scene.remove(currentModel);
      
      loader.load(url, (gltf) => {
        currentModel = gltf.scene;
        currentModel.position.set(0, 0, 0); // Position exactly like mannequin
        scene.add(currentModel);
      });
    }

    const activeUrl = topModelUrl || bottomModelUrl || sleeveModelUrl;
    if (activeUrl) loadClothing(activeUrl);

    // --- ANIMATION LOOP ---
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update(); // Required for damping
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [topModelUrl, bottomModelUrl, sleeveModelUrl]);

  return <div ref={containerRef} className="w-full h-full" />;
}