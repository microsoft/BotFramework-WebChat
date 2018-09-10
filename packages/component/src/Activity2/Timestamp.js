import { connect } from 'react-redux';
import React from 'react';

import String, { getString } from '../Languages/String';
import Context from '../Context';
import TimeAgo from '../Utils/TimeAgo';

// TODO: We could refactor this into a general component
function sendFailed(language, replace) {
  const text = getString('Send failed, {retry}', language);
  const retry = getString('retry', language);
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

class Timestamp extends React.Component {
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
      activity: { channelData: { state } = {}, timestamp },
      language,
      styleSet
    } = this.props;

    return (
      <span className={ styleSet.timestamp }>
        {
          state === 'sending' ?
            <String text="Sending" />
          : state === 'send failed' ?
            <React.Fragment>
              {
                sendFailed(language, retry => <button className="retry" onClick={ this.handleRetryClick } type="button">{ retry }</button>)
              }
            </React.Fragment>
          :
            <TimeAgo
              value={ timestamp }
            />
        }
      </span>
    );
  }
}

export default connect(({ settings: { language } }) => ({ language }))(props =>
  <Context.Consumer>
    { ({ focusSendBox, postActivity, styleSet }) =>
      <Timestamp
        { ...props }
        focusSendBox={ focusSendBox }
        postActivity={ postActivity }
        styleSet={ styleSet }
      />
    }
  </Context.Consumer>
)
