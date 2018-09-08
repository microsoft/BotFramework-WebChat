import { connect } from 'react-redux';
import React from 'react';

import Context from '../Context';
import TimeAgo from '../Utils/TimeAgo';

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
            'Sending'
          : state === 'send failed' ?
            <React.Fragment>
              Send failed, <button className="retry" onClick={ this.handleRetryClick } type="button">retry</button>
            </React.Fragment>
          :
            <TimeAgo
              language={ language }
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
