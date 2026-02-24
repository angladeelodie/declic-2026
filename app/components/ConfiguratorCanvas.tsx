import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

type ConfiguratorCanvasProps = {
  topModelUrl: string | null;
  bottomModelUrl: string | null;
  sleeveModelUrl: string | null;
  topColor: string | null;
  bottomColor: string | null;
  sleeveColor: string | null;
};

export function ConfiguratorCanvas({
  topModelUrl,
  bottomModelUrl,
  sleeveModelUrl,
  topColor,
  bottomColor,
  sleeveColor,
}: ConfiguratorCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const loaderRef = useRef(new GLTFLoader());
  const garmentRefs = useRef<{ top?: THREE.Object3D; bottom?: THREE.Object3D; sleeve?: THREE.Object3D }>({});
  const colorRefs = useRef<{top: string | null; bottom: string | null; sleeve: string | null}>({top: null, bottom: null, sleeve: null});

  // Keep color refs in sync with props so async load callbacks can read the latest value
  colorRefs.current.top    = topColor;
  colorRefs.current.bottom = bottomColor;
  colorRefs.current.sleeve = sleeveColor;

  function applyColorToGarment(garment: THREE.Object3D, hexColor: string) {
    const color = new THREE.Color(hexColor);
    garment.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((mat) => {
          if ((mat as THREE.MeshStandardMaterial).color) {
            (mat as THREE.MeshStandardMaterial).color.set(color);
          }
        });
      }
    });
  }

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf3f4f6);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
    // Initial position
    camera.position.set(0, 1, 1.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 1, 0);
    // Disable auto-rotate here because we will control the camera manually for the 180 swing
    controls.enablePan = false; 

    // --- ENHANCED LIGHT SETUP (Studio Style) ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4)); // Soft overall light

    // Key Light: Main source
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(5, 5, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Fill Light: Softens shadows from the other side
    const fillLight = new THREE.DirectionalLight(0xffffff, 1.6);
    fillLight.position.set(-5, 2, 2);
    scene.add(fillLight);

    // Back Light: Creates a "rim" effect to separate model from background
    const rimLight = new THREE.DirectionalLight(0xffffff, 2.0);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);

    // Load Mannequin
    // loaderRef.current.load('/avatar.glb', (gltf) => {
    //   gltf.scene.traverse((node) => { if ((node as any).isMesh) node.receiveShadow = true; });
    //   scene.add(gltf.scene);
    // });

    // --- CINEMATIC CAMERA LOGIC ---
    let frameId: number;
    let angle = 0; 
    const radius = 2.5; // Distance from center
    const speed = 0.008; // Adjust for slower/faster rotation

 const animate = () => {
  frameId = requestAnimationFrame(animate);

  // --- GARMENT TRANSITIONS ---
  Object.values(garmentRefs.current).forEach((model) => {
    if (model && model.userData.targetScale) {
      // Smoothly scale up
      const lerpSpeed = 0.1; // Adjust for "snappiness" (0.1 is smooth)
      
      // Update Scale
      model.scale.lerp(new THREE.Vector3(1, 1, 1), lerpSpeed);
      
      // Update Opacity
      model.traverse((node) => {
        if ((node as any).isMesh) {
          const mat = (node as THREE.Mesh).material as THREE.Material;
          if (mat.opacity < 1) {
            mat.opacity += (1 - mat.opacity) * lerpSpeed;
          }
        }
      });
    }
  });

  // --- CAMERA SWING ---
  angle += speed;
  const swingAngle = Math.sin(angle) * (Math.PI / 2); 
  camera.position.x = Math.sin(swingAngle) * radius;
  camera.position.z = Math.cos(swingAngle) * radius;
  
  controls.update();
  renderer.render(scene, camera);
};
    animate();

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

 const updateGarment = (url: string | null, key: keyof typeof garmentRefs.current) => {
  const scene = sceneRef.current;
  if (!scene) return;

  // 1. Remove old garment
  if (garmentRefs.current[key]) {
    scene.remove(garmentRefs.current[key]!);
    // (Dispose logic here as before...)
  }

  // 2. Load new garment
  if (url) {
    loaderRef.current.load(url, (gltf) => {
      const model = gltf.scene;
      
      // PREPARE FOR ANIMATION
      model.scale.set(0.8, 0.8, 0.8); // Start slightly smaller
      model.userData.targetScale = 1.0; // The goal
      
      model.traverse((node) => {
        if ((node as any).isMesh) {
          node.castShadow = true;
          // Prepare for fade-in
          const mesh = node as THREE.Mesh;
          if (mesh.material) {
            (mesh.material as THREE.Material).transparent = true;
            (mesh.material as THREE.Material).opacity = 0;
          }
        }
      });

      garmentRefs.current[key] = model;
      scene.add(model);

      // Apply color immediately if one is already selected
      const hex = colorRefs.current[key];
      if (hex) applyColorToGarment(model, hex);
    });
  }
};

  useEffect(() => { updateGarment(topModelUrl, 'top'); }, [topModelUrl]);
  useEffect(() => { updateGarment(bottomModelUrl, 'bottom'); }, [bottomModelUrl]);
  useEffect(() => { updateGarment(sleeveModelUrl, 'sleeve'); }, [sleeveModelUrl]);

  useEffect(() => { if (topColor    && garmentRefs.current.top)    applyColorToGarment(garmentRefs.current.top,    topColor);    }, [topColor]);
  useEffect(() => { if (bottomColor && garmentRefs.current.bottom) applyColorToGarment(garmentRefs.current.bottom, bottomColor); }, [bottomColor]);
  useEffect(() => { if (sleeveColor && garmentRefs.current.sleeve) applyColorToGarment(garmentRefs.current.sleeve, sleeveColor); }, [sleeveColor]);

  return <div ref={containerRef} className="w-full h-full" />;
}