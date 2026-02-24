import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {SUPPORTED_LOCALES} from '~/lib/i18n';

export async function loader({params}: LoaderFunctionArgs) {
  // If a locale param is present, validate it against the supported locales list.
  // This avoids relying on context.storefront.i18n, which can be stale during
  // client-side navigation (root loader has shouldRevalidate: false).
  if (params.locale) {
    const isValid = SUPPORTED_LOCALES.some(
      (l) =>
        l.pathPrefix !== '' &&
        l.pathPrefix.slice(1).toLowerCase() === params.locale!.toLowerCase(),
    );
    if (!isValid) {
      throw new Response(null, {status: 404});
    }
  }

  return null;
}
