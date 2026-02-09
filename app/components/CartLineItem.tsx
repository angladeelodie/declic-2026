import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
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
      
      {/* 1. Image Column (2/6) - 4:5 Aspect Ratio */}
      <div className="col-span-2">
        {image && (
          <div className="aspect-[2/3] overflow-hidden bg-[#f3eded] rounded-[30px]">
            <Image
              alt={title}
              data={image}
              aspectRatio="2/3"
              className="w-full h-full object-cover "
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* 2. Content Column (3/6) */}
      <div className="col-span-3 flex flex-col gap-4">
        {/* Product Name */}
        <Link
          prefetch="intent"
          to={lineItemUrl}
          className="text-metalite font-bold hover:opacity-70 transition-opacity"
          onClick={() => layout === 'aside' && close()}
        >
          {product.title}
        </Link>

        {/* Circular Detail Badges (Size & Color Only) */}
        <div className="flex flex-wrap gap-3 items-center">
          {selectedOptions.map((option) => {
            const isColor = option.name.toLowerCase() === 'color' || option.name.toLowerCase() === 'couleur';
            
            return (
              <div 
                key={option.name}
                className="w-10 h-10 rounded-full border flex items-center justify-center text-[10px] font-bold uppercase overflow-hidden border-black"
                style={isColor ? { backgroundColor: option.value.toLowerCase() } : {}}
              >
                {!isColor && option.value}
              </div>
            );
          })}
        </div>

        {/* Quantity Toggle & Price Stack */}
        <div className="flex flex-col gap-3">
            <CartLineQuantity line={line} />
            <div className="font-metalite font-bold">
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
      <CartLineUpdateButton lines={[{id: lineId, quantity: Math.max(0, quantity - 1)}]}>
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

function CartLineRemoveButton({lineIds, disabled}: {lineIds: string[]; disabled: boolean}) {
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
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
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
