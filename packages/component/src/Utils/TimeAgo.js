import React from 'react';

import Timer from './Timer';

function ago(date) {
  // We need to use HTML.Intl to create this

  const now = Date.now();
  const delta = now - new Date(date).getTime();
  const deltaInMinutes = Math.floor(delta / 60000);

  if (deltaInMinutes < 1) {
    return 'Just now';
  } else if (deltaInMinutes === 1) {
    return 'A minute ago';
  } else {
    return `${ deltaInMinutes } minutes ago`;
  }
}

function nextTimer(date) {
  const time = new Date(date).getTime();
  const now = Date.now();

  if (time > now) {
    return time;
  } else {
    return Math.ceil((now - time) / 60000) * 60000 + time;
  }
}

export default class TimeAgo extends React.Component {
  constructor(props) {
    super(props);

    this.handleInterval = this.handleInterval.bind(this);

    this.state = {
      text: ago(props.value),
      timer: nextTimer(props.value)
    }
  }

  componentWillReceiveProps(nextProps) {
    this.updateText(nextProps);
  }

  handleInterval() {
    this.updateText(this.props);
  }

  updateText(props) {
    this.setState(() => ({
      text: ago(props.value),
      timer: nextTimer(props.value)
    }));
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
