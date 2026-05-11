// app/routes/($locale)._index.tsx
import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale)._index';

import {Sections, SECTIONS_FRAGMENT} from '~/sections/Sections';

export const meta: Route.MetaFunction = ({data}) => {
  const title = `${data.shop.name}`;

  return [{title}];
};

export async function loader({context, params}: Route.LoaderArgs) {
  try {
    // Prefer language/country from the URL locale param when available
    // params.locale is the ($locale) dynamic segment (e.g. "FR-CH").
    const [languageFromParam, countryFromParam] = (
      params.locale ?? ''
    ).toUpperCase().split('-');

    const language = languageFromParam || context.storefront.i18n.language;
    const country = countryFromParam || context.storefront.i18n.country;

    const data = await context.storefront.query(HOME_QUERY, {
      variables: {
        country,
        language,
      },
    });

    if (!data?.shop) {
      console.error('No shop data returned from Shopify');
      return {shop: null};
    }

    return {shop: data.shop};
  } catch (error) {
    console.error('GraphQL Error:', error);
    return {shop: null};
  }
}

const HOME_QUERY = `#graphql
  query Home(
    $language: LanguageCode
    $country: CountryCode
  )
  @inContext(language: $language, country: $country) {
    shop {
      id
      name

      sections: metafield(namespace: "custom", key: "sections") {
        ...Sections
      }
    }
  }

  ${SECTIONS_FRAGMENT}
` as const;

export default function Homepage() {
  const {shop} = useLoaderData<typeof loader>();
  // console.log('shop', shop);

  return (
    <div className="home">
      {shop?.sections && <Sections sections={shop.sections} />}
    </div>
  );
}