import { useRefFrom } from 'use-ref-from';
import React, { useCallback } from 'react';

import { type RatingValue } from './RatingValue';
import StarButton from './StarButton';

type Props = Readonly<{
  disabled?: boolean | undefined;
  onChange?: (value: RatingValue) => void;
  value?: RatingValue | undefined;
}>;

const StarBar = ({ disabled, onChange, value }: Props) => {
  const onChangeRef = useRefFrom(onChange);

  const handleStarButtonClick = useCallback((rating: RatingValue) => onChangeRef.current?.(rating), [onChangeRef]);

  return (
    <div className="webchat__customer-satisfactory__star-bar">
      <StarButton checked={value && value >= 1} disabled={disabled} onClick={handleStarButtonClick} value={1} />
      {/* eslint-disable-next-line no-magic-numbers */}
      <StarButton checked={value && value >= 2} disabled={disabled} onClick={handleStarButtonClick} value={2} />
      {/* eslint-disable-next-line no-magic-numbers */}
      <StarButton checked={value && value >= 3} disabled={disabled} onClick={handleStarButtonClick} value={3} />
      {/* eslint-disable-next-line no-magic-numbers */}
      <StarButton checked={value && value >= 4} disabled={disabled} onClick={handleStarButtonClick} value={4} />
      {/* eslint-disable-next-line no-magic-numbers */}
      <StarButton checked={value && value >= 5} disabled={disabled} onClick={handleStarButtonClick} value={5} />
      <div className="webchat__customer-satisfactory__rating-value">{value}</div>
    </div>
  );
};

export default StarBar;
