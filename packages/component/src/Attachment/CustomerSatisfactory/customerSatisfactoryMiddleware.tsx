import { parse } from 'valibot';
import { type AttachmentMiddleware, type AttachmentForScreenReaderMiddleware } from 'botframework-webchat-api';
import React, { Fragment } from 'react';

import { isReviewAction, type ReviewAction } from '../../types/external/OrgSchema/ReviewAction';
import { type PropsOf } from '../../types/PropsOf';
import CustomerSatisfactory from './CustomerSatisfactory';
import CustomerSatisfactoryForScreenReader from './CustomerSatisfactoryForScreenReader';
import reviewActionSchema from './private/schema/reviewActionSchema';

type SupportedReviewAction = PropsOf<typeof CustomerSatisfactory>['initialReviewAction'];

const customerSatisfactoryMiddleware: AttachmentMiddleware =
  () =>
  next =>
  (...args) => {
    const [arg0] = args;

    if (arg0) {
      const {
        attachment: { content, contentType }
      } = arg0;

      if (contentType === 'application/ld+json' && isReviewAction(content)) {
        try {
          // TODO: Unsure why `@type` in valibot schema is marked as optional.
          const reviewAction = parse(reviewActionSchema, content) as SupportedReviewAction;

          return <CustomerSatisfactory initialReviewAction={reviewAction} />;
        } catch (error) {
          // TODO: We should use <ErrorBoundary>.
          console.error(`botframework-webchat: Failed to render ReviewAction.`, { error });

          return <Fragment />;
        }
      }
    }

    return next(...args);
  };

export default customerSatisfactoryMiddleware;

const forScreenReader: AttachmentForScreenReaderMiddleware =
  () =>
  next =>
  (...args) => {
    const [arg0] = args;

    if (arg0) {
      const {
        attachment: { content, contentType }
      } = arg0;

      if (contentType === 'application/ld+json' && isReviewAction(content)) {
        try {
          const reviewAction = parse(reviewActionSchema, content) as ReviewAction;

          return () => <CustomerSatisfactoryForScreenReader initialReviewAction={reviewAction} />;
        } catch (error) {
          // TODO: We should use <ErrorBoundary>.
          console.error(`botframework-webchat: Failed to render ReviewAction for screen reader.`, { error });

          return () => <Fragment />;
        }
      }
    }

    return next(...args);
  };

export { forScreenReader };
