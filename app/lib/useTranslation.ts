import {useLocation} from 'react-router';
import {getCurrentLocale} from '~/lib/i18n';
import en from '~/i18n/en.json';
import fr from '~/i18n/fr.json';
import it from '~/i18n/it.json';

type Messages = typeof en;

const localeMessages: Record<string, Messages> = {
  EN: en,
  FR: fr,
  IT: it,
};

export function useTranslation() {
  const {pathname} = useLocation();
  const {language} = getCurrentLocale(pathname);
  const messages = localeMessages[language] ?? en;

  function t(key: string): string {
    const keys = key.split('.');
    let value: unknown = messages;
    for (const k of keys) {
      if (typeof value === 'object' && value !== null) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    return typeof value === 'string' ? value : key;
  }

  return {t};
}
