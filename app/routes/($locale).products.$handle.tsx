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
import ArrowSvg from '../assets/arrow.svg'; // adjust path as needed
import {STYLE_MAP, STYLE_MAP_LENGTH} from '~/lib/styleMap';
import {AnimatePresence, motion} from 'framer-motion';

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

  const [currentStyle, setCurrentStyle] = useState(5);

  const handleThumbnailClick = (image: typeof selectedVariant.image) => {
    setFeaturedImage(image);
    setCurrentStyle((s) => (s + 1) % STYLE_MAP_LENGTH);
  };

  // --- Information panels from metafield ---
  const informationPanels = product.informationPanels?.references?.nodes ?? [];

  return (
    <Reveal>
      <div className="w-full h-full p-4">
        {/* Back to shop */}
        <Link
          to="/pages/shop"
          className="inline-flex items-center text-metalite gap-2 mb-6 transition-transform duration-200 group"
        >
           <img
              src={ArrowSvg}
              alt="arrow"
              className="w-4 h-4 scale-x-[-1]
          transition-transform duration-200 ease-out
          group-hover:translate-x-[-5px]"
            />
          Back to shop
        </Link>

        <div className="grid grid-rows-2 col-span-1 lg:grid-rows-1 grid-cols-6 lg:grid-cols-12 gap-4 lg:min-h-[80vh] overflow-hidden">
          {/* Thumbnail Column */}
          <div className="lg:col-start-1 lg:col-span-1 lg:h-[80vh] lg:overflow-y-auto flex flex-col gap-2">
            {product.media.edges.map((media) => (
              <button
                key={media.node.id}
                onClick={() => handleThumbnailClick(media.node.image)}
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
              <div className={`w-full h-full overflow-hidden ${STYLE_MAP[currentStyle]} bg-[#f9f9f9] transition-[border-radius] duration-700 ease-in-out`}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={featuredImage?.url ?? 'empty'}
                    className="w-full h-full"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                    transition={{duration: 0.25, ease: 'easeInOut'}}
                  >
                    <ProductImage image={featuredImage} />
                  </motion.div>
                </AnimatePresence>
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
                    className="aspect-square bg-gray-100 rounded-[30px] overflow-hidden"
                  >
                    <div className="w-full h-full bg-[#dcdcdc]" />
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
