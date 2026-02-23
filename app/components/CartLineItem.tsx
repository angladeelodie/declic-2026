import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import {OptionSwatch} from './OptionSwatch';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 */
export function CartLineItem({
  layout,
  line,
}: {
  layout: CartLayout;
  line: CartLine;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();

  return (
    <li key={id} className="grid grid-cols-6 gap-4 pb-4 items-start">
      {/* 1. Image Column */}
      <Link
        prefetch="intent"
        to={lineItemUrl}
        onClick={() => layout === 'aside' && close()}
        className={layout === 'page' ? 'col-span-1' : 'col-span-2'}
      >
        {image && (
          <div className="aspect-[2/3] overflow-hidden bg-gray-100 rounded-lg">
            <Image
              alt={title}
              data={image}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
        )}
      </Link>

      {/* 2. Content Column */}
      <div className={`${layout === 'page' ? 'col-span-4 ' : 'col-span-3'} h-full flex flex-col align-center pn-1`}>
        {/* Product Name */} 
        <Link
          prefetch="intent"
          to={lineItemUrl}
          className="text-metalite font-bold hover:opacity-70 transition-opacity"
          onClick={() => layout === 'aside' && close()}
        >
          {product.title}
        </Link>

        <div
          className={`${layout === 'page' ? 'md:col-span-4 md:pb-6 md:flex-row' : 'col-span-3 mt-4'} flex flex-col gap-4 justify-between align-center flex-1`}
          >
          {/* Option Swatches */}
          <div className="flex flex-wrap gap-3 items-center">
            {selectedOptions.map((option) => (
              <OptionSwatch
                key={option.name}
                optionName={option.name}
                value={option.value}
                selected
              />
            ))}
          </div>

          {/* Quantity Toggle & Price Stack */}
          <CartLineQuantity line={line} />
          <div className={`font-metalite font-bold ${layout === 'page' ? 'md:self-center' : ''}`}>
            <ProductPrice price={line?.cost?.totalAmount} />
          </div>
        </div>
      </div>

      {/* 3. Remove Column (1/6) - Simple X */}
      <div className="col-span-1 flex h-full items-center justify-end">
        <CartLineRemoveButton lineIds={[id]} disabled={!!line.isOptimistic} />
      </div>
    </li>
  );
}

/**
 * Quantity Toggle: - 1 +
 */
function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;

  return (
    <div className="flex items-center gap-4 font-bold text-sm">
      <CartLineUpdateButton
        lines={[{id: lineId, quantity: Math.max(0, quantity - 1)}]}
      >
        <button
          disabled={quantity <= 1 || !!isOptimistic}
          className="text-gray-400 hover:text-black transition-colors"
        >
          &#8722;
        </button>
      </CartLineUpdateButton>

      <span className="tabular-nums min-w-[12px] text-center">{quantity}</span>

      <CartLineUpdateButton lines={[{id: lineId, quantity: quantity + 1}]}>
        <button
          disabled={!!isOptimistic}
          className="text-gray-400 hover:text-black transition-colors"
        >
          &#43;
        </button>
      </CartLineUpdateButton>
    </div>
  );
}

function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        disabled={disabled}
        type="submit"
        className="hover:text-gray-500 transition-colors p-1"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/**
 * Returns a unique key for the update action. This is used to make sure actions modifying the same line
 * items are not run concurrently, but cancel each other. For example, if the user clicks "Increase quantity"
 * and "Decrease quantity" in rapid succession, the actions will cancel each other and only the last one will run.
 * @param lineIds - line ids affected by the update
 * @returns
 */
function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
