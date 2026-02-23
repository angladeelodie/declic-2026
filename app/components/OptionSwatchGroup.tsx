import {OptionSwatch} from './OptionSwatch';

type OptionSwatchGroupProps = {
  /** The option type, e.g. "color", "couleur", "size", "taille" */
  optionName: string;
  /** All available values for this option */
  values: string[];
  /** Currently selected value (null = none selected) */
  selected: string | null;
  /** Provide to make the group interactive; omit for display-only */
  onSelect?: (value: string) => void;
  /** 'row' (default) lays swatches out horizontally; 'column' stacks them */
  orientation?: 'row' | 'column';
  className?: string;
};

export function OptionSwatchGroup({
  optionName,
  values,
  selected,
  onSelect,
  orientation = 'row',
  className = '',
}: OptionSwatchGroupProps) {
  if (!values.length) return null;

  const dirCls =
    orientation === 'column'
      ? 'flex-col items-center'
      : 'flex-row flex-wrap';

  return (
    <div className={`flex ${dirCls} gap-3 shrink-0 ${className}`}>
      {values.map((value) =>
        onSelect ? (
          <OptionSwatch
            key={value}
            optionName={optionName}
            value={value}
            selected={selected === value}
            onClick={() => onSelect(value)}
          />
        ) : (
          <OptionSwatch
            key={value}
            optionName={optionName}
            value={value}
            selected={selected === value}
          />
        ),
      )}
    </div>
  );
}
