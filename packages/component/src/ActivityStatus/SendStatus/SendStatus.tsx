import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-api';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import React, { memo, useCallback } from 'react';
import { any, literal, object, pipe, readonly, union, type InferInput } from 'valibot';

import useFocus from '../../hooks/useFocus';
import { SENDING, SEND_FAILED, SENT } from '../../types/internal/SendStatus';
import SendFailedRetry from './private/SendFailedRetry';

import styles from '../ActivityStatus.module.css';

const { useLocalizer, usePostActivity } = hooks;

const sendStatusPropsSchema = pipe(
  object({
    activity: any(),
    sendStatus: union([literal(SENDING), literal(SEND_FAILED), literal(SENT)])
  }),
  readonly()
);

type SendStatusProps = InferInput<typeof sendStatusPropsSchema>;

function SendStatus(props: SendStatusProps) {
  const { activity, sendStatus } = validateProps(sendStatusPropsSchema, props);

  const focus = useFocus();
  const localize = useLocalizer();
  const postActivity = usePostActivity();
  const classNames = useStyles(styles);

  const handleRetryClick = useCallback(() => {
    postActivity(activity);

    // After clicking on "retry", the button will be gone and focus will be lost (back to document.body)
    // We want to make sure the user stay inside Web Chat
    focus('sendBoxWithoutKeyboard');
  }, [activity, focus, postActivity]);
  const sendingText = localize('ACTIVITY_STATUS_SEND_STATUS_ALT_SENDING');

  return (
    <React.Fragment>
      <span className={classNames['activity-status']}>
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
}

export default memo(SendStatus);
export { sendStatusPropsSchema, type SendStatusProps };
