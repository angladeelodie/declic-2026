// app/sections/SectionEditorial.tsx

import {parseSection} from '~/utils/parseSection';
import {Image, Video, RichText} from '@shopify/hydrogen';
import {motion, AnimatePresence} from 'framer-motion';
import {Link} from 'react-router';
import type {SectionItemsGridFragment} from 'storefrontapi.generated';
import {useMemo, useState} from 'react';

type CategoryFilter = 'all' | 'tops' | 'bottoms' | 'sleeves';

const CATEGORY_FILTER_LABELS: Record<CategoryFilter, string> = {
  all: 'all',
  tops: 'tops',
  bottoms: 'bottoms', // internal 'bottoms' but you can style/capitalize as needed
  sleeves: 'sleeves', // internal 'sleeves' (for accessories)
};

const TAXONOMY_CATEGORY_ID_MAP: Record<
  Exclude<CategoryFilter, 'all'>,
  string[]
> = {
  tops: [
    'gid://shopify/TaxonomyCategory/aa-1-13', // Clothing Tops
  ],
  bottoms: [
    'gid://shopify/TaxonomyCategory/aa-1-12', // Pants
    'gid://shopify/TaxonomyCategory/aa-1-15', // Skirts
    'gid://shopify/TaxonomyCategory/aa-1-16', // Skorts
  ],
  sleeves: [
    'gid://shopify/TaxonomyCategory/aa-2', // Clothing Accessories
  ],
};

function productMatchesCategoryFilter(
  product: {
    category?: {
      name?: string | null;
      ancestors?: {name?: string | null}[] | null;
    } | null;
  },
  activeCategory: CategoryFilter,
): boolean {
  if (activeCategory === 'all') return true;

  const targetIds = TAXONOMY_CATEGORY_ID_MAP[activeCategory];
  if (!targetIds || !product.category) return false;

  const ids: string[] = [];

  if (product.category.id) {
    ids.push(product.category.id);
  }

  if (Array.isArray(product.category.ancestors)) {
    for (const ancestor of product.category.ancestors) {
      if (ancestor?.id) {
        ids.push(ancestor.id);
      }
    }
  }

  return targetIds.some((target) => ids.includes(target));
}

export function SectionItemsGrid(props: SectionItemsGridFragment) {
  const section = parseSection<SectionItemsGridFragment, {}>(props);
  const {collection} = section;

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  if (!collection) return null;

  const products = collection.products?.nodes ?? [];
  console.log('SectionItemsGrid products:', products);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;

    return products.filter((product) =>
      productMatchesCategoryFilter(product, activeCategory),
    );
  }, [products, activeCategory]);

  return (
    <section className="section-items-grid section-main relative h-fit">
      {/* Filter buttons remain the same */}
      <div className="col-span-6 lg:col-span-12 flex gap-8 flex-row justify-center pb-8">
        {['all', 'tops', 'bottoms', 'sleeves'].map((category) => (
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
        ))}
      </div>

      {/* Collection block */}
      <div className="col-span-6 lg:col-span-10 lg:col-start-2">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, index) => (
              <motion.div
                layout // Smoothly animates items moving to new grid positions
                key={product.id}
                initial={{opacity: 0, scale: 0.9}}
                animate={{opacity: 1, scale: 1}}
                exit={{opacity: 0, scale: 0.9}}
                transition={{
                  duration: 0.4,
                  ease: [0.21, 0.6, 0.35, 1],
                  delay: index * 0.05, // Staggered entry effect
                }}
                className={index >= 4 ? 'hidden md:block' : ''}
              >
                <Link
                  to={`/products/${product.handle}`}
                  className="block w-full"
                  prefetch="intent"
                >
                  {product.featuredImage && (
                    <div className="aspect-[4/5] w-full overflow-hidden rounded-[30px] bg-[#e5eae8]">
                      <Image
                        data={product.featuredImage}
                        sizes="(min-width: 768px) 20vw, 40vw"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State Animation */}
        <AnimatePresence>
          {filteredProducts.length === 0 && (
            <motion.p
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              className="mt-8 text-center text-sm text-gray-500"
            >
              No products found in this category.
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
              category {
                id
                name
                ancestors {
                  id
                  name
                }
              }
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
