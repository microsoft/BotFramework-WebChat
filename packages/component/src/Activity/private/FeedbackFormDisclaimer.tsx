import React, { memo } from 'react';
import classNames from 'classnames';
import useStyleSet from '../../hooks/useStyleSet';
import { useRenderMarkdownAsHTML } from '../../hooks';

function FeedbackFormDisclaimer({ disclaimer }: Readonly<{ disclaimer?: string }>) {
  const [{ feedbackForm }] = useStyleSet();
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML('message activity');
  return disclaimer ? (
    renderMarkdownAsHTML ? (
      <span
        className={classNames('webchat__feedback-form__caption1', feedbackForm + '')}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: renderMarkdownAsHTML(disclaimer) }}
      />
    ) : (
      <span className={classNames('webchat__feedback-form__caption1', feedbackForm + '')}>{disclaimer}</span>
    )
  ) : null;
}

export default memo(FeedbackFormDisclaimer);
