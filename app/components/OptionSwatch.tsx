import {Link} from 'react-router';

// ─── Color normalization ──────────────────────────────────────────────────────

const COLOR_MAP: Record<string, string> = {
  // English
  black: '#000000',
  white: '#ffffff',
  // French
  noir: '#000000',
  blanc: '#ffffff',
  // Italian (ready for when it is added)
  nero: '#000000',
  bianco: '#ffffff',
};

export function normalizeSwatchColor(name: string): string | null {
  const lower = name.toLowerCase().trim();
  if (COLOR_MAP[lower]) return COLOR_MAP[lower];
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(lower)) return lower;
  // Accept any value that looks like it could be a CSS color name (no spaces)
  return lower || null;
}

const COLOR_OPTION_NAMES = ['color', 'couleur'];

function isColorOption(optionName: string): boolean {
  return COLOR_OPTION_NAMES.includes(optionName.toLowerCase());
}

// ─── Shared classes ───────────────────────────────────────────────────────────

function outerCls(selected: boolean, disabled = false) {
  return [
    'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 overflow-hidden shrink-0',
    selected ? 'border-black scale-105' : 'border-gray-200 hover:border-gray-400',
    disabled ? 'opacity-20 cursor-not-allowed' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

// ─── Inner visual ─────────────────────────────────────────────────────────────

function SwatchInner({optionName, value}: {optionName: string; value: string}) {
  const color = isColorOption(optionName) ? normalizeSwatchColor(value) : null;

  if (color) {
    // p-0.5 gap creates the double-outline effect (outer border → gap → subtle inner ring → fill)
    return (
      <div className="w-full h-full p-0.5">
        <div
          className="w-full h-full rounded-full border border-black/5"
          style={{backgroundColor: color}}
        />
      </div>
    );
  }

  return (
    <span className="text-md text-metalite uppercase leading-none text-center">
      {value}
    </span>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

type OptionSwatchBaseProps = {
  optionName: string;
  value: string;
  selected?: boolean;
  disabled?: boolean;
};

type OptionSwatchButtonProps = OptionSwatchBaseProps & {
  onClick: () => void;
  to?: never;
};

type OptionSwatchLinkProps = OptionSwatchBaseProps & {
  to: string;
  replace?: boolean;
  preventScrollReset?: boolean;
  onClick?: never;
};

type OptionSwatchDisplayProps = OptionSwatchBaseProps & {
  onClick?: never;
  to?: never;
};

export type OptionSwatchProps =
  | OptionSwatchButtonProps
  | OptionSwatchLinkProps
  | OptionSwatchDisplayProps;

export function OptionSwatch(props: OptionSwatchProps) {
  const {optionName, value, selected = false, disabled = false} = props;
  const cls = outerCls(selected, disabled);

  if ('to' in props && props.to) {
    return (
      <Link
        to={props.to}
        replace={props.replace}
        preventScrollReset={props.preventScrollReset}
        className={cls}
        aria-label={value}
      >
        <SwatchInner optionName={optionName} value={value} />
      </Link>
    );
  }

  if ('onClick' in props && props.onClick) {
    return (
      <button
        type="button"
        onClick={props.onClick}
        disabled={disabled}
        className={cls}
        aria-label={value}
      >
        <SwatchInner optionName={optionName} value={value} />
      </button>
    );
  }

  // Display-only (e.g. cart line items showing selected options)
  return (
    <div className={cls} aria-label={value}>
      <SwatchInner optionName={optionName} value={value} />
    </div>
  );
}
