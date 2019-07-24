/* eslint react/no-unsafe: off */

import PropTypes from 'prop-types';
import React from 'react';

export default class Timer extends React.Component {
  componentDidMount() {
    const { at } = this.props;

    this.schedule(at);
  }

  UNSAFE_componentWillReceiveProps({ at: nextAt }) {
    const { at } = this.props;

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

Timer.defaultProps = {
  onInterval: undefined
};

Timer.propTypes = {
  at: PropTypes.number.isRequired,
  onInterval: PropTypes.func
};
