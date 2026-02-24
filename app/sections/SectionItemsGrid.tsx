import {parseSection} from '~/utils/parseSection';
import {Image} from '@shopify/hydrogen';
import {motion, AnimatePresence} from 'framer-motion';
import {Link} from 'react-router';
import type {SectionItemsGridFragment} from 'storefrontapi.generated';
import {useMemo, useState} from 'react';

type CategoryFilter = 'tops' | 'bottoms' | 'sleeves';

// Shopify translates option names per locale — match all known translations.
// Add the translation for each new language here (e.g. 'colore' for Italian).
const COLOR_OPTION_NAMES = new Set(['color', 'couleur', 'colore']);

const CATEGORY_FILTER_LABELS: Record<CategoryFilter, string> = {
  tops: 'tops',
  bottoms: 'bottoms',
  sleeves: 'sleeves',
};

export function SectionItemsGrid(props: SectionItemsGridFragment) {
  const section = parseSection<SectionItemsGridFragment, {}>(props);

  const topsCollection = section.topsCollection;
  const bottomsCollection = section.bottomsCollection;
  const sleevesCollection = section.sleevesCollection;

  const defaultCollection =
    topsCollection || bottomsCollection || sleevesCollection;

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('tops');

  const activeCollection = useMemo(() => {
    switch (activeCategory) {
      case 'tops':
        return topsCollection ?? null;
      case 'bottoms':
        return bottomsCollection ?? null;
      case 'sleeves':
        return sleevesCollection ?? null;
      default:
        return defaultCollection ?? null;
    }
  }, [
    activeCategory,
    defaultCollection,
    topsCollection,
    bottomsCollection,
    sleevesCollection,
  ]);

  if (!activeCollection) return null;

  const products = activeCollection.products?.nodes ?? [];

  /**
   * Build tiles:
   * - If the product has variants:
   *   - Group by "color" option (case-insensitive).
   *   - Pick ONE variant per color.
   * - If no variants, create a single tile with variant: null.
   */
  const tiles = useMemo(
    () =>
      products.flatMap((product) => {
        const variants = product.variants?.nodes ?? [];

        if (!variants.length) {
          return [{product, variant: null, colorKey: null}];
        }

        const byColor = new Map<string, (typeof variants)[number]>();

        for (const variant of variants) {
          const colorOpt = variant.selectedOptions?.find(
            (opt) => COLOR_OPTION_NAMES.has(opt?.name?.toLowerCase() ?? ''),
          );

          // If this variant has no color option, you can either:
          // - group it under a special key (e.g. 'default')
          // - or skip it. Here we group under 'default'.
          const rawColor = colorOpt?.value ?? 'default';
          const colorKey = rawColor.toLowerCase();

          // Only keep the first variant we encounter for each colorKey.
          if (!byColor.has(colorKey)) {
            byColor.set(colorKey, variant);
          }
        }

        return Array.from(byColor.entries()).map(([colorKey, variant]) => ({
          product,
          variant,
          colorKey,
        }));
      }),
    [products],
  );

  return (
    <section className="section-items-grid section-main relative h-fit">
      {/* Filters */}
      <div className="col-span-6 lg:col-span-12 flex gap-8 flex-row justify-center pb-8">
        {(['tops', 'bottoms', 'sleeves'] as CategoryFilter[]).map(
          (category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={[
                'text-title uppercase transition-colors cursor-pointer',
                activeCategory === category ? 'text-black' : 'text-gray-300',
              ].join(' ')}
            >
              {CATEGORY_FILTER_LABELS[category]}
            </button>
          ),
        )}
      </div>

      {/* Collection block */}
      <div className="col-span-6 lg:col-span-10 lg:col-start-2">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <AnimatePresence mode="popLayout">
            {tiles.map(({product, variant, colorKey}, index) => {
              const primaryImage = variant?.image ?? product.featuredImage ?? null;

              const mediaNodes = product.media?.nodes || [];
              const allImages = mediaNodes
                .filter(
                  (node) => node.__typename === 'MediaImage' && node.image,
                )
                .map((node) => node.image);

              let hoverImage = null;
              if (allImages.length > 1) {
                const isFirstSameAsPrimary =
                  allImages[0]?.url === primaryImage?.url;
                hoverImage = isFirstSameAsPrimary ? allImages[1] : allImages[3];
              }

              // Find the color option for the URL
              const colorOption = variant?.selectedOptions?.find(
                (opt) => COLOR_OPTION_NAMES.has(opt?.name?.toLowerCase() ?? ''),
              );

              const variantUrl = colorOption
                ? `/products/${product.handle}?color=${encodeURIComponent(
                    colorOption.value,
                  )}`
                : `/products/${product.handle}`;

              return (
                <motion.div
                  layout
                  key={`${product.id}-${colorKey ?? 'default'}`}
                  initial={{opacity: 0, scale: 0.9}}
                  animate={{opacity: 1, scale: 1}}
                  exit={{opacity: 0, scale: 0.9}}
                  transition={{
                    duration: 0.4,
                    ease: [0.21, 0.6, 0.35, 1],
                    delay: index * 0.05,
                  }}
                  className={index >= 4 ? 'hidden md:block' : ''}
                >
                  <Link
                    to={variantUrl}
                    className="group block w-full"
                    prefetch="intent"
                  >
                    {primaryImage && (
                      <div className="aspect-[4/5] w-full overflow-hidden rounded-[30px] bg-[#f9f9f9] relative">
                        {/* Primary image */}
                        <Image
                          data={primaryImage}
                          sizes="(min-width: 768px) 20vw, 40vw"
                          className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                        />

                        {/* Hover image */}
                        {hoverImage && (
                          <Image
                            data={hoverImage}
                            sizes="(min-width: 768px) 20vw, 40vw"
                            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          />
                        )}
                      </div>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        <AnimatePresence>
          {tiles.length === 0 && (
            <motion.p
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              className="mt-8 text-center text-sm text-gray-500"
            >
              No products found in this collection.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
export const SECTION_ITEMS_GRID_FRAGMENT = `#graphql
  fragment SectionItemsGrid on Metaobject {
    type

    topsCollection: field(key: "tops_collection") {
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

    bottomsCollection: field(key: "bottoms_collection") {
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

    sleevesCollection: field(key: "sleeves_collection") {
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