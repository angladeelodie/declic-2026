// app/sections/SectionEditorial.tsx (excerpt)
import {Media} from '~/components/Media';
import {parseSection} from '~/utils/parseSection';
import {Image} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {SectionOutfitsAndMediaFragment} from 'storefrontapi.generated';

export function SectionOutfitsAndMedia(props: SectionOutfitsAndMediaFragment) {
  const section = parseSection<SectionOutfitsAndMediaFragment, {}>(props);
  const {collection} = section;

  return (
    <section className="section-outfits-and-media section-main grid-rows-2 lg:grid-rows-1">
      {/* Collection block */}
      {collection && (
        <div className="col-span-6 row-span-1 md:col-span-6 lg:col-span-6 lg:col-start-2 md:h-full">
          {/* 3-column sub-grid */}
          <div className="grid auto-rows-fr grid-cols-2 md:grid-cols-3 gap-4 h-full">
            {collection.products?.nodes?.slice(0, 6).map((product, index) => {
              const mediaNodes = product.media?.nodes || [];

              // Primary image: first media image if available, otherwise featuredImage
              const primaryImage =
                mediaNodes[0]?.__typename === 'MediaImage'
                  ? mediaNodes[0].image
                  : product.featuredImage;

              // Hover image: second media image if available
              const hoverImage =
                mediaNodes[1]?.__typename === 'MediaImage'
                  ? mediaNodes[1].image
                  : null;

              return (
         <Link
  key={product.id}
  to={`/products/${product.handle}`}
  className={`group block ${index >= 4 ? 'hidden md:block' : ''}`}
  prefetch="intent"
>
  {primaryImage && (
    <div className="
      relative w-full h-full bg-[#f8f8f8] overflow-hidden
      rounded-[30px]
      transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]
      group-hover:rounded-tl-[var(--radius-sharp,0px)]
      group-hover:rounded-br-[var(--radius-sharp,0px)]
      group-hover:rounded-tr-[60px]
      group-hover:rounded-bl-[60px]
    ">
      {/* Default image */}
      <Image
        data={primaryImage}
        sizes="(min-width: 768px) 20vw, 40vw"
        className="w-full h-full object-contain transition-opacity duration-500 group-hover:opacity-0"
      />

      {/* Hover image */}
      {hoverImage && (
        <Image
          data={hoverImage}
          sizes="(min-width: 768px) 20vw, 40vw"
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-700 group-hover:opacity-100"
        />
      )}
    </div>
  )}
</Link>
              );
            })}
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
          products(first: 200) {
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
              media(first: 4) {
                nodes {
                  __typename
                  ... on MediaImage {
                    image {
                      id
                      url
                      altText
                      width
                      height
                    }
                  }
                  # you can support other media types here later if needed
                }
              }
            }
          }
        }
      }
    }
  }
`;
