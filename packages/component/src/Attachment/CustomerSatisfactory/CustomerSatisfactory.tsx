import { parseTemplate } from 'url-template';
import { useRefFrom } from 'use-ref-from';
import { useStateWithRef } from 'use-state-with-ref';
import classNames from 'classnames';
import React, { type FormEventHandler, Fragment, useCallback } from 'react';

import { ActionStatusType } from '../../types/external/OrgSchema/ActionStatusType';
import { isValid, type RatingValue } from './private/RatingValue';
import { type EntryPoint } from '../../types/external/OrgSchema/EntryPoint';
import { type ReviewAction } from '../../types/external/OrgSchema/ReviewAction';
import { useStyleSet } from '../../hooks';
import Checkmark from './private/Checkmark';
import RovingTabIndexComposer from '../../providers/RovingTabIndex/RovingTabIndexComposer';
import StarBar from './private/StarBar';
import useFocus from '../../hooks/useFocus';
import useOpenURL from '../../hooks/internal/useOpenURL';
import useStrings from './private/useStrings';
import useUniqueId from '../../hooks/internal/useUniqueId';

declare global {
  interface URLSearchParams {
    entries(): Iterable<[string, string]>;
  }
}

// "target" must be set.
type SupportedReviewAction = ReviewAction & { target: EntryPoint | string };

type Props = Readonly<{ initialReviewAction: SupportedReviewAction }>;

const CustomerSatisfactory = ({ initialReviewAction }: Props) => {
  const [{ customerSatisfactoryAttachment: customerSatisfactoryAttachmentStyleSet }] = useStyleSet();
  const [reviewAction, setReviewAction, reviewActionRef] = useStateWithRef<SupportedReviewAction>(initialReviewAction);
  const { submitButtonText, submittedText } = useStrings();
  const focus = useFocus();
  const labelId = useUniqueId('webchat__customer-satisfactory');
  const openURL = useOpenURL();

  const markAsSubmitted = useCallback(
    () => setReviewAction(reviewAction => ({ ...reviewAction, actionStatus: ActionStatusType.CompletedActionStatus })),
    [setReviewAction]
  );
  const rawRatingValue = reviewAction.resultReview?.reviewRating?.ratingValue;
  const setRating = useCallback(
    (ratingValue: RatingValue) => {
      setReviewAction(reviewAction => ({
        ...reviewAction,
        resultReview: {
          ...(reviewAction.resultReview || { '@type': 'Review' }),
          reviewRating: {
            ...(reviewAction.resultReview?.reviewRating || { '@type': 'Rating' }),
            ratingValue
          }
        }
      }));
    },
    [setReviewAction]
  );
  const submitted = reviewAction.actionStatus === ActionStatusType.CompletedActionStatus;

  const ratingValue: RatingValue | undefined = isValid(rawRatingValue) ? rawRatingValue : undefined;

  const submissionDisabled = typeof ratingValue !== 'number' || submitted;

  const submissionDisabledRef = useRefFrom(submissionDisabled);

  const handleSubmit = useCallback<FormEventHandler>(
    event => {
      event.preventDefault();

      if (submissionDisabledRef.current) {
        return;
      }

      const { current: reviewAction } = reviewActionRef;

      try {
        // This is based from https://schema.org/docs/actions.html.
        let url: URL;

        if (typeof reviewAction.target === 'string') {
          url = new URL(reviewAction.target);
        } else {
          const ratingValueInput = reviewAction.resultReview?.reviewRating?.['ratingValue-input'];
          const urlTemplateInputs: Map<string, boolean | number | null | string> = new Map();

          // TODO: We should expand this to support many `*-input`.
          ratingValueInput?.valueName &&
            urlTemplateInputs.set(
              ratingValueInput.valueName,
              reviewAction?.resultReview?.reviewRating?.ratingValue || null
            );

          url = new URL(
            parseTemplate(reviewAction.target.urlTemplate).expand(Object.fromEntries(urlTemplateInputs.entries()))
          );
        }

        url && openURL(url);
      } catch (error) {
        console.error('botframework-webchat: Failed to send review action.', { error });
      }

      markAsSubmitted();
      focus('sendBox');
    },
    [focus, markAsSubmitted, openURL, reviewActionRef, submissionDisabledRef]
  );

  return (
    <form
      className={classNames(
        'webchat__customer-satisfactory',
        { 'webchat__customer-satisfactory--submitted': submitted },
        customerSatisfactoryAttachmentStyleSet
      )}
      onSubmit={handleSubmit}
    >
      <div aria-labelledby={labelId} className="webchat__customer-satisfactory__radio-group" role="radiogroup">
        {/* "id" is required for "aria-labelledby" */}
        {/* eslint-disable-next-line react/forbid-dom-props */}
        <p className="webchat__customer-satisfactory__label" id={labelId}>
          {initialReviewAction.description}
        </p>
        <RovingTabIndexComposer>
          <StarBar disabled={submitted} onChange={setRating} value={ratingValue} />
        </RovingTabIndexComposer>
      </div>
      <button
        aria-disabled={submissionDisabled}
        aria-pressed={submitted}
        className="webchat__customer-satisfactory__submit-button"
        // eslint-disable-next-line no-magic-numbers
        tabIndex={submissionDisabled ? -1 : undefined}
        type="submit"
      >
        <span className="webchat__customer-satisfactory__submit-button-text">
          {submitted ? (
            <Fragment>
              <Checkmark />
              {submittedText}
            </Fragment>
          ) : (
            submitButtonText
          )}
        </span>
      </button>
    </form>
  );
};

export default CustomerSatisfactory;
