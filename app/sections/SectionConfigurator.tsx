import {useSearchParams} from 'react-router';
import {useState} from 'react';
import type {SectionConfiguratorFragment} from 'storefrontapi.generated';

export function SectionConfigurator(props: SectionConfiguratorFragment) {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTopHandle = searchParams.get('top');
  const selectedBottomHandle = searchParams.get('bottom');
  const selectedSleeveHandle = searchParams.get('sleeve');

  const topsCollection = props.tops_collection?.reference;
  const bottomsCollection = props.bottoms_collection?.reference;
  const sleevesCollection = props.sleeves_collection?.reference;

  const tops = topsCollection?.products?.nodes ?? [];
  const bottoms = bottomsCollection?.products?.nodes ?? [];
  const sleeves = sleevesCollection?.products?.nodes ?? [];

  const [activeCategory, setActiveCategory] = useState<'tops' | 'bottoms' | 'sleeves'>('tops');

  function handleSelectTop(handle: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('top', handle);
      return next;
    });
  }

  function handleSelectBottom(handle: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('bottom', handle);
      return next;
    });
  }

  function handleSelectSleeve(handle: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('sleeve', handle);
      return next;
    });
  }

  function renderProductList(
    products: typeof tops,
    selectedHandle: string | null,
    onSelect: (handle: string) => void,
  ) {
    return (
      <ul className="flex flex-row gap-4 overflow-x-auto gap-4">
        {products.map((product) => {
          const isSelected = product.handle === selectedHandle;
          const image = product.featuredImage;

          return (
            <li key={product.id} className={`aspect-square overflow-hidden rounded-md flex-shrink-1 ${isSelected ? 'border-2 border-black' : 'border-2 border-transparent'}`}>
              <button
                type="button"
                onClick={() => onSelect(product.handle)}
                className={`h-full w-full`}
              >
                {/* Thumbnail */}
                {image?.url && (
                  <div className="h-full w-full bg-gray-100">
                    <img
                      src={image.url}
                      alt={image.altText ?? product.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* Title */}
                {/* <span className="text-sm">{product.title}</span> */}
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  function renderActiveList() {
    if (activeCategory === 'tops') {
      return renderProductList(tops, selectedTopHandle, handleSelectTop);
    }
    if (activeCategory === 'bottoms') {
      return renderProductList(bottoms, selectedBottomHandle, handleSelectBottom);
    }
    return renderProductList(sleeves, selectedSleeveHandle, handleSelectSleeve);
  }

  return (
    <section className="section-configurator section-main grid-rows-[1fr]">
      {/* Left column: preview area */}
      <div className="lg:col-start-2 lg:col-span-4 h-full">
        <div className="aspect-2/3 bg-gray-200 w-full h-auto self-center rounded-[var(--radius-sharp)]" />
      </div>

      {/* Right column: tabs + lists */}
      <div className="lg:col-start-7 lg:col-span-5">
        {/* Tabs */}
        <div className="flex justify-center gap-20">
          <button
            type="button"
            onClick={() => setActiveCategory('tops')}
            className={`text-title ${
              activeCategory === 'tops'
                ? 'text-black'
                : 'text-gray-300'
            }`}
          >
            Tops
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('bottoms')}
            className={`text-title ${
              activeCategory === 'bottoms'
                ? 'text-black'
                : 'text-gray-300'
            }`}
          >
            Bottoms
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('sleeves')}
            className={`text-title ${
              activeCategory === 'sleeves'
                ? 'text-black'
                : 'text-gray-300'
            }`}
          >
            Sleeves
          </button>
        </div>

        {/* Active category content */}
        {renderActiveList()}
      </div>
    </section>
  );
}

export const SECTION_CONFIGURATOR_FRAGMENT = `#graphql
  fragment SectionConfigurator on Metaobject {
    type

    title: field(key: "title") {
      key
      type
      value
    }

    description: field(key: "description") {
      key
      type
      value
    }

    tops_collection: field(key: "tops_collection") {
      reference {
        ... on Collection {
          id
          title
          handle
          products(first: 50) {
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

    bottoms_collection: field(key: "bottoms_collection") {
      reference {
        ... on Collection {
          id
          title
          handle
          products(first: 50) {
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

    sleeves_collection: field(key: "sleeves_collection") {
      reference {
        ... on Collection {
          id
          title
          handle
          products(first: 50) {
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
