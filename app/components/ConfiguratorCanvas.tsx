import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

type ActiveCategory = 'tops' | 'bottoms' | 'sleeves' | null;

// ─── Camera target positions per category ────────────────────────────────────
// Adjust these values to dial in the framing for each category.
// y        = camera height
// lookAtY  = the Y point the camera looks at (orbit target)
// radius   = orbit distance (smaller = more zoomed in)
const CAMERA_TARGETS: Record<NonNullable<ActiveCategory>, {y: number; lookAtY: number; radius: number}> = {
  tops: {y: 1.5,  lookAtY: 1.3, radius: 1.6},
  sleeves:    {y: 1.6,  lookAtY: 1.4, radius: 2.2},
  bottoms: {y: 0.6,  lookAtY: 0.5, radius: 2.5},
};

// Full-body shot when no category is selected
const CAMERA_FULL_BODY = {y: 1.0, lookAtY: 0.9, radius: 3.2};

// Easing speed for the camera transition (0 = instant, 1 = no movement)
const CAMERA_LERP_SPEED = 0.04;

type ConfiguratorCanvasProps = {
  topModelUrl: string | null;
  bottomModelUrl: string | null;
  sleeveModelUrl: string | null;
  topColor: string | null;
  bottomColor: string | null;
  sleeveColor: string | null;
  activeCategory: ActiveCategory;
};

export function ConfiguratorCanvas({
  topModelUrl,
  bottomModelUrl,
  sleeveModelUrl,
  topColor,
  bottomColor,
  sleeveColor,
  activeCategory,
}: ConfiguratorCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const loaderRef = useRef(new GLTFLoader());
  const garmentRefs = useRef<{ top?: THREE.Object3D; bottom?: THREE.Object3D; sleeve?: THREE.Object3D }>({});
  const colorRefs = useRef<{top: string | null; bottom: string | null; sleeve: string | null}>({top: null, bottom: null, sleeve: null});

  // Keep refs in sync so the animation loop always reads the latest values
  colorRefs.current.top    = topColor;
  colorRefs.current.bottom = bottomColor;
  colorRefs.current.sleeve = sleeveColor;

  const activeCategoryRef = useRef<ActiveCategory>(activeCategory);
  activeCategoryRef.current = activeCategory;

  // Live camera state — lerped toward the target each frame (start at full-body)
  const camYRef     = useRef(CAMERA_FULL_BODY.y);
  const lookAtYRef  = useRef(CAMERA_FULL_BODY.lookAtY);
  const radiusRef   = useRef(CAMERA_FULL_BODY.radius);

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
    // Initial position — full-body view (no category selected on load)
    camera.position.set(0, CAMERA_FULL_BODY.y, CAMERA_FULL_BODY.radius);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, CAMERA_FULL_BODY.lookAtY, 0);
    // Disable auto-rotate here because we will control the camera manually for the 180 swing
    controls.enablePan = false; 

    // --- ENHANCED LIGHT SETUP (Studio Style) ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4)); // Soft overall light

    // Key Light: Main source
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);

    // Fill Light: Softens shadows from the other side
    const fillLight = new THREE.DirectionalLight(0xffffff, 1.6);
    fillLight.position.set(-5, 2, 2);
    scene.add(fillLight);

    // Back Light: Creates a "rim" effect to separate model from background
    const rimLight = new THREE.DirectionalLight(0xffffff, 2.0);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);

    // Blob shadow — a radial gradient painted onto a canvas, always perfectly smooth
    const blobCanvas = document.createElement('canvas');
    blobCanvas.width  = 256;
    blobCanvas.height = 256;
    const blobCtx = blobCanvas.getContext('2d')!;
    const grad = blobCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0,   'rgba(0,0,0,0.35)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0.12)');
    grad.addColorStop(1,   'rgba(0,0,0,0)');
    blobCtx.fillStyle = grad;
    blobCtx.fillRect(0, 0, 256, 256);
    const blobTexture = new THREE.CanvasTexture(blobCanvas);

    const blobShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 1.6),
      new THREE.MeshBasicMaterial({
        map: blobTexture,
        transparent: true,
        depthWrite: false,
      }),
    );
    blobShadow.rotation.x = -Math.PI / 2;
    blobShadow.position.y = 0.001; // just above floor to avoid z-fighting
    scene.add(blobShadow);

    // Load Mannequin
    // loaderRef.current.load('/avatar.glb', (gltf) => {
    //   gltf.scene.traverse((node) => { if ((node as any).isMesh) node.receiveShadow = true; });
    //   scene.add(gltf.scene);
    // });

    // --- CINEMATIC CAMERA LOGIC ---
    let frameId: number;
    let angle = 0;
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
          const mats = Array.isArray((node as THREE.Mesh).material)
            ? ((node as THREE.Mesh).material as THREE.Material[])
            : [(node as THREE.Mesh).material as THREE.Material];
          mats.forEach((mat) => {
            if (mat.opacity < 1) mat.opacity += (1 - mat.opacity) * lerpSpeed;
          });
        }
      });
    }
  });

  // --- CAMERA SWING ---
  angle += speed;
  const swingAngle = Math.sin(angle) * (Math.PI / 2);

  // Lerp toward the target camera position for the active category
  const target = activeCategoryRef.current
    ? CAMERA_TARGETS[activeCategoryRef.current]
    : CAMERA_FULL_BODY;
  camYRef.current    += (target.y       - camYRef.current)    * CAMERA_LERP_SPEED;
  lookAtYRef.current += (target.lookAtY - lookAtYRef.current) * CAMERA_LERP_SPEED;
  radiusRef.current  += (target.radius  - radiusRef.current)  * CAMERA_LERP_SPEED;

  camera.position.x = Math.sin(swingAngle) * radiusRef.current;
  camera.position.z = Math.cos(swingAngle) * radiusRef.current;
  camera.position.y = camYRef.current;

  controls.target.set(0, lookAtYRef.current, 0);
  
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
          // Prepare for fade-in
          const mesh = node as THREE.Mesh;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((mat) => {
            const m = mat as THREE.Material;
            m.transparent = true;
            m.opacity     = 0;
          });
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