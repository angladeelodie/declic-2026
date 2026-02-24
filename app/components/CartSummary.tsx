import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useEffect, useRef} from 'react';
import {useFetcher} from 'react-router';
import type {FetcherWithComponents} from 'react-router';
import {useTranslation} from '~/lib/useTranslation';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  const {t} = useTranslation();
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';

  return (
    <div aria-labelledby="cart-summary" className={className}>
      <div className={`flex flex-col gap-4 bg-white ${layout === 'aside' ? 'max-w-md mx-auto' : ''}`}>
        <h2 className="text-2xl font-bold tracking-tight mb-2">{t('cart.summary')}</h2>

        {/* 6-Column Grid for Totals */}
        <div className="flex flex-col gap-3 border-b border-gray-100 pb-6">
          {/* Subtotal */}
          <div className="grid grid-cols-6 items-center">
            <span className="col-span-3">{t('cart.subtotal')}</span>
            <span className="col-span-3 text-right">
              {cart?.cost?.subtotalAmount?.amount ? (
                <Money data={cart?.cost?.subtotalAmount} />
              ) : (
                '-'
              )}
            </span>
          </div>

          {/* Unified Minimalist Coupons & Gift Cards */}
          <div className="flex flex-col gap-3">
            <CartDiscounts discountCodes={cart?.discountCodes} />
            <CartGiftCard giftCardCodes={cart?.appliedGiftCards} />
          </div>

          {/* Total Row */}
          <div className="grid grid-cols-6 items-center mt-2 pt-4 border-t border-gray-100">
            <span className="col-span-3 text-metaline">{t('cart.total')}</span>
            <span className="col-span-3 text-right text-lg font-bold">
              {cart?.cost?.totalAmount ? (
                <Money data={cart?.cost?.totalAmount} />
              ) : (
                '0.00'
              )}
            </span>
          </div>
        </div>

        <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} />
      </div>
    </div>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl?: string}) {
  const {t} = useTranslation();
  if (!checkoutUrl) return null;

  return (
    <div className="mt-2 flex justify-center">
      <a
        href={checkoutUrl}
        target="_self"
        className="bg-[var(--color-accent)] hover:bg-[#34e58b] text-black font-bold py-3 px-10 rounded-full flex items-center justify-center gap-3 transition-transform active:scale-95 text-base w-full md:w-auto min-w-[180px]"
      >
        <span>{t('cart.order')}</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </a>
    </div>
  );
}

function CartDiscounts({
  discountCodes,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
}) {
  const {t} = useTranslation();
  const codes: string[] =
    discountCodes?.filter((d) => d.applicable)?.map(({code}) => code) || [];

  return (
    <div className="w-full">
      <UpdateDiscountForm discountCodes={codes}>
        <div className="grid grid-cols-6 gap-2 items-center">
          <input
            type="text"
            name="discountCode"
            placeholder={t('cart.couponCode')}
            className="col-span-4 bg-transparent focus:outline-none"
          />
          <button
            type="submit"
            className="col-span-2 text-right hover:text-grey-500"
          >
            {t('cart.apply')}
          </button>
        </div>
      </UpdateDiscountForm>

      {codes.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {codes.map((code) => (
            <div
              key={code}
              className="flex items-center gap-1 text-[9px] font-bold uppercase text-gray-500"
            >
              <span>{code}</span>
              <UpdateDiscountForm
                discountCodes={codes.filter((c) => c !== code)}
              >
                <button className="text-gray-300 hover:text-red-500">✕</button>
              </UpdateDiscountForm>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartGiftCard({
  giftCardCodes,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
}) {
  const {t} = useTranslation();
  const appliedGiftCardCodes = useRef<string[]>([]);
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});

  // Clear the gift card code input after the gift card is added
  useEffect(() => {
    if (giftCardAddFetcher.data) {
      giftCardCodeInput.current!.value = '';
    }
  }, [giftCardAddFetcher.data]);

  function saveAppliedCode(code: string) {
    const formattedCode = code.replace(/\s/g, ''); // Remove spaces
    if (!appliedGiftCardCodes.current.includes(formattedCode)) {
      appliedGiftCardCodes.current.push(formattedCode);
    }
  }

  return (
    <div>
      {/* Display applied gift cards with individual remove buttons */}
      {giftCardCodes && giftCardCodes.length > 0 && (
        <dl>
          <dt>{t('cart.appliedGiftCards')}</dt>
          {giftCardCodes.map((giftCard) => (
            <RemoveGiftCardForm key={giftCard.id} giftCardId={giftCard.id}>
              <div className="cart-discount">
                <code>***{giftCard.lastCharacters}</code>
                &nbsp;
                <Money data={giftCard.amountUsed} />
                &nbsp;
                <button type="submit">{t('cart.remove')}</button>
              </div>
            </RemoveGiftCardForm>
          ))}
        </dl>
      )}

      {/* Show an input to apply a gift card */}
      <UpdateGiftCardForm
        giftCardCodes={appliedGiftCardCodes.current}
        saveAppliedCode={saveAppliedCode}
        fetcherKey="gift-card-add"
      >
        <div className="grid grid-cols-6 gap-2 items-center">
          <input
            type="text"
            name="giftCardCode"
            placeholder={t('cart.giftCardCode')}
            ref={giftCardCodeInput}
            className="col-span-4 bg-transparent focus:outline-none"
          />
          <button
            type="submit"
            disabled={giftCardAddFetcher.state !== 'idle'}
            className="col-span-2 text-right hover:text-grey-500"
          >
            {t('cart.apply')}
          </button>
        </div>
      </UpdateGiftCardForm>
    </div>
  );
}

function UpdateGiftCardForm({
  giftCardCodes,
  saveAppliedCode,
  fetcherKey,
  children,
}: {
  giftCardCodes?: string[];
  saveAppliedCode?: (code: string) => void;
  fetcherKey?: string;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      fetcherKey={fetcherKey}
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesUpdate}
      inputs={{
        giftCardCodes: giftCardCodes || [],
      }}
    >
      {(fetcher: FetcherWithComponents<any>) => {
        const code = fetcher.formData?.get('giftCardCode');
        if (code && saveAppliedCode) {
          saveAppliedCode(code as string);
        }
        return children;
      }}
    </CartForm>
  );
}

function RemoveGiftCardForm({
  giftCardId,
  children,
}: {
  giftCardId: string;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{
        giftCardCodes: [giftCardId],
      }}
    >
      {children}
    </CartForm>
  );
}
