import {useState, useEffect, useRef} from 'react';
import {Link, useLocation} from 'react-router';
import {SUPPORTED_LOCALES, getCurrentLocale} from '~/lib/i18n';
import type {LocaleEntry} from '~/lib/i18n';

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/**
 * Returns unique language labels in insertion order from SUPPORTED_LOCALES.
 * Adding a new locale to SUPPORTED_LOCALES is the only thing needed to make
 * a new language appear in the dropdown.
 */
function getUniqueLanguages(): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const locale of SUPPORTED_LOCALES) {
    if (!seen.has(locale.label)) {
      seen.add(locale.label);
      result.push(locale.label);
    }
  }
  return result;
}

/**
 * Computes the destination URL when the user switches to a target language.
 *
 * 1. Filters SUPPORTED_LOCALES to entries matching the target label.
 * 2. Prefers the entry whose country matches the current locale's country.
 * 3. Falls back to the first candidate (insertion order in SUPPORTED_LOCALES).
 * 4. Strips the current prefix from the path, then prepends the new prefix.
 *    If the new prefix is empty (default locale), the path is returned as-is.
 */
function getNewUrl(
  pathname: string,
  currentLocale: LocaleEntry,
  targetLabel: string,
): string {
  const candidates = SUPPORTED_LOCALES.filter((l) => l.label === targetLabel);
  const target =
    candidates.find((l) => l.country === currentLocale.country) ??
    candidates[0];

  const pathWithoutPrefix =
    currentLocale.pathPrefix !== ''
      ? pathname.slice(currentLocale.pathPrefix.length) || '/'
      : pathname;

  return target.pathPrefix !== ''
    ? `${target.pathPrefix}${pathWithoutPrefix}`
    : pathWithoutPrefix;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LanguageSwitcher() {
  const {pathname} = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLocale = getCurrentLocale(pathname);
  const uniqueLanguages = getUniqueLanguages();

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    function handleMouseDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="text-[13px] font-black border-b-2 border-black pb-0.5 leading-none uppercase"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select language"
      >
        {currentLocale.label}
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label="Language options"
          className="absolute right-0 top-full mt-2 bg-white border border-black min-w-[3rem] z-50"
        >
          {uniqueLanguages.map((lang) => {
            const newUrl = getNewUrl(pathname, currentLocale, lang);
            const isActive = lang === currentLocale.label;

            return (
              <li key={lang} role="option" aria-selected={isActive}>
                <Link
                  to={newUrl}
                  reloadDocument
                  onClick={() => setIsOpen(false)}
                  className={[
                    'block px-3 py-2 text-[13px] font-black uppercase leading-none no-underline',
                    'transition-colors hover:bg-black hover:text-white',
                    isActive ? 'opacity-40 pointer-events-none' : '',
                  ]
                    .join(' ')
                    .trim()}
                >
                  {lang}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
