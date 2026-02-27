import {useSearchParams} from 'react-router';
import {useState, useEffect, useCallback} from 'react';
import type {SectionConfiguratorFragment} from 'storefrontapi.generated';
import {ConfiguratorCanvas} from '~/components/ConfiguratorCanvas';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {OptionSwatchGroup} from '~/components/OptionSwatchGroup';
import {normalizeSwatchColor} from '~/components/OptionSwatch';

// ─── Local types ────────────────────────────────────────────────────────────
type VariantNode = {
  id: string;
  availableForSale: boolean;
  price: {amount: string; currencyCode: string};
  selectedOptions: Array<{name: string; value: string}>;
};

type ProductNode = {
  id: string;
  title: string;
  handle: string;
  featuredImage?: {url: string; altText?: string | null} | null;
  model?: {reference?: {sources: Array<{url: string}>} | null} | null;
  variants?: {nodes: VariantNode[]} | null;
  options?: Array<{name: string; values: string[]}> | null;
};

type OptionSelection = {size: string | null; color: string | null};

// ─── Helpers ────────────────────────────────────────────────────────────────
const WELCOME_KEY = 'hasSeenConfiguratorWelcome';

// Reads directly from product.options — not paginated, always complete.
function getOptionValues(
  product: ProductNode | null | undefined,
  optionName: string,
): string[] {
  if (!product?.options) return [];
  const opt = product.options.find(
    (o) => o.name.toLowerCase() === optionName.toLowerCase(),
  );
  return opt?.values ?? [];
}

