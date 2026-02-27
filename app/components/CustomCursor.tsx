import {useEffect, useRef} from 'react';

/**
 * Custom dot cursor with a lagging ring.
 * - Dot follows the pointer exactly
 * - Ring trails with lerp via requestAnimationFrame
 * - Grows on interactive elements, shrinks on click
 * - Self-disables on touch-only devices
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on pointer-capable (non-touch) devices
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = -200;
    let mouseY = -200;
    let ringX = -200;
    let ringY = -200;
    let rafId: number;

    // ── Position tracking ──────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Dot follows instantly
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      dot.classList.add('is-visible');
      ring.classList.add('is-visible');
    };

    // Ring uses lerp for a trailing effect
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      ringX = lerp(ringX, mouseX, 0.25);
      ringY = lerp(ringY, mouseY, 0.25);
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    // ── Hover detection ────────────────────────────────────────────
    const INTERACTIVE =
      'a, button, [role="button"], input, select, textarea, label, [tabindex="0"], summary, .cursor-pointer';

    const onOver = (e: MouseEvent) => {
      const isInteractive = !!(e.target as Element).closest(INTERACTIVE);
      dot.classList.toggle('is-hovering', isInteractive);
      ring.classList.toggle('is-hovering', isInteractive);
    };

    // ── Click feedback ─────────────────────────────────────────────
    const onDown = () => {
      dot.classList.add('is-clicking');
      ring.classList.add('is-clicking');
    };
    const onUp = () => {
      dot.classList.remove('is-clicking');
      ring.classList.remove('is-clicking');
    };

    // ── Visibility when leaving / re-entering the window ──────────
    const onLeave = () => {
      dot.classList.remove('is-visible');
      ring.classList.remove('is-visible');
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);
    document.documentElement.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="custom-cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="custom-cursor-ring" aria-hidden="true" />
    </>
  );
}
