export const STYLE_MAP: Record<number, string> = {
  0: 'rounded-[var(--radius-sharp)]',
  1: 'rounded-[var(--radius-sharp)_var(--radius-round)_var(--radius-round)_var(--radius-round)]',
  2: 'rounded-[var(--radius-round)_var(--radius-sharp)_var(--radius-round)_var(--radius-round)]',
  3: 'rounded-[var(--radius-round)_var(--radius-round)_var(--radius-sharp)_var(--radius-round)]',
  4: 'rounded-[var(--radius-round)_var(--radius-round)_var(--radius-round)_var(--radius-sharp)]',
  5: 'rounded-[var(--radius-sharp)_var(--radius-round)_var(--radius-sharp)_var(--radius-round)]',
  6: 'rounded-[var(--radius-round)_var(--radius-sharp)_var(--radius-round)_var(--radius-sharp)]',
};

export const STYLE_MAP_LENGTH = Object.keys(STYLE_MAP).length;
