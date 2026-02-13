// app/routes/($locale)._index.tsx
import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale)._index';

import {Sections, SECTIONS_FRAGMENT} from '~/sections/Sections';

export const meta: Route.MetaFunction = ({data}) => {
  const title = data?.shop?.name
    ? `${data.shop.name} | Home`
    : 'Hydrogen Metaobject | Home';
  return [{title}];
};

export async function loader({context}: Route.LoaderArgs) {
  try {
    const data = await context.storefront.query(HOME_QUERY, {
      variables: {
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
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