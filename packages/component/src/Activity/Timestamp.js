import React from 'react';

import ActivityContext from './Context';
import Context from '../Context';
import TimeAgo from '../Utils/TimeAgo';

// TODO: Rename this to <Timestamp />
class Timestamp extends React.Component {
  constructor(props) {
    super(props);

    this.handleRetryClick = this.handleRetryClick.bind(this);
  }

  handleRetryClick(evt) {
    evt.preventDefault();

    this.props.postActivity(this.props.activity);
  }

  render() {
    const {
      activity: { channelData: { state } = {}, timestamp },
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
            <TimeAgo value={ timestamp } />
        }
      </span>
    );
  }
}

export default () =>
  <Context.Consumer>
    { ({ postActivity, styleSet }) =>
      <ActivityContext.Consumer>
        { ({ activity }) =>
          <Timestamp
            activity={ activity }
            postActivity={ postActivity }
            styleSet={ styleSet }
          />
        }
      </ActivityContext.Consumer>
    }
  </Context.Consumer>
