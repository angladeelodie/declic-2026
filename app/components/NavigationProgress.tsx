import {useNavigation} from 'react-router';
import {useEffect, useRef} from 'react';

/**
 * Top-of-page progress bar for route transitions.
 *
 * - Slides from 0 → ~85 % while the next page is loading (slow cubic-bezier)
 * - Snaps to 100 % and fades out the instant navigation completes
 * - Also toggles `body.is-navigating` so the custom cursor can react via CSS
 *
 * Uses direct DOM manipulation (no React state for animation) to keep it
 * jank-free even under heavy re-renders.
 */
export function NavigationProgress() {
  const navigation = useNavigation();
  const isNavigating = navigation.state !== 'idle';

  const barRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    // Clear any pending hide timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (isNavigating) {
      // ── Start: reset to 0 then slowly creep to 85 % ──────────────
      document.body.classList.add('is-navigating');

      bar.style.transition = 'none';
      bar.style.opacity = '1';
      bar.style.width = '0%';

      // Force reflow so the reset takes effect before we start the transition
      void bar.offsetWidth;

      bar.style.transition = 'width 10s cubic-bezier(0.22, 1, 0.36, 1)';
      bar.style.width = '85%';
    } else {
      // ── Complete: snap to 100 % then fade out ────────────────────
      document.body.classList.remove('is-navigating');

      bar.style.transition = 'width 0.12s ease';
      bar.style.width = '100%';

      timerRef.current = setTimeout(() => {
        if (barRef.current) {
          barRef.current.style.transition = 'opacity 0.2s ease';
          barRef.current.style.opacity = '0';
        }
      }, 130);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isNavigating]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        zIndex: 9998,
        pointerEvents: 'none',
      }}
    >
      <div
        ref={barRef}
        style={{
          height: '100%',
          width: '0%',
          opacity: 0,
          backgroundColor: 'var(--color-accent)',
        }}
      />
    </div>
  );
}
