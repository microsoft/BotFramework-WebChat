import { Constants } from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import connectToWebChat from '../../../connectToWebChat';
import ScreenReaderText from '../../../ScreenReaderText';
import SendFailedRetry from './SendFailedRetry';
import useFocusSendBox from '../../../hooks/useFocusSendBox';
import useLocalize from '../../../hooks/useLocalize';
import usePostActivity from '../../../hooks/usePostActivity';
import useSendTimeoutForActivity from '../../../hooks/useSendTimeoutForActivity';
import useStyleSet from '../../../hooks/useStyleSet';
import useTimePast from './useTimePast';

const {
  ActivityClientState: { SEND_FAILED, SENDING, SENT }
} = Constants;

const connectSendStatus = (...selectors) =>
  connectToWebChat(
    ({ focusSendBox, language, postActivity }, { activity }) => ({
      language,
      retrySend: evt => {
        evt.preventDefault();

        postActivity(activity);

        // After clicking on "retry", the button will be gone and focus will be lost (back to document.body)
        // We want to make sure the user stay inside Web Chat
        focusSendBox();
      }
    }),
    ...selectors
  );

const SendStatus = ({ activity }) => {
  const [{ sendStatus: sendStatusStyleSet }] = useStyleSet();
  const focusSendBox = useFocusSendBox();
  const postActivity = usePostActivity();
  const sendTimeoutForActivity = useSendTimeoutForActivity();
  const sendTimeout = sendTimeoutForActivity(activity);

  // TODO: [P4] Currently, this is the only place which use a templated string
  //       We could refactor this into a general component if there are more templated strings
  const localizedSending = useLocalize('Sending');
  const localizedSendStatus = useLocalize('SendStatus');

  const handleRetryClick = useCallback(() => {
    postActivity(activity);

    // After clicking on "retry", the button will be gone and focus will be lost (back to document.body)
    // We want to make sure the user stay inside Web Chat
    focusSendBox();
  }, [activity, focusSendBox, postActivity]);

  const { channelData: { state } = {} } = activity;

  // We ignore SEND_FAILED from activity, instead, we derive it here based on styleOptions.sendTimeout
  const activitySent = state !== SENDING && state !== SEND_FAILED;
  const { clientTimestamp = 0 } = activity.channelData;
  const pastTimeout = useTimePast(new Date(clientTimestamp).getTime() + sendTimeout);
  const sendState = activitySent ? SENT : pastTimeout ? SEND_FAILED : SENDING;

  return (
    <React.Fragment>
      <ScreenReaderText text={localizedSendStatus + localizedSending} />
      <span aria-hidden={true} className={sendStatusStyleSet}>
        {sendState === SENDING ? (
          localizedSending
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
  }).isRequired
};

export default SendStatus;

export { connectSendStatus };
