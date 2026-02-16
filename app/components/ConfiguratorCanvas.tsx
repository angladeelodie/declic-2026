// app/components/PreviewCanvas.tsx
import {useEffect, useRef} from 'react';
import * as THREE from 'three';

export function ConfiguratorCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // SSR guard: only run on the client
    if (!containerRef.current || typeof window === 'undefined') return;

    const container = containerRef.current;

    // Set up scene, camera, renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf3f4f6); // tailwind gray-100 style

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 600;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);

    container.appendChild(renderer.domElement);

    // Simple demo geometry: a spinning cube
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0x111827, // tailwind gray-900
      roughness: 0.5,
      metalness: 0.1,
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Basic lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(2, 4, 5);
    scene.add(directional);

    // Animation loop
    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      cube.rotation.y += 0.01;
      cube.rotation.x += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || width;
      const h = container.clientHeight || height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);

      // Dispose Three.js objects
      geometry.dispose();
      material.dispose();
      renderer.dispose();

      // Remove canvas from DOM
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}
    />
  );
}