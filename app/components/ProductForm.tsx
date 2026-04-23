import {useState} from 'react';
import {useNavigate} from 'react-router';
import {type MappedProductOptions} from '@shopify/hydrogen';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import {OptionSwatch} from './OptionSwatch';
import type {ProductFragment} from 'storefrontapi.generated';
import {useTranslation} from '~/lib/useTranslation';

export function ProductForm({
  productOptions,
  selectedVariant,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  const navigate = useNavigate();
  const {open} = useAside();
  const {t} = useTranslation();

  const [quantity, setQuantity] = useState(1);

  const primaryOptions = productOptions.slice(0, 2);
  const secondaryOptions = productOptions.slice(2);

  const decrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const increase = () => {
    setQuantity((prev) => prev + 1);
  };

  const unitPrice = selectedVariant
    ? Number(selectedVariant.price.amount)
    : 0;
  const totalPrice = unitPrice * quantity;
  const formattedTotalPrice = totalPrice.toFixed(2);

  return (
    <div className="flex flex-col gap-8">
      {/* First row: first two options side by side */}
      <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
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

      {/* Price, quantity, Add to Cart */}
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex items-center gap-6 justify-center lg:justify-start">
          {/* Quantity selector with rounded buttons */}
          <div className="flex items-center gap-3 font-medium">
            <button
              type="button"
              onClick={decrease}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              -
            </button>

            <span
              aria-live="polite"
              className="min-w-[1.5rem] text-center"
            >
              {quantity}
            </span>

            <button
              type="button"
              onClick={increase}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Total price: quantity × unit price */}
          <div className="">
            {formattedTotalPrice}{' '}
            {selectedVariant?.price.currencyCode === 'CHF'
              ? 'chf.'
              : selectedVariant?.price.currencyCode}
          </div>
        </div>

        <AddToCartButton
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          onClick={() => open('cart')}
          className="w-full justify-center"
          lines={
            selectedVariant
              ? [
                  {
                    merchandiseId: selectedVariant.id,
                    quantity,
                    selectedVariant,
                  },
                ]
              : []
          }
        >
          <span className="">
            {selectedVariant?.availableForSale
              ? t('product.addToCart')
              : t('product.soldOut')}
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
      <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
        {option.optionValues.map((value: any) => {
          const {
            name,
            handle,
            variantUriQuery,
            selected,
            exists,
            available,
            availableForSale,
            isDifferentProduct,
          } = value;
          const isDisabled =
            !exists || available === false || availableForSale === false;

          if (isDifferentProduct) {
            return (
              <OptionSwatch
                key={option.name + name}
                optionName={option.name}
                value={name}
                selected={selected}
                disabled={isDisabled}
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
              disabled={isDisabled}
              onClick={() => {
                if (!selected && !isDisabled) {
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