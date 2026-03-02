import {Media} from '~/components/Media';

import {parseSection} from '~/utils/parseSection';

import {Image} from '@shopify/hydrogen';

import {Link} from 'react-router';

import type {SectionOutfitsAndMediaFragment} from 'storefrontapi.generated';

// Simple Fisher–Yates shuffle helper

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

export function SectionOutfitsAndMedia(props: SectionOutfitsAndMediaFragment) {
  const section = parseSection<SectionOutfitsAndMediaFragment, {}>(props);

  const {collection} = section;

  const products = collection?.products?.nodes ?? [];

  type Product = (typeof products)[number];

  type Variant = NonNullable<Product['variants']>['nodes'][number];

  type Tile = {
    product: Product;

    variant: Variant;

    colorKey: 'black' | 'white';
  };

  const blackTiles: Tile[] = [];

  const whiteTiles: Tile[] = [];

  // Collect all black / white variants across the collection

  for (const product of products) {
    const variants = product.variants?.nodes ?? [];

    for (const variant of variants) {
      const colorOpt = variant.selectedOptions?.find((opt) =>
        ['color', 'colour', 'couleur', 'colore'].includes(opt?.name?.toLowerCase() ?? ''),
      );

      const rawColor = colorOpt?.value?.toLowerCase();

      const isBlack = rawColor === 'black' || rawColor === 'noir' || rawColor === 'nero';
      const isWhite = rawColor === 'white' || rawColor === 'blanc' || rawColor === 'bianco';

      if (isBlack) {
        blackTiles.push({product, variant, colorKey: 'black'});
      } else if (isWhite) {
        whiteTiles.push({product, variant, colorKey: 'white'});
      }
    }
  }

  // Shuffle and take up to 3 of each color

  const shuffledBlack = shuffleArray(blackTiles).slice(0, 3);

  const shuffledWhite = shuffleArray(whiteTiles).slice(0, 3);

  // Interleave: white, black, white, black, white, black

  const orderedTiles: Tile[] = [];

  for (let i = 0; i < 3; i++) {
    if (shuffledWhite[i]) orderedTiles.push(shuffledWhite[i]);

    if (shuffledBlack[i]) orderedTiles.push(shuffledBlack[i]);
  }

  return (
    <section className="section-outfits-and-media section-main grid-rows-2 lg:grid-rows-1">
      {/* Collection block */}

      {collection && (
        <div className="col-span-6 row-span-1 md:col-span-6 lg:col-span-6 lg:col-start-2 md:h-full">
          {/* 3-column sub-grid */}

          <div className="grid auto-rows-fr grid-cols-2 md:grid-cols-3 gap-4 h-full">
            {orderedTiles.map(({product, variant}, index) => {
              const mediaNodes = product.media?.nodes || [];

              // Prefer variant image, then product featured image, then first media image

              const variantImage = variant.image ?? null;

              const firstMediaImage =
                mediaNodes[0]?.__typename === 'MediaImage'
                  ? mediaNodes[0].image
                  : null;

              const primaryImage =
                variantImage || product.featuredImage || firstMediaImage;

              const hoverImage =
                mediaNodes[1]?.__typename === 'MediaImage'
                  ? mediaNodes[1].image
                  : null;

              const colorOption = variant.selectedOptions?.find((opt) =>
                ['color', 'colour', 'couleur'].includes(
                  opt?.name?.toLowerCase() ?? '',
                ),
              );

              const variantUrl = colorOption
                ? `/products/${product.handle}?color=${encodeURIComponent(
                    colorOption.value,
                  )}`
                : `/products/${product.handle}`;

              return (
                <Link
                  key={`${product.id}-${variant.id}`}
                  to={variantUrl}
                  className={`group block ${
                    index >= 4 ? 'hidden md:block' : ''
                  }`}
                  prefetch="intent"
                >
                  {primaryImage && (
                    <div
                      className="

                        relative w-full h-full bg-[#f8f8f8] overflow-hidden

                        rounded-[30px]

                        transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]

                        group-hover:rounded-tl-[var(--radius-sharp,0px)]

                        group-hover:rounded-br-[var(--radius-sharp,0px)]

                        group-hover:rounded-tr-[60px]

                        group-hover:rounded-bl-[60px]

                      "
                    >
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
              productType
              tags
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
                }
              }
              variants(first: 10) {
                nodes {
                  id
                  title
                  image {
                    id
                    url
                    altText
                    width
                    height
                  }
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
