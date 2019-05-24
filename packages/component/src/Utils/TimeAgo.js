import PropTypes from 'prop-types';
import React from 'react';

import { localize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';
import Timer from './Timer';

const TIMER_INTERVAL = 60000;

function nextTimer(date) {
  const time = new Date(date).getTime();
  const now = Date.now();

  return time > now ? time : Math.ceil((now - time) / TIMER_INTERVAL) * TIMER_INTERVAL + time;
}

function getStateFromProps({ language, value }) {
  return {
    text: localize('X minutes ago', language, value),
    timer: nextTimer(value)
  };
}

class TimeAgo extends React.Component {
  constructor(props) {
    super(props);

    this.handleInterval = this.handleInterval.bind(this);

    this.state = getStateFromProps(props);
  }

  componentWillReceiveProps({ language, value }) {
    this.updateText({ language, value });
  }

  handleInterval() {
    const { language, value } = this.props;

    this.updateText({ language, value });
  }

  updateText({ language, value }) {
    this.setState(() => getStateFromProps({ language, value }));
  }

  render() {
    const { text, timer } = this.state;

    return (
      <React.Fragment>
        {text}
        <Timer at={timer} onInterval={this.handleInterval} />
      </React.Fragment>
    );
  }
}

TimeAgo.propTypes = {
  language: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired
};

export default connectToWebChat(({ language }) => ({ language }))(TimeAgo);
