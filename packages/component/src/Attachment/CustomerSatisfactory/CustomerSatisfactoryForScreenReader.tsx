import React from 'react';

import { ActionStatusType } from '../../types/external/OrgSchema/ActionStatusType';
import { type ReviewAction } from '../../types/external/OrgSchema/ReviewAction';
import useStrings from './private/useStrings';
import useUniqueId from '../../hooks/internal/useUniqueId';

type Props = Readonly<{
  initialReviewAction: ReviewAction;
}>;

const CustomerSatisfactoryForScreenReader = ({ initialReviewAction }: Props) => {
  const { getRatingAltText, submitButtonText, submittedText } = useStrings();
  const labelId = useUniqueId('webchat__customer-satisfactory');
  const rawRatingValue = initialReviewAction.resultReview?.reviewRating?.ratingValue;
  const submitted = initialReviewAction.actionStatus === ActionStatusType.CompletedActionStatus;

  const value = typeof rawRatingValue === 'number' ? rawRatingValue : 0;

  return (
    <article>
      <div aria-labelledby={labelId} role="radiogroup">
        {/* eslint-disable-next-line react/forbid-dom-props */}
        <p id={labelId}>{initialReviewAction.description}</p>
        <button aria-checked={value >= 1} aria-label={getRatingAltText(1)} role="radio" tabIndex={-1} type="button" />
        {/* eslint-disable-next-line no-magic-numbers */}
        <button aria-checked={value >= 2} aria-label={getRatingAltText(2)} role="radio" tabIndex={-1} type="button" />
        {/* eslint-disable-next-line no-magic-numbers */}
        <button aria-checked={value >= 3} aria-label={getRatingAltText(3)} role="radio" tabIndex={-1} type="button" />
        {/* eslint-disable-next-line no-magic-numbers */}
        <button aria-checked={value >= 4} aria-label={getRatingAltText(4)} role="radio" tabIndex={-1} type="button" />
        {/* eslint-disable-next-line no-magic-numbers */}
        <button aria-checked={value >= 5} aria-label={getRatingAltText(5)} role="radio" tabIndex={-1} type="button" />
      </div>
      <button aria-disabled={value === 0 || submitted} aria-pressed={submitted} tabIndex={-1} type="submit">
        {submitted ? submittedText : submitButtonText}
      </button>
    </article>
  );
};

export default CustomerSatisfactoryForScreenReader;
