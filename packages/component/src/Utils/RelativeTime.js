/* eslint react/no-unsafe: off */

import PropTypes from 'prop-types';
import React from 'react';

import { getLocaleString, localize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';
import ScreenReaderText from '../ScreenReaderText';
import Timer from './Timer';

const TIMER_INTERVAL = 60000;

function nextTimer(date) {
  const time = new Date(date).getTime();
  const now = Date.now();

  return time > now ? time : now + TIMER_INTERVAL - ((now - time) % TIMER_INTERVAL);
}

function getStateFromProps({ language, value }) {
  return {
    text: localize('X minutes ago', language, value),
    timer: nextTimer(value)
  };
}

class RelativeTime extends React.Component {
  constructor(props) {
    super(props);

    this.handleInterval = this.handleInterval.bind(this);

    this.state = getStateFromProps(props);
  }

  UNSAFE_componentWillReceiveProps({ language, value }) {
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

    const { language, value } = this.props;

    const localizedSentAtTime = localize('SentAt', language) + getLocaleString(value, language);

    return (
      <React.Fragment>
        <ScreenReaderText text={localizedSentAtTime} />
        <span aria-hidden={true}>{text}</span>
        <Timer at={timer} onInterval={this.handleInterval} />
      </React.Fragment>
    );
  }
}

RelativeTime.propTypes = {
  language: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired
};

export default connectToWebChat(({ language }) => ({ language }))(RelativeTime);