function resolveVariant(
  product: ProductNode | null | undefined,
  size: string | null,
  color: string | null,
): VariantNode | null {
  if (!product?.variants?.nodes?.length) return null;
  const nodes = product.variants.nodes;

  // Try exact match first
  const match = nodes.find((v) => {
    const opts = Object.fromEntries(
      v.selectedOptions.map((o) => [o.name.toLowerCase(), o.value]),
    );
    const sizeOk =
      !size ||
      opts['size'] === size ||
      opts['taille'] === size ||
      opts['accessory size'] === size;
    const colorOk =
      !color || opts['color'] === color || opts['couleur'] === color;
    return sizeOk && colorOk;
  });

  if (match) return match;

  // Fall back: match size only
  if (size) {
    const sizeOnly = nodes.find((v) =>
      v.selectedOptions.some(
        (o) =>
          o.name.toLowerCase() === 'size' ||
          (o.name.toLowerCase() === 'taille' && o.value === size),
      ),
    );
    if (sizeOnly) return sizeOnly;
  }

  // Final fallback: first variant
  return nodes[0];
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function SectionConfigurator(props: SectionConfiguratorFragment) {
  const [searchParams, setSearchParams] = useSearchParams();
  const {open} = useAside();

  const tops = (props.tops_collection?.reference?.products?.nodes ??
    []) as ProductNode[];
  const bottoms = (props.bottoms_collection?.reference?.products?.nodes ??
    []) as ProductNode[];
  const sleeves = (props.sleeves_collection?.reference?.products?.nodes ??
    []) as ProductNode[];

  // Fall back to first product in each category when URL has no selection
  const selectedTopHandle =
    searchParams.get('top') ?? tops[0]?.handle ?? null;
  const selectedBottomHandle =
    searchParams.get('bottom') ?? bottoms[0]?.handle ?? null;
  const selectedSleeveHandle =
    searchParams.get('sleeve') ?? sleeves[0]?.handle ?? null;

  const [activeCategory, setActiveCategory] = useState<
    'tops' | 'bottoms' | 'sleeves' | null
  >(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Per-category size + color selection (keyed by category name)
  const [allOptions, setAllOptions] = useState<
    Record<'tops' | 'bottoms' | 'sleeves', OptionSelection>
  >({
    tops: {size: null, color: null},
    bottoms: {size: null, color: null},
    sleeves: {size: null, color: null},
  });

  // ── localStorage welcome check ──────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem(WELCOME_KEY)) {
        setShowWelcome(false);
      }
    }
  }, []);

  const handleStartCreating = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(WELCOME_KEY, 'true');
    }
    setIsFading(true); // triggers fade-out; onTransitionEnd flips showWelcome
  }, []);

  // ── Collection labels (pulled from Shopify, so they translate automatically)
  const topsLabel = props.tops_collection?.reference?.title ?? 'Tops';
  const bottomsLabel = props.bottoms_collection?.reference?.title ?? 'Bottoms';
  const sleevesLabel = props.sleeves_collection?.reference?.title ?? 'Sleeves';

  // ── Category map: one source of truth per category ───────────────
  const categoryMap = {
    tops: {products: tops, urlKey: 'top', selectedHandle: selectedTopHandle},
    bottoms: {
      products: bottoms,
      urlKey: 'bottom',
      selectedHandle: selectedBottomHandle,
    },
    sleeves: {
      products: sleeves,
      urlKey: 'sleeve',
      selectedHandle: selectedSleeveHandle,
    },
  } as const;

  function handleSelectProduct(handle: string) {
    if (!activeCategory) return;
    const {urlKey} = categoryMap[activeCategory];
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set(urlKey, handle);
      return next;
    });
    setAllOptions((prev) => ({
      ...prev,
      [activeCategory]: {size: null, color: null},
    }));
  }

  function setActiveOptions(
    updater: (prev: OptionSelection) => OptionSelection,
  ) {
    if (!activeCategory) return;
    setAllOptions((prev) => ({
      ...prev,
      [activeCategory]: updater(prev[activeCategory]),
    }));
  }

  // ── Derived data ─────────────────────────────────────────────────
  // All three selected products needed for the 3D canvas
  const selectedProducts = {
    tops: tops.find((p) => p.handle === selectedTopHandle) ?? null,
    bottoms: bottoms.find((p) => p.handle === selectedBottomHandle) ?? null,
    sleeves: sleeves.find((p) => p.handle === selectedSleeveHandle) ?? null,
  };

  const topModelUrl =
    selectedProducts.tops?.model?.reference?.sources[0]?.url ?? null;
  const bottomModelUrl =
    selectedProducts.bottoms?.model?.reference?.sources[0]?.url ?? null;
  const sleeveModelUrl =
    selectedProducts.sleeves?.model?.reference?.sources[0]?.url ?? null;

  const topColor    = normalizeSwatchColor(allOptions.tops.color    ?? '');
  const bottomColor = normalizeSwatchColor(allOptions.bottoms.color ?? '');
  const sleeveColor = normalizeSwatchColor(allOptions.sleeves.color ?? '');

  const active        = activeCategory ? categoryMap[activeCategory] : null;
  const activeOptions = activeCategory ? allOptions[activeCategory] : {size: null, color: null};
  const activeProduct = activeCategory ? selectedProducts[activeCategory] : null;

  // Sizes & colors from product.options (always complete, not paginated)
  const sizes = getOptionValues(activeProduct, 'size')
    .concat(getOptionValues(activeProduct, 'taille'))
    .concat(getOptionValues(activeProduct, 'accessory size'));
  const colors = getOptionValues(activeProduct, 'color').concat(
    getOptionValues(activeProduct, 'couleur'),
  );

  const activeVariant = resolveVariant(
    activeProduct,
    activeOptions.size,
    activeOptions.color,
  );

  // ── Sub-renderers ────────────────────────────────────────────────
  function renderProductThumbnails() {
    if (!active) return null;
    return (
      <ul className="flex flex-row gap-3 overflow-x-auto no-scrollbar">
        {active.products.map((product) => {
          const isSelected = product.handle === active.selectedHandle;
          const image = product.featuredImage;
          return (
            <li
              key={product.id}
              /* The magic happens here: 
                 calc((100% - total_gap) / 3) 
              */
              className={`flex-shrink-0 aspect-square overflow-hidden rounded-md transition-all duration-200`}
              style={{width: 'calc((100% - 24px) / 3)'}}
            >
              <button
                type="button"
                onClick={() => handleSelectProduct(product.handle)}
                className={`h-full w-full border-2 rounded-xl overflow-hidden ${
                  isSelected
                    ? 'border-black'
                    : 'border-transparent hover:border-gray-300'
                }`}
                aria-label={product.title}
              >
                {image?.url ? (
                  <div className="h-full w-full bg-gray-100">
                    <img
                      src={image.url}
                      alt={image.altText ?? product.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-full w-full bg-gray-100" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    );
  }


  // ── Welcome screen ───────────────────────────────────────────────
  function renderWelcome() {
    return (
      <div className="flex flex-col items-center justify-center h-[90vh] lg:h-full text-center">
        <h2 className="text-title lg:text-left w-full pt-0 pb-4 mt-8">
          {(props as any).title?.value ?? 'Create your outfit'}
        </h2>
        <p className="text-body lg:w-[80%] lg:text-left lg:self-start">
          {(props as any).description?.value ??
            'Mix and match tops, sleeves and bottoms to build your perfect look.'}
        </p>
        <button
          type="button"
          onClick={handleStartCreating}
          className="bg-[#3eff9d] hover:bg-[#34e58b] text-black text-metalite py-2 px-12 rounded-full transition-all duration-200 mt-8 mb-8 lg:self-start"
        >
          {(props as any).button_text?.value ??
            'Start creating'}
        </button>
      </div>
    );
  }

  // ── Right panel main UI ──────────────────────────────────────────
  function renderRightPanel() {
    return (
      <div className="flex flex-col gap-5 h-full justify-start mt-4 lg:pt-16">
        {/* 2 — Category tabs */}
        <div className="flex justify-between md:justify-around lg:justify-start gap-4 lg:gap-12">
          {(
            [
              {key: 'tops', label: topsLabel},
              {key: 'sleeves', label: sleevesLabel},
              {key: 'bottoms', label: bottomsLabel},
            ] as const
          ).map(({key, label}) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveCategory(activeCategory === key ? null : key)}
              className={`text-title transition-colors duration-150 cursor-pointer hover:text-black ${
                activeCategory === key ? 'text-black' : 'text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 3 & 1 — Thumbnails, colour swatches and size selector (hidden when no category selected) */}
        {activeCategory && (
          <>
            <div className="flex flex-col-reverse lg:flex-row gap-4">
              <div className="flex-1 overflow-x-auto">
                {renderProductThumbnails()}
              </div>
              <OptionSwatchGroup
                optionName="color"
                values={colors}
                selected={activeOptions.color}
                onSelect={(color) => setActiveOptions((prev) => ({...prev, color}))}
                orientation="row"
                className='self-center'
              />
            </div>

            <OptionSwatchGroup
              optionName="size"
              values={sizes}
              selected={activeOptions.size}
              onSelect={(size) => setActiveOptions((prev) => ({...prev, size}))}
              className="mt-4 lg:mt-8 justify-center lg:justify-start"
            />
          </>
        )}

        {/* 4 — Bottom action bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2 lg:mt-16">
          {/* Row 1 on Mobile: Quantity + Price */}
          <div className="flex items-center justify-center lg:justify-between lg:justify-start gap-6 w-full lg:w-auto">
            {/* Quantity */}
            <div className="flex items-center gap-3 font-medium">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:border-gray-400 transition-colors"
                aria-label="Decrease quantity"
              >
                <span className="text-gray-500 leading-none">-</span>
              </button>
              <span className="w-4 text-center tabular-nums">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:border-gray-400 transition-colors"
                aria-label="Increase quantity"
              >
                <span className="text-gray-500 leading-none">+</span>
              </button>
            </div>

            {/* Price */}
            {activeVariant && (
              <div className="text-lg font-bold tabular-nums">
                {parseFloat(activeVariant.price.amount).toFixed(0)}{' '}
                {activeVariant.price.currencyCode === 'CHF'
                  ? 'chf.'
                  : activeVariant.price.currencyCode}
              </div>
            )}
          </div>

          {/* Row 2 on Mobile: Add to cart (Full width & Centered) */}
          <div className="w-fit lg:w-auto self-center">
            <AddToCartButton
              disabled={!activeVariant?.availableForSale}
              onClick={() => open('cart')}
              lines={
                activeVariant
                  ? [
                      {
                        merchandiseId: activeVariant.id,
                        quantity,
                      },
                    ]
                  : []
              }
            >
              <span>
                {activeVariant
                  ? activeVariant.availableForSale
                    ? 'Add to cart'
                    : 'Sold out'
                  : 'Select a product'}
              </span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </AddToCartButton>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────
  return (
    <section className="section-configurator section-main h-fit lg:h-[90vh] pb-4 grid-rows-[1fr]">
      {/* Left: 3D preview */}
      <div className="col-start-1 col-span-6 row-span-1 lg:col-start-2 lg:col-span-4 h-[60vh] lg:h-full">
        <div className="relative w-full h-full bg-gray-200 self-center rounded-[var(--radius-sharp)] overflow-hidden">
          <div className="absolute inset-0 h-full w-full">
            <ConfiguratorCanvas
              topModelUrl={topModelUrl}
              bottomModelUrl={bottomModelUrl}
              sleeveModelUrl={sleeveModelUrl}
              topColor={topColor}
              bottomColor={bottomColor}
              sleeveColor={sleeveColor}
              activeCategory={activeCategory}
            />
          </div>
        </div>
      </div>

      {/* Right: welcome or main UI */}
      <div
        className={`col-start-1 col-span-6 row-span-1 lg:col-start-7 lg:col-span-5 transition-opacity duration-300 ${
          isFading ? 'opacity-0' : 'opacity-100'
        }`}
        onTransitionEnd={() => {
          if (isFading) {
            setShowWelcome(false);
            setIsFading(false);
          }
        }}
      >
        {showWelcome ? renderWelcome() : renderRightPanel()}
      </div>
    </section>
  );
}

// ─── GraphQL fragment ────────────────────────────────────────────────────────
// NOTE: After editing this fragment, run `npm run codegen` to regenerate types.
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

    button_text: field(key: "button_text") {
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
              model: metafield(namespace: "custom", key: "model") {
                reference {
                  ... on Model3d {
                    sources {
                      url
                    }
                  }
                }
              }
              options {
                name
                values
              }
              variants(first: 100) {
                nodes {
                  id
                  availableForSale
                  price {
                    amount
                    currencyCode
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
              model: metafield(namespace: "custom", key: "model") {
                reference {
                  ... on Model3d {
                    sources {
                      url
                    }
                  }
                }
              }
              options {
                name
                values
              }
              variants(first: 100) {
                nodes {
                  id
                  availableForSale
                  price {
                    amount
                    currencyCode
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
              model: metafield(namespace: "custom", key: "model") {
                reference {
                  ... on Model3d {
                    sources {
                      url
                    }
                  }
                }
              }
              options {
                name
                values
              }
              variants(first: 100) {
                nodes {
                  id
                  availableForSale
                  price {
                    amount
                    currencyCode
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
