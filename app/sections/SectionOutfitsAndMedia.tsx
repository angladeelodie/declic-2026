// app/sections/SectionEditorial.tsx

import type {ParsedMetafields} from '@shopify/hydrogen';
import {Media} from '~/components/Media';
import {parseSection} from '~/utils/parseSection';
import {LinkButton} from '~/components/LinkButton';
import {Image, Video, RichText} from '@shopify/hydrogen';

import {Link} from 'react-router';
import {useRef, useEffect} from 'react';
import type {SectionOutfitsAndMediaFragment} from 'storefrontapi.generated';

export function SectionOutfitsAndMedia(props: SectionOutfitsAndMediaFragment) {
  const section = parseSection<SectionOutfitsAndMediaFragment, {}>(props);

  const {collection} = section;

  //   const {collection} = section;
  console.log('SectionOutfitsAndMedia props:', props);

return (
  <section
    className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-2 h-auto md:h-[60vh] md:my-30 items-center px-4 md:px-0"
  >
    {/* Collection block */}
    {collection && (
      <div className="col-span-1 md:col-start-2 md:col-span-6 h-full">
        {/* We create a 3-column sub-grid here */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 h-full">
          {collection.products?.nodes?.slice(0, 6).map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.handle}`}
              prefetch="intent"
              className="block"
            >
              {product.featuredImage && (
                <Image
                  data={product.featuredImage}
                  sizes="(min-width: 768px) 20vw, 40vw"
                  className="w-full h-full object-cover bg-[#e5eae8] rounded-[30px]"
                />
              )}
              {/* <h3 className="text-sm font-medium truncate">{product.title}</h3> */}
            </Link>
          ))}
        </div>
      </div>
    )}

    {/* Media block */}
    <div className="col-span-1 md:col-start-8 md:col-span-4 self-stretch h-full">
        <Media
        media={props.media.reference}
        className="md:col-start-8 md:col-span-4 col-span-6 h-full"
      />
    </div>
  </section>
);
}

// app/sections/SectionOutfitsAndMedia.tsx (fragment part)

// app/sections/SectionOutfitsAndMedia.tsx

export const SECTION_OUTFITS_AND_MEDIA_FRAGMENT = `#graphql
  fragment SectionOutfitsAndMedia on Metaobject {
    type
    media: field(key: "media") {
      key
      reference {
        ... on Metaobject {
          ...EditorialMediaMetaobject
        }
      }
    }
    collection: field(key: "collection") {
      reference {
        ... on Collection {
          id
          title
          handle
          products(first: 4) {
            nodes {
              id
              title
              handle
              featuredImage {
                id
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
`;
