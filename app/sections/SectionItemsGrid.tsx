// app/sections/SectionEditorial.tsx

import type {ParsedMetafields} from '@shopify/hydrogen';
import {parseSection} from '~/utils/parseSection';
import {LinkButton} from '~/components/LinkButton';
import {Image, Video, RichText} from '@shopify/hydrogen';

import {Link} from 'react-router';
import {useRef, useEffect} from 'react';
import type {SectionItemsGridFragment} from 'storefrontapi.generated';
// app/sections/SectionItemsGrid.tsx

import {useMemo, useState} from 'react';

type CategoryFilter = 'all' | 'tops' | 'bottoms' | 'sleeves';

export function SectionItemsGrid(props: SectionItemsGridFragment) {
  const section = parseSection<SectionItemsGridFragment, {}>(props);
  const {collection} = section;

  console.log('SectionItemsGrid props:', props);

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  if (!collection) return null;

  const products = collection.products?.nodes ?? [];

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;

    return products.filter((product) => {
      const cat = activeCategory.toLowerCase();

      // OPTION A: filter by productType
      const byType =
        product.productType && product.productType.toLowerCase() === cat;

      // OPTION B: filter by tags
      const byTag =
        Array.isArray(product.tags) &&
        product.tags.some((tag) => tag.toLowerCase() === cat);

      return byType || byTag;
    });
  }, [products, activeCategory]);

  return (
    <section className="section-items-grid section-main relative">
      {/* Filter buttons */}
      <div className="mb-4 flex gap-2 absolute top-0 z-10">
        {(['all', 'tops', 'bottoms', 'sleeves'] as CategoryFilter[]).map(
          (category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={[
                'px-3 py-1 rounded-full text-xs uppercase tracking-wide border',
                activeCategory === category
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-gray-300 hover:border-black',
              ].join(' ')}
            >
              {category}
            </button>
          ),
        )}
      </div>

      {/* Collection block */}
      <div className="col-span-6 lg:col-span-10 lg:col-start-2 md:h-full">
        <div className="grid auto-rows-fr grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 h-full">
          {filteredProducts.map((product, index) => (
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
            </Link>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <p className="mt-4 text-sm text-gray-500">
            No products found in this category.
          </p>
        )}
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
