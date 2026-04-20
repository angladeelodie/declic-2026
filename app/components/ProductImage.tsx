import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';

export function ProductImage({
  image,
  isPrimaryVariantImage = false,
}: {
  image: ProductVariantFragment['image'];
  isPrimaryVariantImage?: boolean;
}) {
  if (!image) {
    return <div className="product-image" />;
  }
  return (
    <div className="product-image w-full h-full group">
      <Image
        alt={image.altText || 'Product Image'}
        data={image}
        key={image.id}
        sizes="(min-width: 45em) 50vw, 100vw"
        className={[
          'w-full h-full transition-transform duration-500 ease-out',
          isPrimaryVariantImage
            ? 'object-contain object-center scale-[0.9] group-hover:scale-[0.94]'
            : 'object-cover group-hover:scale-[1.04]',
        ].join(' ')}
      />
    </div>
  );
}
