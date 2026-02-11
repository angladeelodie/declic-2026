import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
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
        {(footer) => (
          <footer className="w-full bg-white text-slate-900 py-12 border-t border-slate-100">
            <FooterMenu
              menu={footer?.menu}
              primaryDomainUrl={header.shop.primaryDomain?.url}
              publicStoreDomain={publicStoreDomain}
            />
          </footer>
        )}
      </Await>
    </Suspense>
  );
}

function FooterMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  menu: FooterQuery['menu'] | undefined;
  primaryDomainUrl?: string;
  publicStoreDomain: string;
}) {
  return (
    <nav className="grid grid-rows-2 md:grid-rows-1 grid-cols-6 lg:grid-cols-12 gap-4" role="navigation">
      
      

      {/* Col 3-4: Pages */}
      <div className="col-span-3 md:col-span-1 md:col-start-2 lg:col-start-3 lg:col-span-2 flex flex-col gap-4">
        <h3 className="font-metalite">Pages</h3>
        <ul className="flex flex-col">
          {(menu || FALLBACK_FOOTER_MENU).items.map((item) => {
            if (!item.url) return null;
            const url = item.url.includes('myshopify.com') || 
                        item.url.includes(publicStoreDomain) || 
                        (primaryDomainUrl && item.url.includes(primaryDomainUrl))
              ? new URL(item.url).pathname
              : item.url;
            
            return (
              <li key={item.id}>
                <NavLink 
                  end 
                  to={url} 
                  prefetch="intent" 
                  className='font-bold'
                  
                >
                  {item.title}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Col 5-6: Legal */}
      <div className="col-span-3 md:col-span-1 lg:col-span-2 flex flex-col gap-4">
        <h3 className="font-metalite">Legal</h3>
        <ul className="flex flex-col font-bold">
          <li><NavLink className="hover:text-gray-500" to="/policies/privacy-policy">Privacy Policy</NavLink></li>
          <li><NavLink className="hover:text-gray-500" to="/policies/terms-of-service">Terms of Service</NavLink></li>
          <li><NavLink className="hover:text-gray-500" to="/policies/refund-policy">Refund Policy</NavLink></li>
        </ul>
      </div>

      {/* Col 7-8: Find Us */}
      <div className="col-span-3 md:col-span-1 lg:col-span-2 flex flex-col gap-4">
        <h3 className="font-metalite">Find Us</h3>
        <ul className="flex flex-col font-bold">
          <li><a href="https://instagram.com" className="hover:text-gray-500" target="_blank" rel="noreferrer">Instagram</a></li>
          <li><a href="https://facebook.com" className="hover:text-gray-500" target="_blank" rel="noreferrer">Facebook</a></li>
          <li><a href="https://twitter.com" className="hover:text-gray-500" target="_blank" rel="noreferrer">X (Twitter)</a></li>
        </ul>
      </div>

      {/* Col 9-10: Contact */}
      <div className="col-span-3 md:col-span-1 lg:col-span-2 flex flex-col gap-4">
        <h3 className="font-metalite">Contact</h3>
        <address className="not-italic flex flex-col font-bold">
          <p>123 Shopify Way</p>
          <p>Ecommerce City, EC1 2AB</p>
          <a href="mailto:hello@store.com" className="text-slate-900 font-medium underline underline-offset-4">
            hello@store.com
          </a>
        </address>
      </div>

      
    </nav>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'fallback',
  items: [
    { id: '1', title: 'Home', url: '/' },
    { id: '2', title: 'Shop', url: '/collections/all' },
  ],
};