import React from 'react';

import Timer from './Timer';

function ago(date, locale) {
  // TODO: HTML Intl does not support internationalization of time duration
  //       We need to allow user to pass their internationalization logic

  const now = Date.now();
  const delta = now - new Date(date).getTime();
  const deltaInMinutes = Math.floor(delta / 60000);
  const deltaInHours = Math.floor(delta / 3600000);

  if (deltaInMinutes < 1) {
    return 'Just now';
  } else if (deltaInMinutes === 1) {
    return 'A minute ago';
  } else if (deltaInHours < 1) {
    return `${ deltaInMinutes } minutes ago`;
  } else if (deltaInHours === 1) {
    return `An hour ago`;
  } else if (deltaInHours < 5) {
    return `${ deltaInHours } hours ago`;
  } else if (deltaInHours <= 24) {
    return `Today`;
  } else if (deltaInHours <= 48) {
    return `Yesterday`;
  } else {
    return new Intl.DateTimeFormat(locale).format(date);
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
      // TODO: We need to pass locale
      text: ago(props.value, props.language),
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
      // TODO: We need to pass locale
      text: ago(props.value, props.language),
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
