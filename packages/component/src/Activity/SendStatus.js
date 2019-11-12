import { Constants } from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import ScreenReaderText from '../ScreenReaderText';
import useLocalize from '../hooks/useLocalize';
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

const SendStatus = ({ activity: { channelData: { state } = {} }, retrySend }) => {
  const [{ sendStatus: sendStatusStyleSet }] = useStyleSet();

  // TODO: [P4] Currently, this is the only place which use a templated string
  //       We could refactor this into a general component if there are more templated strings
  const localizedSending = useLocalize('Sending');
  const localizedSendStatus = useLocalize('SendStatus');
  const retryText = useLocalize('Retry');
  const sendFailedText = useLocalize('SEND_FAILED_KEY');

  const sendFailedRetryMatch = /\{Retry\}/u.exec(sendFailedText);

  return (
    <React.Fragment>
      <ScreenReaderText text={localizedSendStatus + localizedSending} />
      <span aria-hidden={true} className={sendStatusStyleSet}>
        {state === SENDING ? (
          localizedSending
        ) : state === SEND_FAILED ? (
          sendFailedRetryMatch ? (
            <React.Fragment>
              {sendFailedText.substr(0, sendFailedRetryMatch.index)}
              <button onClick={retrySend} type="button">
                {retryText}
              </button>
              {sendFailedText.substr(sendFailedRetryMatch.index + sendFailedRetryMatch[0].length)}
            </React.Fragment>
          ) : (
            <button onClick={retrySend} type="button">
              {sendFailedText}
            </button>
          )
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
      state: PropTypes.string
    })
  }).isRequired,
  retrySend: PropTypes.func.isRequired
};

export default connectSendStatus()(SendStatus);

export { connectSendStatus };
