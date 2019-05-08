/* eslint class-methods-use-this: ["error", { "exceptMethods": ["getStateFromProps"] }] */

import React from 'react';

import { localize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';
import Timer from './Timer';

function nextTimer(date) {
  const time = new Date(date).getTime();
  const now = Date.now();

  return time > now ? time : Math.ceil((now - time) / 60000) * 60000 + time;
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

  getStateFromProps({ language, value }) {
    return {
      text: localize('X minutes ago', language, value),
      timer: nextTimer(value)
    };
  }

  render() {
    const { state } = this;

    return (
      <>
        { state.text }
        <Timer at={ state.timer } onInterval={ this.handleInterval } />
      </>
    );
  }
}

export default connectToWebChat(
  ({ language }) => ({ language })
)(TimeAgo)
