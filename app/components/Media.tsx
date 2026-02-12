import {useEffect, useRef, useState} from 'react';

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
  // Initialize with the Shopify value, or 0
  const initialStyle = Number(media.style_index?.value || 0);
  const [currentStyle, setCurrentStyle] = useState(initialStyle);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const triggerRandomChange = () => {
      // 1. Update the style
      setCurrentStyle(() => {
        const keys = Object.keys(STYLE_MAP).map(Number);
        const randomIndex = Math.floor(Math.random() * keys.length);
        return keys[randomIndex];
      });

      // 2. Schedule the next change with a random delay between 3000ms and 6000ms
      const randomDelay = Math.floor(Math.random() * (6000 - 3000 + 1)) + 3000;
      timeoutRef.current = setTimeout(triggerRandomChange, randomDelay);
    };

    // Start the cycle
    triggerRandomChange();

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  const actualMediaData = media?.media?.reference;

  if (!actualMediaData) return null;

  const isImage = actualMediaData?.__typename === 'MediaImage';
  const isVideo = actualMediaData?.__typename === 'Video';

  const cornerClass = STYLE_MAP[currentStyle];
  // Combine logic: we apply the aspect ratio via inline styles
  // to support dynamic strings like "16/9" easily.
  const combinedClasses = `
    overflow-hidden self-stretch lg:contain-size 
    transition-[border-radius] duration-2000 ease-in-out 
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
    return (
      <div className={combinedClasses} style={containerStyle}>
        <video
          muted
          autoPlay
          loop
          playsInline
          controls={false}
          poster={actualMediaData.previewImage?.url}
          className="w-full h-full object-cover"
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
