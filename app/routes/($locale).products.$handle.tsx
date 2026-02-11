import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {getPaginationVariables, Image} from '@shopify/hydrogen';

import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import { useState, useEffect } from 'react'; // Add these imports
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
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
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
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: Route.LoaderArgs) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}
export default function Product() {
  const { product } = useLoaderData<typeof loader>();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // 1. Initialize state for the featured image
  const [featuredImage, setFeaturedImage] = useState(selectedVariant?.image);

  // 2. Sync state if the variant changes (e.g., user selects a different color via dropdown)
  useEffect(() => {
    setFeaturedImage(selectedVariant?.image);
  }, [selectedVariant]);

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const { title, descriptionHtml } = product;

  return (
    <div className="w-full h-full">
      <div className="grid grid-rows-2 lg:grid-rows-1 grid-cols-6 lg:grid-cols-12 gap-4 lg:max-h-[80vh] overflow-hidden">
        
        {/* Thumbnail Column */}
        <div className="lg:col-start-1 lg:col-span-1 h-full overflow-y-auto flex flex-col gap-4">
          {product.media.edges.map((media) => (
            <button // Changed to a button for accessibility
              key={media.node.id}
              onClick={() => setFeaturedImage(media.node.image)} // 3. Update state on click
              className={`w-full relative rounded-lg border-2 transition-all ${
                featuredImage?.url === media.node.image.url 
                  ? 'border-black' 
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Image
                src={media.node.image.url}
                alt={media.node.image.altText || ''}
                aspectRatio="4/5"
                className="object-cover rounded-lg"
                sizes="(min-width: 10rem) 400px, 20vw"
                loading="lazy"
              />
            </button>
          ))}
        </div>

        {/* Main Image Column */}
        <div className="col-span-6 md:col-span-4 md:col-start-2 lg:col-start-2 lg:col-span-5 h-full min-h-0 relative">
          <div className="absolute inset-0 w-full h-full">
            <div className="w-full h-full overflow-hidden rounded-[var(--radius-sharp)_var(--radius-round)_var(--radius-sharp)_var(--radius-round)] bg-[#f3eded]">
              {/* 4. Use the state variable here instead of selectedVariant.image */}
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
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </header>

          {/* Price and Form Section */}
          <section className="space-y-8">
            <ProductForm
              productOptions={productOptions}
              selectedVariant={selectedVariant}
            />
          </section>

          {/* "Complete your look" Section */}
          <footer className="mt-16">
            <h3 className="text-xl text-metalite font-bold mb-6">
              Complete your look
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {/* {product.adjacentVariants.map((variant) => (
            <div
              key={variant.id}
            >
              <img src={variant.image.url} alt={variant.image.altText || ''} />
            </div>
          ))} */}
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-100 rounded-tr-2xl rounded-bl-2xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {/* Logic for related product images would go here */}
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
