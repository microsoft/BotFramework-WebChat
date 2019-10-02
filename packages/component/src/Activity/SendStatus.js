import { Constants } from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React from 'react';

import { localize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';
import ScreenReaderText from '../ScreenReaderText';

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

const SendStatus = ({ activity: { channelData: { state } = {} }, language, retrySend, styleSet }) => {
  // TODO: [P4] Currently, this is the only place which use a templated string
  //       We could refactor this into a general component if there are more templated strings
  const localizedSending = localize('Sending', language);
  const localizedSendStatus = localize('SendStatus', language);
  const sendFailedText = localize('SEND_FAILED_KEY', language);
  const sendFailedRetryMatch = /\{Retry\}/u.exec(sendFailedText);

  return (
    <React.Fragment>
      <ScreenReaderText text={localizedSendStatus + localizedSending} />
      <span aria-hidden={true} className={styleSet.sendStatus}>
        {state === SENDING ? (
          localizedSending
        ) : state === SEND_FAILED ? (
          sendFailedRetryMatch ? (
            <React.Fragment>
              {sendFailedText.substr(0, sendFailedRetryMatch.index)}
              <button onClick={retrySend} type="button">
                {localize('Retry', language)}
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
  language: PropTypes.string.isRequired,
  retrySend: PropTypes.func.isRequired,
  styleSet: PropTypes.shape({
    sendStatus: PropTypes.any.isRequired
  }).isRequired
};

export default connectSendStatus(({ styleSet }) => ({ styleSet }))(SendStatus);

export { connectSendStatus };
