import {useNavigate} from 'react-router';
import {type MappedProductOptions} from '@shopify/hydrogen';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import {OptionSwatch} from './OptionSwatch';
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

  const primaryOptions = productOptions.slice(0, 2);
  const secondaryOptions = productOptions.slice(2);

  return (
    <div className="flex flex-col gap-8">
      {/* First row: first two options side by side */}
      <div className="flex flex-wrap gap-6">
        {primaryOptions.map((option) => (
          <div key={option.name} className="flex-auto">
            {renderOption(option, navigate)}
          </div>
        ))}
      </div>

      {/* Subsequent rows: each remaining option on its own row */}
      {secondaryOptions.map((option) => (
        <div key={option.name}>{renderOption(option, navigate)}</div>
      ))}

      {/* Price and Add to Cart Row */}
      <div className="flex items-center justify-between gap-4 mt-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 font-medium">
            <span className="text-gray-400">-</span>
            <span>1</span>
            <span className="text-gray-400">+</span>
          </div>
          <div className="text-lg font-bold">
            {selectedVariant?.price.amount}{' '}
            {selectedVariant?.price.currencyCode === 'CHF'
              ? 'chf.'
              : selectedVariant?.price.currencyCode}
          </div>
        </div>

        <AddToCartButton
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          onClick={() => open('cart')}
          lines={
            selectedVariant
              ? [
                  {
                    merchandiseId: selectedVariant.id,
                    quantity: 1,
                    selectedVariant,
                  },
                ]
              : []
          }
        >
          <span>
            {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
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
function renderOption(option: any, navigate: ReturnType<typeof useNavigate>) {
  return (
    <div key={option.name} className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4">
        {option.optionValues.map((value: any) => {
          const {
            name,
            handle,
            variantUriQuery,
            selected,
            exists,
            isDifferentProduct,
          } = value;

          if (isDifferentProduct) {
            return (
              <OptionSwatch
                key={option.name + name}
                optionName={option.name}
                value={name}
                selected={selected}
                disabled={!exists}
                to={`/products/${handle}?${variantUriQuery}`}
                replace
                preventScrollReset
              />
            );
          }

          return (
            <OptionSwatch
              key={option.name + name}
              optionName={option.name}
              value={name}
              selected={selected}
              disabled={!exists}
              onClick={() => {
                if (!selected) {
                  void navigate(`?${variantUriQuery}`, {
                    replace: true,
                    preventScrollReset: true,
                  });
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
