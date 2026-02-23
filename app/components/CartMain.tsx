import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  const cart = useOptimisticCart(originalCart);
  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;

  const lines = (cart?.lines?.nodes ?? []).map((line) => (
    <CartLineItem key={line.id} line={line} layout={layout} />
  ));

  // ── Page layout: items left, summary right on desktop ───────────
  if (layout === 'page') {
    return (
      <div className="flex flex-col lg:flex-row lg:gap-16 w-full lg:h-full">
        {/* Left: line items (scrollable on desktop) */}
        <div className="flex-1 min-w-0 lg:overflow-y-auto lg:min-h-0 lg:pb-8 pt-6">
          <CartEmpty hidden={linesCount} layout={layout} />
          <ul>{lines}</ul>
        </div>

        {/* Right: summary */}
        {cartHasItems && (
          <div className="lg:w-72 lg:shrink-0 lg:self-start mt-8 lg:mt-0 lg:pb-8 pt-6">
            <CartSummary cart={cart} layout={layout} />
          </div>
        )}
      </div>
    );
  }

  // ── Aside layout: stacked, summary pinned to bottom ─────────────
  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white">
      <div className="flex-grow overflow-y-auto scrollbar-hide">
        <CartEmpty hidden={linesCount} layout={layout} />
        <div aria-labelledby="cart-lines">
          <ul>{lines}</ul>
        </div>
      </div>

      {cartHasItems && (
        <div>
          <CartSummary cart={cart} layout={layout} />
        </div>
      )}
    </div>
  );
}

function CartEmpty({
  hidden = false,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();
  return (
    <div hidden={hidden}>
      <br />
      <p>
        Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
        started!
      </p>
      <br />
      <Link to="/collections" onClick={close} prefetch="viewport">
        Continue shopping →
      </Link>
    </div>
  );
}
