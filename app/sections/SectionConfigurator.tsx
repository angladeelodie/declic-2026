import {useSearchParams} from 'react-router';
import {useState, useEffect, useCallback} from 'react';
import type {SectionConfiguratorFragment} from 'storefrontapi.generated';
import {ConfiguratorCanvas} from '~/components/ConfiguratorCanvas';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';

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
};

type OptionSelection = {size: string | null; color: string | null};

// ─── Helpers ────────────────────────────────────────────────────────────────
const WELCOME_KEY = 'hasSeenConfiguratorWelcome';

const NAME_TO_COLOR: Record<string, string> = {
  black: '#000000',
  white: '#ffffff',
};

function normalizeColor(name: string): string | null {
  const lower = name.toLowerCase().trim();
  if (NAME_TO_COLOR[lower]) return NAME_TO_COLOR[lower];
  // Check if it looks like a valid CSS color (hex, rgb, named)
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(lower)) return lower;
  return lower || null;
}

function getDistinctOptionValues(
  product: ProductNode | null | undefined,
  optionName: string,
): string[] {
  if (!product?.variants?.nodes) return [];
  const values = new Set<string>();
  for (const variant of product.variants.nodes) {
    for (const opt of variant.selectedOptions) {
      if (opt.name.toLowerCase() === optionName.toLowerCase()) {
        values.add(opt.value);
      }
    }
  }
  return Array.from(values);
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
    const sizeOk = !size || opts['size'] === size || opts['taille'] === size;
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

  const selectedTopHandle = searchParams.get('top');
  const selectedBottomHandle = searchParams.get('bottom');
  const selectedSleeveHandle = searchParams.get('sleeve');

  const tops = (props.tops_collection?.reference?.products?.nodes ??
    []) as ProductNode[];
  const bottoms = (props.bottoms_collection?.reference?.products?.nodes ??
    []) as ProductNode[];
  const sleeves = (props.sleeves_collection?.reference?.products?.nodes ??
    []) as ProductNode[];

  const [activeCategory, setActiveCategory] = useState<
    'tops' | 'bottoms' | 'sleeves'
  >('tops');
  const [showWelcome, setShowWelcome] = useState(true);
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
    setShowWelcome(false);
  }, []);

  // ── Category map: one source of truth per category ───────────────
  const categoryMap = {
    tops:    {products: tops,    urlKey: 'top',    selectedHandle: selectedTopHandle},
    bottoms: {products: bottoms, urlKey: 'bottom', selectedHandle: selectedBottomHandle},
    sleeves: {products: sleeves, urlKey: 'sleeve', selectedHandle: selectedSleeveHandle},
  } as const;

  function handleSelectProduct(handle: string) {
    const {urlKey} = categoryMap[activeCategory];
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set(urlKey, handle);
      return next;
    });
    setAllOptions((prev) => ({...prev, [activeCategory]: {size: null, color: null}}));
  }

  function setActiveOptions(updater: (prev: OptionSelection) => OptionSelection) {
    setAllOptions((prev) => ({
      ...prev,
      [activeCategory]: updater(prev[activeCategory]),
    }));
  }

  // ── Derived data ─────────────────────────────────────────────────
  // All three selected products needed for the 3D canvas
  const selectedProducts = {
    tops:    tops.find((p) => p.handle === selectedTopHandle) ?? null,
    bottoms: bottoms.find((p) => p.handle === selectedBottomHandle) ?? null,
    sleeves: sleeves.find((p) => p.handle === selectedSleeveHandle) ?? null,
  };

  const topModelUrl    = selectedProducts.tops?.model?.reference?.sources[0]?.url ?? null;
  const bottomModelUrl = selectedProducts.bottoms?.model?.reference?.sources[0]?.url ?? null;
  const sleeveModelUrl = selectedProducts.sleeves?.model?.reference?.sources[0]?.url ?? null;

  const active        = categoryMap[activeCategory];
  const activeOptions = allOptions[activeCategory];
  const activeProduct = selectedProducts[activeCategory];

  // Sizes & colors for active product
  const sizes = getDistinctOptionValues(activeProduct, 'size').concat(
    getDistinctOptionValues(activeProduct, 'taille'),
  );
  const colors = getDistinctOptionValues(activeProduct, 'color').concat(
    getDistinctOptionValues(activeProduct, 'couleur'),
  );

  const activeVariant = resolveVariant(
    activeProduct,
    activeOptions.size,
    activeOptions.color,
  );

  // ── Sub-renderers ────────────────────────────────────────────────
  function renderProductThumbnails() {
    return (
      <ul className="flex flex-row gap-3 flex-wrap">
        {active.products.map((product) => {
          const isSelected = product.handle === active.selectedHandle;
          const image = product.featuredImage;
          return (
            <li
              key={product.id}
              className={`w-35 aspect-square overflow-hidden rounded-md flex-shrink-0 transition-all duration-200 ${
                isSelected
                  ? 'border-2 border-black'
                  : 'border-2 border-transparent hover:border-gray-300'
              }`}
            >
              <button
                type="button"
                onClick={() => handleSelectProduct(product.handle)}
                className="h-full w-full"
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

  function renderColorSwatches() {
    if (!colors.length) return null;
    return (
      <div className="flex flex-row items-center justify-center flex-col gap-3 flex-shrink-0">
        {colors.map((color) => {
          const resolved = normalizeColor(color);
          const isSelected = activeOptions.color === color;
          return (
            <button
              key={color}
              type="button"
              aria-label={color}
              onClick={() => setActiveOptions((prev) => ({...prev, color}))}
              className={`w-10 h-10 rounded-full border-2 transition-all duration-200 p-0.5 ${
                isSelected
                  ? 'border-black scale-110'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <div
                className="w-full h-full rounded-full border border-black/5"
                style={{backgroundColor: resolved ?? '#ccc'}}
              />
            </button>
          );
        })}
      </div>
    );
  }

  function renderSizeSelector() {
    if (!sizes.length) return null;
    return (
      <div className="flex flex-wrap gap-3 mt-8">
        {sizes.map((size) => {
          const isSelected = activeOptions.size === size;
          return (
            <button
              key={size}
              type="button"
              onClick={() => setActiveOptions((prev) => ({...prev, size}))}
              className={`relative flex items-center justify-center min-w-[40px] h-[40px] rounded-full border transition-all duration-200 ${
                isSelected
                  ? 'border-black scale-110'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <span className="text-xs text-metalite font-bold uppercase px-1">
                {size}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // ── Welcome screen ───────────────────────────────────────────────
  function renderWelcome() {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-title text-left w-full pt-0 pb-4">
          {(props as any).title?.value ?? 'Create your outfit'}
        </h2>
        <p className="text-body w-[80%] text-left self-start">
          {(props as any).description?.value ??
            'Mix and match tops, sleeves and bottoms to build your perfect look.'}
        </p>
        <button
          type="button"
          onClick={handleStartCreating}
          className="bg-[#3eff9d] hover:bg-[#34e58b] text-black text-metalite py-2 px-12 rounded-full transition-all duration-200 mt-8 self-start"
        >
          Start Creating
        </button>
      </div>
    );
  }

  // ── Right panel main UI ──────────────────────────────────────────
  function renderRightPanel() {
    return (
      <div className="flex flex-col gap-5 h-full justify-start pt-16">
        {/* 2 — Category tabs */}
        <div className="flex justify-start gap-12">
          {(
            [
              {key: 'tops', label: 'Tops'},
              {key: 'sleeves', label: 'Sleeves'},
              {key: 'bottoms', label: 'Bottoms'},
            ] as const
          ).map(({key, label}) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveCategory(key)}
              className={`text-title transition-colors duration-150 ${
                activeCategory === key ? 'text-black' : 'text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 3 — Thumbnails + Color swatches */}
        <div className="flex gap-4">
          <div className="flex-1 overflow-x-auto">
            {renderProductThumbnails()}
          </div>
          {renderColorSwatches()}
        </div>

        {/* 1 — Size selector */}
        {renderSizeSelector()}

        {/* 4 — Bottom action bar */}
        <div className="flex items-center justify-between gap-4 pt-2 mt-16">
          <div className="flex items-center gap-6">
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

          {/* Add to cart */}
          <AddToCartButton
            disabled={!activeVariant?.availableForSale}
            onClick={() => open('cart')}
            lines={
              activeVariant
                ? [
                    {
                      merchandiseId: activeVariant.id,
                      quantity,
                      selectedVariant: activeVariant as any,
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
    );
  }

  // ── Render ───────────────────────────────────────────────────────
  return (
    <section className="section-configurator section-main grid-rows-[1fr]">
      {/* Left: 3D preview */}
      <div className="lg:col-start-2 lg:col-span-4 h-full">
        <div className="relative w-full aspect-[2/3] bg-gray-200 self-center rounded-[var(--radius-sharp)] overflow-hidden">
          <div className="absolute inset-0">
            <ConfiguratorCanvas
              topModelUrl={topModelUrl}
              bottomModelUrl={bottomModelUrl}
              sleeveModelUrl={sleeveModelUrl}
            />
          </div>
        </div>
      </div>

      {/* Right: welcome or main UI */}
      <div className="lg:col-start-7 lg:col-span-5">
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
              variants(first: 20) {
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
              variants(first: 20) {
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
              variants(first: 20) {
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
