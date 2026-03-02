import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue, useLocation} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {LanguageSwitcher} from '~/components/LanguageSwitcher';
import {getCurrentLocale} from '~/lib/i18n';

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
  const {pathname} = useLocation();
  const currentLocale = getCurrentLocale(pathname);
  return (
    <header className="sticky z-100 top-0 flex items-center justify-between w-full px-4 mb-4 md:px-8 bg-white h-[var(--header-height)] border-b border-gray-100">
      {/* 1. Mobile: Burger Menu (Left) */}
      <div className="flex items-center flex-1 md:hidden">
        <HeaderMenuMobileToggle />
      </div>

      {/* 2. Logo: Left on Desktop, Centered on Mobile */}
      <div className="flex items-center justify-center flex-1 md:flex-none md:justify-start">
        <NavLink prefetch="intent" to={currentLocale.pathPrefix + '/'} style={activeLinkStyle} end className="no-underline">
          {shop.brand?.logo?.image?.url ? (
            <img
              src={shop.brand.logo.image.url}
              alt={shop.name}
              className="h-8 w-auto"
            />
          ) : (
            <strong className="text-xl font-black tracking-tighter text-black uppercase">
              {shop.name}
            </strong>
          )}
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
  const {pathname} = useLocation();
  const currentLocale = getCurrentLocale(pathname);

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
        // if (item.title === 'Shop') {
        //   return (
        //     <NavLink
        //       className="text-nav no-underline uppercase hover:opacity-60 transition-opacity"
        //       end
        //       key={item.id}
        //       onClick={close}
        //       prefetch="intent"
        //       style={activeLinkStyle}
        //       to="/shop"
        //     >
        //       {item.title}
        //     </NavLink>
        //   );
        // }

        const rawPath =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;

        // Shopify may return paths with its own locale prefix (e.g. /fr/pages/shop).
        // Strip it, then prepend our locale's pathPrefix so links stay locale-aware.
        const cleanPath = rawPath.replace(/^\/[a-z]{2}(\/|$)/, '/');
        const url = currentLocale.pathPrefix + cleanPath;

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
      <LanguageSwitcher />
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
        <span className="absolute -top-1 -right-2 bg-[#3eff9d] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center ring-2 ring-black">
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
    fontWeight: isActive ? '600' : '100',
  };
}