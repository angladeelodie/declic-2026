import { useEffect, useRef, useState } from 'react';

interface MediaProps {
  media: any;
  className?: string; // Classes passed from the parent
  aspectRatio?: string; // e.g., "16/9", "4/5", "1/1"
}

const STYLE_MAP: Record<number, string> = {
  0: 'rounded-[var(--radius-sharp)]',
  1: 'rounded-[var(--radius-sharp)_var(--radius-round)_var(--radius-round)_var(--radius-round)]',
  2: 'rounded-[var(--radius-round)_var(--radius-sharp)_var(--radius-round)_var(--radius-round)]',
  3: 'rounded-[var(--radius-round)_var(--radius-round)_var(--radius-sharp)_var(--radius-round)]',
  4: 'rounded-[var(--radius-round)_var(--radius-round)_var(--radius-round)_var(--radius-sharp)]',
  5: 'rounded-[var(--radius-sharp)_var(--radius-round)_var(--radius-sharp)_var(--radius-round)]',
  6: 'rounded-[var(--radius-round)_var(--radius-sharp)_var(--radius-round)_var(--radius-sharp)]',
};

export function Media({
  media,
  className = '',
  aspectRatio = 'auto',
}: MediaProps) {
  const initialStyle = Number(media.style_index?.value || 0);
  const [currentStyle, setCurrentStyle] = useState(initialStyle);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Create a ref to target the video element directly
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- Logic for Random Style Changes ---
  useEffect(() => {
    const triggerRandomChange = () => {
      setCurrentStyle(() => {
        const keys = Object.keys(STYLE_MAP).map(Number);
        const randomIndex = Math.floor(Math.random() * keys.length);
        return keys[randomIndex];
      });

      const randomDelay = Math.floor(Math.random() * (6000 - 3000 + 1)) + 3000;
      timeoutRef.current = setTimeout(triggerRandomChange, randomDelay);
    };

    triggerRandomChange();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // --- Logic to force Autoplay ---
  useEffect(() => {
    if (videoRef.current) {
      // Ensure the video is muted (required for autoplay)
      videoRef.current.muted = true;
      videoRef.current.play().catch((error) => {
        // This catch prevents the "Uncaught (in promise)" error in the console
        // if the browser blocks the play attempt.
        console.warn("Autoplay was prevented by the browser:", error);
      });
    }
  }, [media]); // Re-run if the media data changes

  const actualMediaData = media?.media?.reference;
  if (!actualMediaData) return null;

  const isImage = actualMediaData?.__typename === 'MediaImage';
  const isVideo = actualMediaData?.__typename === 'Video';

  const cornerClass = STYLE_MAP[currentStyle];
  const combinedClasses = `
    overflow-hidden self-stretch lg:contain-size 
    transition-[border-radius] duration-1000 ease-in-out 
    ${cornerClass} ${className}
  `.trim();

  const containerStyle = {
    aspectRatio: aspectRatio,
  };

  // --- Render Image ---
  if (isImage && actualMediaData.image?.url) {
    return (
      <div className={combinedClasses} style={containerStyle}>
        <img
          src={actualMediaData.image.url}
          alt={actualMediaData.image.altText || ''}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // --- Render Video ---
  if (isVideo && actualMediaData.sources) {
    const videoUrl = actualMediaData.sources[0]?.url;
    
    return (
      <div className={combinedClasses} style={containerStyle}>
        <video
          ref={videoRef}
          key={videoUrl} // Keying by URL prevents unmounts during style changes
          muted
          autoPlay
          loop
          playsInline
          controls={false}
          poster={actualMediaData.previewImage?.url}
          className="w-full h-full object-cover object-top"
        >
          {actualMediaData.sources.map((source: any) => (
            <source key={source.url} src={source.url} type={source.mimeType} />
          ))}
        </video>
      </div>
    );
  }

  return null;
}