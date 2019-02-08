import React from 'react';

import { Constants } from 'botframework-webchat-core';

import connectToWebChat from '../connectToWebChat';
import Localize, { localize } from '../Localization/Localize';

const { ActivityClientState: { SEND_FAILED, SENDING } } = Constants;

// TODO: [P4] Currently, this is the only place which use a templated string
//       We could refactor this into a general component if there are more templated strings
function sendFailed(language, replace) {
  const text = localize('SEND_FAILED_KEY', language);
  const retry = localize('Retry', language);
  const match = /\{Retry\}/.exec(text);

  if (match) {
    return (
      <React.Fragment>
        { text.substr(0, match.index) }
        { replace(retry) }
        { text.substr(match.index + match[0].length) }
      </React.Fragment>
    );
  } else {
    return text;
  }
}

const connectSendStatus = (...selectors) => connectToWebChat(
  ({
    focusSendBox,
    language,
    postActivity
  }, {
    activity
  }) => ({
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
)

export default connectSendStatus(
  ({ styleSet }) => ({ styleSet })
)(
  ({
    activity: { channelData: { state } = {} },
    language,
    retrySend,
    styleSet
  }) =>
    <span aria-live="polite" className={ styleSet.sendStatus }>
      {
        state === SENDING ?
          <Localize text="Sending" />
        : state === SEND_FAILED ?
          sendFailed(
            language,
            retry =>
              <button
                onClick={ retrySend }
                type="button"
              >
                { retry }
              </button>
          )
        :
          false
      }
    </span>
)

export { connectSendStatus }
