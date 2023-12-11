import { useRefFrom } from 'use-ref-from';
import React, { useCallback } from 'react';

import { type RatingValue } from './RatingValue';
import { type ReviewAction } from '../../../types/external/OrgSchema/ReviewAction';
import StarButton from './StarButton';

type Props = Readonly<{
  disabled?: boolean | undefined;
  onChange?: (value: RatingValue) => void;
  reviewAction: ReviewAction;
  value?: RatingValue | undefined;
}>;

const StarBar = ({ disabled, onChange, reviewAction }: Props) => {
  const onChangeRef = useRefFrom(onChange);
  const rawValue = reviewAction.resultReview?.reviewRating?.ratingValue;
  const titles: [string, string, string, string, string] | undefined =
    reviewAction.resultReview?.reviewRating?.description;
  const value = typeof rawValue === 'number' ? rawValue : undefined;

  const handleStarButtonClick = useCallback((rating: RatingValue) => onChangeRef.current?.(rating), [onChangeRef]);

  return (
    <div className="webchat__customer-satisfactory__star-bar">
      <StarButton
        checked={value && value >= 1}
        disabled={disabled}
        onClick={handleStarButtonClick}
        title={titles?.[0]}
        value={1}
      />
      <StarButton
        // eslint-disable-next-line no-magic-numbers
        checked={value && value >= 2}
        disabled={disabled}
        onClick={handleStarButtonClick}
        title={titles?.[1]}
        value={2}
      />
      <StarButton
        // eslint-disable-next-line no-magic-numbers
        checked={value && value >= 3}
        disabled={disabled}
        onClick={handleStarButtonClick}
        // eslint-disable-next-line no-magic-numbers
        title={titles?.[2]}
        value={3}
      />
      <StarButton
        // eslint-disable-next-line no-magic-numbers
        checked={value && value >= 4}
        disabled={disabled}
        onClick={handleStarButtonClick}
        // eslint-disable-next-line no-magic-numbers
        title={titles?.[3]}
        value={4}
      />
      <StarButton
        // eslint-disable-next-line no-magic-numbers
        checked={value && value >= 5}
        disabled={disabled}
        onClick={handleStarButtonClick}
        // eslint-disable-next-line no-magic-numbers
        title={titles?.[4]}
        value={5}
      />
      <div className="webchat__customer-satisfactory__rating-value">{value}</div>
    </div>
  );
};

export default StarBar;
