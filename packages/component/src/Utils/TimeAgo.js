import React from 'react';

import { localize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';
import Timer from './Timer';

function nextTimer(date) {
  const time = new Date(date).getTime();
  const now = Date.now();

  if (time > now) {
    return time;
  } else {
    return Math.ceil((now - time) / 60000) * 60000 + time;
  }
}

class TimeAgo extends React.Component {
  constructor(props) {
    super(props);

    this.handleInterval = this.handleInterval.bind(this);

    this.state = this.getStateFromProps(props);
  }

  componentWillReceiveProps(nextProps) {
    this.updateText(nextProps);
  }

  handleInterval() {
    this.updateText(this.props);
  }

  updateText(props) {
    this.setState(() => this.getStateFromProps(props));
  }

  getStateFromProps(props) {
    return {
      text: localize('X minutes ago', props.language, props.value),
      timer: nextTimer(props.value)
    };
  }

  render() {
    const { state } = this;

    return (
      <React.Fragment>
        { state.text }
        <Timer at={ state.timer } onInterval={ this.handleInterval } />
      </React.Fragment>
    );
  }
}

export default connectToWebChat(
  ({ language }) => ({ language })
)(TimeAgo)
