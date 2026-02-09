import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header;
  return (
    <header className="sticky top-0 flex items-center justify-between w-full px-4 mb-4 md:px-8 bg-white h-[var(--header-height)] border-b border-gray-100">
      {/* 1. Mobile: Burger Menu (Left) */}
      <div className="flex items-center flex-1 md:hidden">
        <HeaderMenuMobileToggle />
      </div>

      {/* 2. Logo: Left on Desktop, Centered on Mobile */}
      <div className="flex items-center justify-center flex-1 md:flex-none md:justify-start">
        <NavLink prefetch="intent" to="/" style={activeLinkStyle} end className="no-underline">
          <strong className="text-xl font-black tracking-tighter text-black uppercase">
            {shop.name}
          </strong>
        </NavLink>
      </div>

      {/* 3. Desktop Navigation: Absolutely Centered */}
      <HeaderMenu
        menu={menu}
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />

      {/* 4. Actions: Language + Cart (Right) */}
      <div className="flex items-center justify-end flex-1 gap-4 text-body">
        <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
      </div>
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const {close} = useAside();

  const className =
    viewport === 'desktop'
      ? 'hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2'
      : 'flex flex-col gap-4 py-6';

  return (
    <nav className={className} role="navigation">
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // SPECIAL CASE:
        // If this menu item is the "Shop" item from Shopify,
        // send it to our Hydrogen /shop route instead of the Shopify URL.
        if (item.title === 'Shop') {
          return (
            <NavLink
              className="text-nav no-underline uppercase hover:opacity-60 transition-opacity"
              end
              key={item.id}
              onClick={close}
              prefetch="intent"
              style={activeLinkStyle}
              to="/shop"
            >
              {item.title}
            </NavLink>
          );
        }

        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;

        return (
          <NavLink
            className="text-nav no-underline uppercase hover:opacity-60 transition-opacity"
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav className="flex items-center gap-4" role="navigation">
      <button className="hidden md:block text-[13px] font-black border-b-2 border-black pb-0.5 leading-none uppercase">
        EN
      </button>
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {type, open, close} = useAside();
  const isMobileOpen = type === 'mobile';

  return (
    <button
      className="p-2 -ml-2 text-2xl bg-transparent border-none cursor-pointer focus:outline-none"
      onClick={() => (isMobileOpen ? close() : open('mobile'))}
      aria-label={isMobileOpen ? "Close menu" : "Open menu"}
    >
      {/* Toggles between Hamburger and X icon */}
      <h3 className="m-0 leading-none">{isMobileOpen ? '✕' : '☰'}</h3>
    </button>
  );
}

function CartBadge({count}: {count: number | null}) {
  const {type, open, close} = useAside(); // Access the current aside state
  const {publish, shop, cart, prevCart} = useAnalytics();

  const isCartOpen = type === 'cart';

  return (
    <button
      className="relative flex items-center justify-center cursor-pointer focus:outline-none"
      onClick={(e) => {
        e.preventDefault();
        
        // Toggle Logic: If open, close it. If closed, open it.
        if (isCartOpen) {
          close();
        } else {
          open('cart');
          publish('cart_viewed', {
            cart,
            prevCart,
            shop,
            url: window.location.href || '',
          } as CartViewPayload);
        }
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
        <path d="M3 6h18"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
      {count !== null && count > 0 && (
        <span className="absolute -top-1 -right-2 bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {count}
        </span>
      )}
    </button>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/1',
  items: [
    { id: '1', title: 'Collections', url: '/collections' },
    { id: '2', title: 'Blog', url: '/blogs/journal' },
    { id: '3', title: 'About', url: '/pages/about' },
  ],
};

function activeLinkStyle({isActive}: {isActive: boolean}) {
  return {
    fontWeight: isActive ? '600' : '00',
  };
}