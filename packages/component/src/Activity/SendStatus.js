import { Constants } from 'botframework-webchat-core';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import connectToWebChat from '../connectToWebChat';
import ScreenReaderText from '../ScreenReaderText';
import Timestamp from './Timestamp';
import useFocusSendBox from '../hooks/useFocusSendBox';
import useLocalize from '../hooks/useLocalize';
import usePostActivity from '../hooks/usePostActivity';
import useStyleSet from '../hooks/useStyleSet';

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

        // After clicking on "retry", the button will be gone and focus will be lost (back to document.body)
        // We want to make sure the user stay inside Web Chat
        focusSendBox();
      }
    }),
    ...selectors
  );

const SendStatus = ({ activity, timestampClassName }) => {
  const [{ sendStatus: sendStatusStyleSet }] = useStyleSet();
  const focusSendBox = useFocusSendBox();
  const postActivity = usePostActivity();

  // TODO: [P4] Currently, this is the only place which use a templated string
  //       We could refactor this into a general component if there are more templated strings
  const localizedSending = useLocalize('Sending');
  const localizedSendStatus = useLocalize('SendStatus');
  const retryText = useLocalize('Retry');
  const sendFailedText = useLocalize('SEND_FAILED_KEY');

  const handleRetryClick = useCallback(
    evt => {
      evt.preventDefault();

      postActivity(activity);

      // After clicking on "retry", the button will be gone and focus will be lost (back to document.body)
      // We want to make sure the user stay inside Web Chat
      focusSendBox();
    },
    [activity, focusSendBox, postActivity]
  );

  const sendFailedRetryMatch = /\{Retry\}/u.exec(sendFailedText);
  const { channelData: { state } = {} } = activity;

  return state === SENDING || state === SEND_FAILED ? (
    <React.Fragment>
      <ScreenReaderText text={localizedSendStatus + localizedSending} />
      <span aria-hidden={true} className={sendStatusStyleSet}>
        {state === SENDING ? (
          localizedSending
        ) : state === SEND_FAILED ? (
          sendFailedRetryMatch ? (
            <React.Fragment>
              {sendFailedText.substr(0, sendFailedRetryMatch.index)}
              <button onClick={handleRetryClick} type="button">
                {retryText}
              </button>
              {sendFailedText.substr(sendFailedRetryMatch.index + sendFailedRetryMatch[0].length)}
            </React.Fragment>
          ) : (
            <button onClick={handleRetryClick} type="button">
              {sendFailedText}
            </button>
          )
        ) : (
          false
        )}
      </span>
    </React.Fragment>
  ) : (
    <Timestamp activity={activity} aria-hidden={true} className={classNames('timestamp', timestampClassName)} />
  );
};

SendStatus.propTypes = {
  activity: PropTypes.shape({
    channelData: PropTypes.shape({
      state: PropTypes.string
    })
  }).isRequired,
  timestampClassName: PropTypes.string.isRequired
};

export default SendStatus;

export { connectSendStatus };
