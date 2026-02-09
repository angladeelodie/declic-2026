import {Link, useNavigate} from 'react-router';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import type {ProductFragment} from 'storefrontapi.generated';
export function ProductForm({
  productOptions,
  selectedVariant,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  const navigate = useNavigate();
  const {open} = useAside();

  return (
    <div className="flex flex-col gap-8">
      {productOptions.map((option) => {
        if (option.optionValues.length === 1) return null;

        return (
          <div key={option.name} className="flex flex-col gap-3">
            {/* We hide the label or keep it very subtle to match the clean look */}
            {/* <h5 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
              Select {option.name}
            </h5> */}
            
            <div className="flex flex-wrap gap-3">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                const commonClasses = `
                  relative flex items-center justify-center min-w-[40px] h-[40px] rounded-full border transition-all duration-200
                  ${selected ? 'border-black scale-110' : 'border-gray-200 hover:border-gray-400'}
                  ${!exists ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}
                `;

                const content = (
                  <div className="flex items-center justify-center w-full h-full p-0.5">
                    <ProductOptionSwatch swatch={swatch} name={name} selected={selected} />
                  </div>
                );

                if (isDifferentProduct) {
                  return (
                    <Link
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                      className={commonClasses}
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    type="button"
                    key={option.name + name}
                    disabled={!exists}
                    onClick={() => {
                      if (!selected) {
                        void navigate(`?${variantUriQuery}`, {
                          replace: true,
                          preventScrollReset: true,
                        });
                      }
                    }}
                    className={commonClasses}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Price and Add to Cart Row */}
      <div className="flex items-center justify-between gap-4 mt-4">
        {/* Quantity / Price Placeholder */}
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-3 font-medium">
              <span className="text-gray-400">-</span>
              {/* amount of items to add to cart */}
              <span>1</span>
              <span className="text-gray-400">+</span>
           </div>
           <div className="text-lg font-bold">
             {selectedVariant?.price.amount} {selectedVariant?.price.currencyCode === 'CHF' ? 'chf.' : selectedVariant?.price.currencyCode}
           </div>
        </div>

        <AddToCartButton
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          onClick={() => open('cart')}
          className="bg-[#3eff9d] hover:bg-[#34e58b] text-black font-bold py-3 px-8 rounded-full flex items-center gap-3 transition-transform active:scale-95 shadow-sm"
          lines={
            selectedVariant
              ? [{merchandiseId: selectedVariant.id, quantity: 1, selectedVariant}]
              : []
          }
        >
          <span>{selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </AddToCartButton>
      </div>
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
  selected
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
  selected: boolean;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  // For text-based options (like sizes XS, S, M)
  if (!image && !color) {
    return <span className="text-xs text-metalite font-bold uppercase">{name}</span>;
  }

  // For color-based options
  return (
    <div
      aria-label={name}
      className="w-full h-full rounded-full border border-black/5"
      style={{
        backgroundColor: color || 'transparent',
        backgroundImage: image ? `url(${image})` : 'none',
        backgroundSize: 'cover',
      }}
    />
  );
}
