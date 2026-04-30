import {Suspense} from 'react';
import {Await, NavLink, useLocation} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {getCurrentLocale} from '~/lib/i18n';

type FooterMenus = {
  pages: FooterQuery['pages'] | null;
  legal: FooterQuery['legal'] | null;
  contactEmail: string | null;
  socials: Array<{label: string; url: string}>;
};

export interface FooterProps {
  footer: Promise<FooterMenus>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer: FooterMenus) => (
          <footer className="w-full bg-white text-slate-900 py-12 px-4 border-t border-slate-100">
            <FooterMenu
              pagesMenu={footer.pages}
              legalMenu={footer.legal}
              primaryDomainUrl={header.shop.primaryDomain?.url}
              publicStoreDomain={publicStoreDomain}
              contactEmail={footer.contactEmail}
              socialLinks={footer.socials}
            />
          </footer>
        )}
      </Await>
    </Suspense>
  );
}

function FooterMenu({
  pagesMenu,
  legalMenu,
  primaryDomainUrl,
  publicStoreDomain,
  contactEmail,
  socialLinks,
}: {
  pagesMenu: FooterQuery['pages'] | null;
  legalMenu: FooterQuery['legal'] | null;
  primaryDomainUrl?: string;
  publicStoreDomain: string;
  contactEmail: string | null;
  socialLinks: Array<{label: string; url: string}>;
}) {
  const {pathname} = useLocation();
  const {pathPrefix} = getCurrentLocale(pathname);
  const pagesItems = pagesMenu?.items ?? FALLBACK_FOOTER_MENU.items;
  const legalItems = legalMenu?.items ?? [];

  // Normalize internal URLs to use correct pathPrefix
  const normalizeUrl = (url: string) => {
    // Remove leading locale prefixes like /fr, /fr/, /fr-ch, /FR-CH/, etc.
    // Cases:
    // - "/fr" or "/fr/" -> treat as "/"
    // - "/fr/other/path" -> "/other/path"
    // - leave non-locale paths unchanged
    const normalized = url.replace(
      /^\/(?:(?:fr|it|en)(?:-ch)?)(?:\/(.*))?$/i,
      (_match, rest) => (rest ? '/' + rest : '/'),
    );

    return pathPrefix + (normalized || '/');
  };
  // console.log("socialLinks:", socialLinks);
  return (
    <nav
      className="grid md:grid-rows-1 grid-cols-6 lg:grid-cols-12 gap-2 text-sm"
      role="navigation"
    >
      {/* Col 1-2: Contact from metafield */}
      

      {/* Col 3-4: Pages */}
      <div className="col-span-3 md:col-span-1 md:col-start-2 lg:col-start-3 lg:col-span-2 flex flex-col gap-2">
        <ul className="flex flex-col">
          {pagesItems.map((item) => {
            if (!item?.url) return null;

            const isInternal =
              item.url.includes('myshopify.com') ||
              item.url.includes(publicStoreDomain) ||
              (primaryDomainUrl && item.url.includes(primaryDomainUrl));

            const url = isInternal ? normalizeUrl(new URL(item.url).pathname) : item.url;

            return (
              <li key={item.id}>
                <NavLink
                  end
                  to={url}
                  prefetch="intent"
                  className="capitalize"
                >
                  {item.title}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Col 5-6: Legal */}
      <div className="col-span-3 md:col-span-1 lg:col-span-2 flex flex-col gap-2">
        <ul className="flex flex-col">
          {legalItems.length > 0 ? (
            legalItems.map((item) => {
              if (!item?.url) return null;

              const isInternal =
                item.url.includes('myshopify.com') ||
                item.url.includes(publicStoreDomain) ||
                (primaryDomainUrl && item.url.includes(primaryDomainUrl));

              const url = isInternal ? normalizeUrl(new URL(item.url).pathname) : item.url;

              return (
                <li key={item.id}>
                  <NavLink
                    end
                    to={url}
                    prefetch="intent"
                    className="hover:text-gray-500 capitalize"
                  >
                    {item.title}
                  </NavLink>
                </li>
              );
            })
          ) : (
            <>
              {/* Fallback if the footer-legal menu isn’t configured */}
              <li>
                <NavLink
                  className="hover:text-gray-500 capitalize"
                  to={pathPrefix + '/policies/privacy-policy'}
                >
                  Privacy Policy
                </NavLink>
              </li>
              <li>
                <NavLink
                  className="hover:text-gray-500 capitalize"
                  to={pathPrefix + '/policies/terms-of-service'}
                >
                  Terms of Service
                </NavLink>
              </li>
              <li>
                <NavLink
                  className="hover:text-gray-500"
                  to={pathPrefix + '/policies/refund-policy'}
                >
                  Refund Policy
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Col 7-8: Find Us from metaobjects */}
      <div className="col-span-3 md:col-span-1 lg:col-span-2 flex flex-col gap-2">
        <ul className="flex flex-col">
          {socialLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.url}
                className="hover:text-gray-500"
                target="_blank"
                rel="noreferrer noopener"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="col-span-3 md:col-span-1 lg:col-span-2 flex flex-col gap-2">
        <address className="not-italic flex flex-col">
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="underline underline-offset-4"
            >
              {contactEmail}
            </a>
          )}
        </address>
      </div>
    </nav>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'fallback',
  items: [
    {id: '1', title: 'Home', url: '/'},
    {id: '2', title: 'Shop', url: '/collections/all'},
  ],
};