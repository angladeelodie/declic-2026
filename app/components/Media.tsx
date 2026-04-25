import { useEffect, useRef, useState } from 'react';

interface MediaProps {
  media: any;
  className?: string; 
  aspectRatio?: string; 
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
  const videoRef = useRef<HTMLVideoElement>(null);

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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch((error) => {
        console.warn("Autoplay was prevented by the browser:", error);
      });
    }
  }, [media]);

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

  // ZOOM SETTING: scale-[1.02] provides a 2% zoom. 
  // Combined with object-cover, this pushes the "frame" out of the visible area.
  const mediaClasses = "w-full h-full object-cover scale-[1.02]";

  if (isImage && actualMediaData.image?.url) {
    return (
      <div className={combinedClasses} style={containerStyle}>
        <img
          src={actualMediaData.image.url}
          alt={actualMediaData.image.altText || ''}
          className={mediaClasses}
        />
      </div>
    );
  }

  if (isVideo && actualMediaData.sources) {
    const videoUrl = actualMediaData.sources[0]?.url;
    
    return (
      <div className={combinedClasses} style={containerStyle}>
        <video
          ref={videoRef}
          key={videoUrl}
          muted
          autoPlay
          loop
          playsInline
          controls={false}
          poster={actualMediaData.previewImage?.url}
          className={`${mediaClasses} object-top`}
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