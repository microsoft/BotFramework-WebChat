import { useRefFrom } from 'use-ref-from';
import React, { ReactEventHandler, useCallback } from 'react';

import { type RatingValue } from './RatingValue';
import Star from './Star';
import useItemRef from '../../../providers/RovingTabIndex/useItemRef';
import useStrings from './useStrings';

type Props = Readonly<{
  checked?: boolean | undefined;
  disabled?: boolean | undefined;
  onClick?: (index: RatingValue) => void;
  value: RatingValue;
}>;

const StarButton = ({ checked, disabled, onClick, value }: Props) => {
  const { getRatingAltText } = useStrings();
  const disabledRef = useRefFrom(disabled);
  const onClickRef = useRefFrom(onClick);
  const ratingRef = useRefFrom(value);
  const ref = useItemRef<HTMLButtonElement>(value - 1);

  const handleClickAndFocus = useCallback<ReactEventHandler>(
    event => {
      event.preventDefault();

      disabledRef.current || onClickRef.current?.(ratingRef.current);
    },
    [disabledRef, onClickRef, ratingRef]
  );

  return (
    <button
      aria-checked={checked || false}
      aria-disabled={disabled}
      aria-label={getRatingAltText(value)}
      className="webchat__customer-satisfactory__star-button"
      onClick={handleClickAndFocus}
      onFocus={handleClickAndFocus}
      ref={ref}
      role="radio"
      // "-1" for disabling TAB key.
      // eslint-disable-next-line no-magic-numbers
      tabIndex={disabled ? -1 : undefined}
      type="button"
    >
      <Star filled={checked} />
    </button>
  );
};

export default StarButton;
