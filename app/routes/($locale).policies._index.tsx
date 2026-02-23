import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/policies._index';
import type {PoliciesQuery, PolicyItemFragment} from 'storefrontapi.generated';

export async function loader({context}: Route.LoaderArgs) {
  const data: PoliciesQuery = await context.storefront.query(POLICIES_QUERY);

  const shopPolicies = data.shop;
  const policies: PolicyItemFragment[] = [
    shopPolicies?.privacyPolicy,
    shopPolicies?.shippingPolicy,
    shopPolicies?.termsOfService,
    shopPolicies?.refundPolicy,
    shopPolicies?.subscriptionPolicy,
  ].filter((policy): policy is PolicyItemFragment => policy != null);

  if (!policies.length) {
    throw new Response('No policies found', {status: 404});
  }

  return {policies};
}

export default function Policies() {
  const {policies} = useLoaderData<typeof loader>();

  return (
    <section className="w-full grid grid-cols-6 lg:grid-cols-12 gap-4 px-4 md:px-0 pt-12 pb-20">
      <div className="col-span-6 lg:col-start-3 lg:col-span-8">

        {/* Header */}
        <div className="">
          <h1 className="text-title font-bold">Policies</h1>
        </div>

        {/* Policy list */}
        <nav aria-label="Policies">
          <ul className="flex flex-col">
            {policies.map((policy, i) => (
              <li key={policy.id}>
                <Link
                  to={`/policies/${policy.handle}`}
                  className="group flex items-center justify-between py-5 gap-4 transition-all duration-200"
                >
                  {/* Number + Title */}
                  <div className="flex items-center gap-5">
                    <span className="font-bold text-lg group-hover:translate-x-1 transition-transform duration-200 inline-block">
                      {policy.title}
                    </span>
                  </div>

                  {/* Arrow */}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all duration-200"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}

const POLICIES_QUERY = `#graphql
  fragment PolicyItem on ShopPolicy {
    id
    title
    handle
  }
  query Policies ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        ...PolicyItem
      }
      shippingPolicy {
        ...PolicyItem
      }
      termsOfService {
        ...PolicyItem
      }
      refundPolicy {
        ...PolicyItem
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
` as const;
