import { Constants } from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import connectToWebChat from '../../../connectToWebChat';
import ScreenReaderText from '../../../ScreenReaderText';
import SendFailedRetry from './SendFailedRetry';
import useFocus from '../../../hooks/useFocus';
import useLocalizer from '../../../hooks/useLocalizer';
import usePostActivity from '../../../hooks/usePostActivity';
import useStyleSet from '../../../hooks/useStyleSet';

const {
  ActivityClientState: { SEND_FAILED, SENDING }
} = Constants;

const connectSendStatus = (...selectors) =>
  connectToWebChat(
    ({ focusSendBox, language, postActivity }, { activity }) => ({
      language,
      retrySend: evt => {
        evt.preventDefault();

        postActivity(activity);

        // After clicking on "retry", the button will be removed from the DOM and focus will be lost (back to document.body)
        // This ensures that focus will stay within Web Chat
        focusSendBox();
      }
    }),
    ...selectors
  );

const SendStatus = ({ activity, sendState }) => {
  const [{ sendStatus: sendStatusStyleSet }] = useStyleSet();
  const focus = useFocus();
  const localize = useLocalizer();
  const postActivity = usePostActivity();

  const sendingText = localize('ACTIVITY_STATUS_SEND_STATUS_ALT_SENDING');

  const label = localize('ACTIVITY_STATUS_SEND_STATUS_ALT', sendingText);

  const handleRetryClick = useCallback(() => {
    postActivity(activity);

    // After clicking on "retry", the button will be gone and focus will be lost (back to document.body)
    // We want to make sure the user stay inside Web Chat
    focus('sendBoxWithoutKeyboard');
  }, [activity, focus, postActivity]);

  return (
    <React.Fragment>
      <ScreenReaderText text={label} />
      <span aria-hidden={true} className={sendStatusStyleSet}>
        {sendState === SENDING ? (
          sendingText
        ) : sendState === SEND_FAILED ? (
          <SendFailedRetry onRetryClick={handleRetryClick} />
        ) : (
          false
        )}
      </span>
    </React.Fragment>
  );
};

SendStatus.propTypes = {
  activity: PropTypes.shape({
    channelData: PropTypes.shape({
      clientTimestamp: PropTypes.string,
      state: PropTypes.string
    })
  }).isRequired,
  sendState: PropTypes.oneOf([SENDING, SEND_FAILED]).isRequired
};

export default SendStatus;

export { connectSendStatus };
