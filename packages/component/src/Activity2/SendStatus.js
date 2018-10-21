import React from 'react';

import { Constants } from 'botframework-webchat-core';

import connectWithContext from '../connectWithContext';
import Localize, { localize } from '../Localization/Localize';

const { ActivityClientState: { SEND_FAILED, SENDING } } = Constants;

// TODO: [P4] Currently, this is the only place which use a templated string
//       We could refactor this into a general component if there are more templated strings
function sendFailed(language, replace) {
  const text = localize('Send failed, {retry}', language);
  const retry = localize('retry', language);
  const match = /\{retry\}/.exec(text);

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

class SendStatus extends React.Component {
  constructor(props) {
    super(props);

    this.handleRetryClick = this.handleRetryClick.bind(this);
  }

  handleRetryClick(evt) {
    evt.preventDefault();

    this.props.postActivity(this.props.activity);

    // After clicking on "retry", the button will be gone and focus will be lost (back to document.body)
    // We want to make sure the user stay inside Web Chat
    this.props.focusSendBox();
  }

  render() {
    const {
      activity: { channelData: { state } = {} },
      language,
      styleSet
    } = this.props;

    return (
      <span className={ styleSet.sendStatus }>
        {
          state === SENDING ?
            <Localize text="Sending" />
          : state === SEND_FAILED ?
            sendFailed(language, retry => <button onClick={ this.handleRetryClick } type="button">{ retry }</button>)
          :
            false
        }
      </span>
    );
  }
}

export default connectWithContext(
  ({
    focusSendBox,
    language,
    postActivity,
    styleSet
  }) => ({
    focusSendBox,
    language,
    postActivity,
    styleSet
  }),
)(SendStatus)
