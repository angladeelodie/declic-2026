import {useLoaderData} from 'react-router';
import type {Route} from './+types/pages.$handle';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {Media} from '~/components/Media';

import {SECTIONS_FRAGMENT, Sections} from '~/sections/Sections';


export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Hydrogen | ${data?.page.title ?? ''}`}];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.handle,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.handle, data: page});

  return {
    page,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Page() {
  const {page} = useLoaderData<typeof loader>();
  console.log('Page data:', page);

  return (
    <div className="page">
      {/* <section
        className={`
          section-main
          grid-rows-[1fr]
          h-fit
        `}
      >
        <Media
          media={page.media.reference}
          aspectRatio="2/3"
          className="aspect-ratio-2/3 self-center col-span-6 md:col-start-2 md:col-span-4 md:col-start-2 lg:col-span-3 lg:col-start-2"
        />
        <div className="col-span-6 lg:col-span-6 lg:col-start-6 flex flex-col justify-center">
          <h1 className="text-title">{page.title}</h1>

          <div
            dangerouslySetInnerHTML={{__html: page.body}}
            className="columns-2 gap-4"
          />
        </div>
      </section> */}

      {/* Render metaobject sections chosen on the page metafield */}
      {page.sections && <Sections sections={page.sections} />}
    </div>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }

      media: metafield(namespace: "custom", key: "media") {
        key
        reference {
          ... on Metaobject {
            ...EditorialMediaMetaobject
          }
        }
      }

      # App-owned sections metafield (namespace defaults to $app)
      sections: metafield(namespace: "custom", key: "sections") {
        ...Sections
      }
    }
  }
  ${SECTIONS_FRAGMENT}
` as const;