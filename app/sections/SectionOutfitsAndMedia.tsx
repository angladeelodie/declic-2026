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
    className="section-outfits-and-media section-main grid-rows-2 lg:grid-rows-1"
  >
    {/* Collection block */}
    {collection && (
      <div className="col-span-6 row-span-1 md:col-span-6 lg:col-span-6 lg:col-start-2 md:h-full">
        {/* We create a 3-column sub-grid here */}
        <div className="grid auto-rows-fr grid-cols-2  md:grid-cols-3 gap-4 h-full">
          {collection.products?.nodes?.slice(0, 6).map((product, index ) => (
            <Link
              key={product.id}
              to={`/products/${product.handle}`}
              className={`block ${index >= 4 ? 'hidden md:block' : ''}`}
              prefetch="intent"
            >
              {product.featuredImage && (
                <Image
                  data={product.featuredImage}
                  sizes="(min-width: 768px) 20vw, 40vw"
                  className="w-full h-full object-contain bg-[#e5eae8] rounded-[30px] aspect-ratio-initial"
                />
              )}
              {/* <h3 className="text-sm font-medium truncate">{product.title}</h3> */}
            </Link>
          ))}
        </div>
      </div>
    )}

    {/* Media block */}
    <div className="col-span-6 row-span-1 md:col-span-4 md:col-start-2 lg:col-start-8 lg:col-span-4 self-stretch md:h-full">
        <Media
        media={props.media.reference}
        className="lg:col-start-8 lg:col-span-4 col-span-6 h-full"
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
          products(first: 6) {
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
