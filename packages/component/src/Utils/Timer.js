import React from 'react';

export default class Timer extends React.Component {
  componentDidMount() {
    this.schedule(this.props.at);
  }

  componentWillReceiveProps(nextProps) {
    const { at } = this.props;
    const { at: nextAt } = nextProps;

    if (at !== nextAt) {
      this.schedule(nextAt);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  schedule(at) {
    clearTimeout(this.timeout);

    if (!isNaN(at)) {
      this.timeout = setTimeout(() => {
        const { onInterval } = this.props;

        onInterval && onInterval();
      }, Math.max(0, at - Date.now()));
    }
  }

  render() {
    return false;
  }
}
