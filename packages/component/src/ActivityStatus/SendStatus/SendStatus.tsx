import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { type WebChatActivity } from 'botframework-webchat-core';

import { SENDING, SEND_FAILED, SENT } from '../../types/internal/SendStatus';
import SendFailedRetry from './private/SendFailedRetry';
import useFocus from '../../hooks/useFocus';
import useStyleSet from '../../hooks/useStyleSet';

import { type SendStatus as SendStatusType } from '../../types/internal/SendStatus';

const { useLocalizer, usePostActivity } = hooks;

type SendStatusProps = Readonly<{
  activity: WebChatActivity;
  sendStatus: SendStatusType;
}>;

const SendStatus = ({ activity, sendStatus }: SendStatusProps) => {
  const [{ sendStatus: sendStatusStyleSet }] = useStyleSet();
  const focus = useFocus();
  const localize = useLocalizer();
  const postActivity = usePostActivity();

  const handleRetryClick = useCallback(() => {
    postActivity(activity);

    // After clicking on "retry", the button will be gone and focus will be lost (back to document.body)
    // We want to make sure the user stay inside Web Chat
    focus('sendBoxWithoutKeyboard');
  }, [activity, focus, postActivity]);
  const sendingText = localize('ACTIVITY_STATUS_SEND_STATUS_ALT_SENDING');

  return (
    <React.Fragment>
      <span className={classNames('webchat__activity-status', 'webchat__activity-status--sending', sendStatusStyleSet)}>
        {sendStatus === SENDING ? (
          sendingText
        ) : sendStatus === SEND_FAILED ? (
          <SendFailedRetry onRetryClick={handleRetryClick} />
        ) : (
          false
        )}
      </span>
    </React.Fragment>
  );
};

SendStatus.propTypes = {
  activity: PropTypes.any.isRequired,
  // PropTypes cannot fully capture TypeScript types.
  // @ts-ignore
  sendStatus: PropTypes.oneOf([SENDING, SEND_FAILED, SENT]).isRequired
};

export default SendStatus;
