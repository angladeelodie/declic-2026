import type {I18nBase} from '@shopify/hydrogen';

export interface I18nLocale extends I18nBase {
  pathPrefix: string;
}

// UI-layer extension — adds a display label for the language switcher.
// Kept separate from I18nLocale to avoid polluting the storefront i18n shape.
export interface LocaleEntry extends I18nLocale {
  label: string;
}

// Single source of truth for supported locales.
// Add a new entry here to make a new language appear in the switcher automatically.
export const SUPPORTED_LOCALES: LocaleEntry[] = [
  {language: 'EN', country: 'CH', pathPrefix: '',       label: 'EN'},
  {language: 'FR', country: 'CH', pathPrefix: '/FR-CH', label: 'FR'},
  {language: 'IT', country: 'CH', pathPrefix: '/IT-CH', label: 'IT'},
];

/**
 * Returns the current locale by matching the first URL path segment against
 * SUPPORTED_LOCALES. Falls back to the default locale (empty pathPrefix).
 */
export function getCurrentLocale(pathname: string): LocaleEntry {
  const firstPart = '/' + (pathname.split('/')[1] ?? '');
  const matched = SUPPORTED_LOCALES.find(
    (l) =>
      l.pathPrefix !== '' &&
      l.pathPrefix.toUpperCase() === firstPart.toUpperCase(),
  );
  return matched ?? SUPPORTED_LOCALES.find((l) => l.pathPrefix === '')!;
}

export function getLocaleFromRequest(request: Request): I18nLocale {
  const url = new URL(request.url);
  const firstPathPart = url.pathname.split('/')[1]?.toUpperCase() ?? '';

  type I18nFromUrl = [I18nLocale['language'], I18nLocale['country']];

  let pathPrefix = '';
  let [language, country]: I18nFromUrl = ['EN', 'CH'];

  if (/^[A-Z]{2}-[A-Z]{2}$/i.test(firstPathPart)) {
    pathPrefix = '/' + firstPathPart;
    [language, country] = firstPathPart.split('-') as I18nFromUrl;
  }

  return {language, country, pathPrefix};
}
