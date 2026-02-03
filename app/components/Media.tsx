interface MediaProps {
  media: any;
  className?: string; // Classes passed from the parent
}

const STYLE_MAP: Record<number, string> = {
  0: 'rounded-[30px_30px_30px_30px]',
  1: 'rounded-[30px_400px_400px_400px]',
  2: 'rounded-[400px_30px_400px_400px]',
  3: 'rounded-[400px_400px_30px_400px]',
  4: 'rounded-[400px_400px_400px_30px]',
  5: 'rounded-[30px_400px_30px_400px]',
  6: 'rounded-[400px_30px_400px_30px]',
};

export function Media({ media, className = '', order }: MediaProps) {
  // 1. Extract the deep Shopify reference
  const actualMediaData = media?.reference?.media?.reference;
  
  if (!actualMediaData) return null;

  const isImage = actualMediaData?.__typename === 'MediaImage';
  const isVideo = actualMediaData?.__typename === 'Video';
  const isReversed = order?.value === 'false';

  // 2. Logic for corner styles
  const styleIndex = Number(media.reference?.style_index?.value || 0);
  const cornerClass = STYLE_MAP[styleIndex] || STYLE_MAP[0];



  // 4. Combine all classes
  // We combine the fixed logic with the optional className prop
  const combinedClasses = `overflow-hidden self-stretch md:contain-size ${cornerClass} ${className}`.trim();

  // --- Render Image ---
  if (isImage && actualMediaData.image?.url) {
    return (
      <div className={combinedClasses}>
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
      <div className={combinedClasses}>
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
            <source
              key={source.url}
              src={source.url}
              type={source.mimeType}
            />
          ))}
        </video>
      </div>
    );
  }

  return null;
}