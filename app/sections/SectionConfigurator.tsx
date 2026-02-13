
import type {ParsedMetafields} from '@shopify/hydrogen';
import {parseSection} from '~/utils/parseSection';
import type {SectionConfiguratorFragment} from 'storefrontapi.generated';



import {useSearchParams} from 'react-router';
import type {SectionConfiguratorFragment} from 'storefrontapi.generated';

export function SectionConfigurator(props: SectionConfiguratorFragment) {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTopHandle = searchParams.get('top');
  const selectedBottomHandle = searchParams.get('bottom');
  const selectedSleeveHandle = searchParams.get('sleeve');

  // collections from the fragment
  const topsCollection = props.tops_collection?.reference;
  const bottomsCollection = props.bottoms_collection?.reference;
  const sleevesCollection = props.sleeves_collection?.reference;

  const tops = topsCollection?.products?.nodes ?? [];
  const bottoms = bottomsCollection?.products?.nodes ?? [];
  const sleeves = sleevesCollection?.products?.nodes ?? [];

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

  return (
    <section className="section-configurator section-main grid-rows-[1fr]">
      <h1>Configurator</h1>

      <div>
        <h2>Tops</h2>
        <ul>
          {tops.map((product) => {
            const isSelected = product.handle === selectedTopHandle;
            return (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => handleSelectTop(product.handle)}
                  style={{
                    fontWeight: isSelected ? 'bold' : 'normal',
                  }}
                >
                  {product.title}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h2>Bottoms</h2>
        <ul>
          {bottoms.map((product) => {
            const isSelected = product.handle === selectedBottomHandle;
            return (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => handleSelectBottom(product.handle)}
                  style={{
                    fontWeight: isSelected ? 'bold' : 'normal',
                  }}
                >
                  {product.title}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h2>sleeves</h2>
        <ul>
          {sleeves.map((product) => {
            const isSelected = product.handle === selectedSleeveHandle;
            return (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => handleSelectSleeve(product.handle)}
                  style={{
                    fontWeight: isSelected ? 'bold' : 'normal',
                  }}
                >
                  {product.title}
                </button>
              </li>
            );
          })}
        </ul>
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