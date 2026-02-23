import {redirect, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {Reveal} from '~/components/Reveal';

import {ProductPrice} from '~/components/ProductPrice';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import {Accordion, AccordionItem} from '~/components/Accordion';

import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {useState, useEffect} from 'react';
import {RichText} from '@shopify/hydrogen';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `Hydrogen | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

function loadDeferredData({context, params}: Route.LoaderArgs) {
  return {};
}

export default function Product() {
  const {product} = useLoaderData<typeof loader>();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Featured image state, synced to selected variant
  const [featuredImage, setFeaturedImage] = useState(selectedVariant?.image);

  useEffect(() => {
    setFeaturedImage(selectedVariant?.image);
  }, [selectedVariant]);

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;

  // --- Information panels from metafield ---
  const informationPanels = product.informationPanels?.references?.nodes ?? [];

  return (
    <Reveal>
      <div className="w-full h-full">
        {/* Back to shop */}
        <Link
          to="/pages/shop"
          className="inline-flex items-center text-metalite gap-2 mb-6 transition-colors duration-200 group"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:-translate-x-0.5 transition-transform duration-200"
            aria-hidden="true"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Back to shop
        </Link>

        <div className="grid grid-rows-2 col-span-1 lg:grid-rows-1 grid-cols-6 lg:grid-cols-12 gap-4 lg:min-h-[80vh] overflow-hidden">
          {/* Thumbnail Column */}
          <div className="lg:col-start-1 lg:col-span-1 lg:h-[80vh] lg:overflow-y-auto flex flex-col gap-4">
            {product.media.edges.map((media) => (
              <button
                key={media.node.id}
                onClick={() => setFeaturedImage(media.node.image)}
                className={`w-full shrink-0 rounded-lg overflow-hidden group border-2 transition-all ${
                  featuredImage?.url === media.node.image.url
                    ? 'border-black'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={media.node.image.url}
                    alt={media.node.image.altText || ''}
                    className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Main Image Column */}
          <div className="col-span-5 md:col-span-4 md:col-start-2 lg:col-start-2 lg:col-span-5 h-full lg:h-[80vh] min-h-0 relative">
            <div className="absolute inset-0 w-full h-full">
              <div className="w-full h-full overflow-hidden rounded-[var(--radius-sharp)_var(--radius-round)_var(--radius-sharp)_var(--radius-round)] bg-[#f9f9f9] product-image-fade" key={featuredImage?.url ?? 'empty'}>
                <ProductImage image={featuredImage} />
              </div>
            </div>
          </div>

          {/* Info Column */}
          <div className="col-span-6 md:col-span-4 lg:col-span-4 md:col-start-2 lg:col-start-8 flex flex-col pt-4">
            <header className="mb-8">
              <h1 className="text-title">{title}</h1>
              <div
                className="text-body"
                dangerouslySetInnerHTML={{__html: descriptionHtml}}
              />
            </header>

            {/* Price and Form Section */}
            <section className="space-y-8">
              <ProductForm
                productOptions={productOptions}
                selectedVariant={selectedVariant}
              />
            </section>

            {/* Information panels accordion (from information_panels metafield) */}
            {informationPanels.length > 0 && (
              <section className="mt-4 pt-4">
                <Accordion>
                  {informationPanels.map((panel: any, index: number) => {
                    const panelTitle =
                      panel.title?.value || `Panel ${index + 1}`;
                    const panelContent = panel.content?.value || '';

                    return (
                      <AccordionItem
                        key={panel.id ?? `${panelTitle}-${index}`}
                        title={panelTitle}
                        defaultOpen={false}
                      >
                        <RichText
                          className="prose prose-sm max-w-none"
                          data={panelContent}
                        />
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </section>
            )}

            {/* "Complete your look" Section */}
            <footer className="mt-4">
              <h3 className="text-metalite text-emphasis font-bold mb-4">
                Complete your look
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gray-100 rounded-tr-2xl rounded-bl-2xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="w-full h-full bg-[#dcdcdc] animate-pulse" />
                  </div>
                ))}
              </div>
            </footer>
          </div>
        </div>

        <Analytics.ProductView
          data={{
            products: [
              {
                id: product.id,
                title: product.title,
                price: selectedVariant?.price.amount || '0',
                vendor: product.vendor,
                variantId: selectedVariant?.id || '',
                variantTitle: selectedVariant?.title || '',
                quantity: 1,
              },
            ],
          }}
        />
      </div>
    </Reveal>
  );
}
const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
  id
  title
  vendor
  handle
  descriptionHtml
  description
  encodedVariantExistence
  encodedVariantAvailability

  # NEW: product-level media gallery
  media(first: 20) {
    edges {
      node {
        __typename
        ... on MediaImage {
          id
          image {
            url
            altText
            width
            height
          }
        }
        ... on Video {
          id
          sources {
            url
            mimeType
          }
        }
        ... on Model3d {
          id
          sources {
            url
          }
        }
        ... on ExternalVideo {
          id
          embeddedUrl
        }
      }
    }
  }

  options {
    name
    optionValues {
      name
      firstSelectableVariant {
        ...ProductVariant
      }
      swatch {
        color
        image {
          previewImage {
            url
          }
        }
      }
    }
  }

  selectedOrFirstAvailableVariant(
    selectedOptions: $selectedOptions
    ignoreUnknownOptions: true
    caseInsensitiveMatch: true
  ) {
    ...ProductVariant
  }

  adjacentVariants(selectedOptions: $selectedOptions) {
    ...ProductVariant
  }

  seo {
    description
    title
  }

  # NEW: Information panels → list of $app:information_panel metaobjects
  informationPanels: metafield(namespace: "custom", key: "information_panels") {
    references(first: 20) {
      nodes {
        ... on Metaobject {
          type
          title: field(key: "title") {
            value
          }
          content: field(key: "content") {
            value
          }
        }
      }
    }
  }
}
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
