import React from 'react';

import { type ReviewAction } from '../../types/external/OrgSchema/ReviewAction';
import useStrings from './private/useStrings';
import useUniqueId from '../../hooks/internal/useUniqueId';

type Props = Readonly<{
  initialReviewAction: ReviewAction;
}>;

const CustomerSatisfactoryForScreenReader = ({ initialReviewAction }: Props) => {
  const { getRatingAltText, submitButtonText } = useStrings();
  const labelId = useUniqueId('webchat__customer-satisfactory');

  return (
    <article>
      <div aria-labelledby={labelId} role="radiogroup">
        {/* eslint-disable-next-line react/forbid-dom-props */}
        <p id={labelId}>{initialReviewAction.description}</p>
        <button aria-checked={false} aria-label={getRatingAltText(1)} role="radio" type="button" />
        {/* eslint-disable-next-line no-magic-numbers */}
        <button aria-checked={false} aria-label={getRatingAltText(2)} role="radio" type="button" />
        {/* eslint-disable-next-line no-magic-numbers */}
        <button aria-checked={false} aria-label={getRatingAltText(3)} role="radio" type="button" />
        {/* eslint-disable-next-line no-magic-numbers */}
        <button aria-checked={false} aria-label={getRatingAltText(4)} role="radio" type="button" />
        {/* eslint-disable-next-line no-magic-numbers */}
        <button aria-checked={false} aria-label={getRatingAltText(5)} role="radio" type="button" />
      </div>
      <input type="submit" value={submitButtonText} />
    </article>
  );
};

export default CustomerSatisfactoryForScreenReader;
