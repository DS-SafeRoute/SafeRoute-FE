import type { ComponentPropsWithoutRef, MouseEventHandler } from 'react';

import clsx from 'clsx';

import XIcon from '@assets/icons/ic-x.svg?react';

import * as styles from './FilterChip.css';

export type FilterChipProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: MouseEventHandler<HTMLButtonElement>;
  onRemove?: MouseEventHandler<HTMLButtonElement>;
  removeLabel?: string;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

const FilterChip = ({
  label,
  selected = false,
  disabled = false,
  onSelect,
  onRemove,
  removeLabel = 'Remove filter',
  className,
}: FilterChipProps) => {
  const isSelectable = Boolean(onSelect);
  const isRemovable = Boolean(onRemove);

  return (
    <div className={clsx(styles.chip({ selected, disabled }), className)}>
      {isSelectable ? (
        <button
          type="button"
          className={styles.label({ selected, interactive: true })}
          onClick={onSelect}
          disabled={disabled}
          aria-pressed={selected}
        >
          {label}
        </button>
      ) : (
        <span className={styles.label({ selected, interactive: false })}>{label}</span>
      )}

      {isRemovable ? (
        <button
          type="button"
          className={styles.removeButton}
          onClick={onRemove}
          disabled={disabled}
          aria-label={removeLabel}
        >
          <XIcon className={styles.icon} aria-hidden="true" focusable="false" />
        </button>
      ) : null}
    </div>
  );
};

export default FilterChip;
