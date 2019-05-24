import PropTypes from 'prop-types';
import React from 'react';

import { localize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';
import ErrorNotificationIcon from '../Attachment/Assets/ErrorNotificationIcon';
import SpinnerAnimation from '../Attachment/Assets/SpinnerAnimation';
import WarningNotificationIcon from '../Attachment/Assets/WarningNotificationIcon';

const CONNECTIVITY_STATUS_DEBOUNCE = 400;

class DebouncedConnectivityStatus extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      children: props.children,
      since: Date.now()
    };
  }

  componentWillReceiveProps(nextProps) {
    const { children, interval } = this.props;
    const { children: nextChildren, interval: nextInterval } = nextProps;
    const { since } = this.state;

    if (nextChildren !== children || nextInterval !== interval) {
      clearTimeout(this.timeout);

      this.timeout = setTimeout(() => {
        this.setState(() => ({
          children: nextChildren,
          since: Date.now()
        }));
      }, Math.max(0, nextInterval - Date.now() + since));
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  render() {
    const { children } = this.state;

    return typeof children === 'function' ? children() : false;
  }
}

DebouncedConnectivityStatus.defaultProps = {
  children: undefined
};

DebouncedConnectivityStatus.propTypes = {
  children: PropTypes.any,
  interval: PropTypes.number.isRequired
};

const connectConnectivityStatus = (...selectors) =>
  connectToWebChat(({ connectivityStatus, language }) => ({ connectivityStatus, language }), ...selectors);

const ConnectivityStatus = ({ connectivityStatus, language, styleSet }) => (
  <div aria-live="polite" role="status">
    <DebouncedConnectivityStatus
      interval={
        connectivityStatus === 'uninitialized' || connectivityStatus === 'error' ? 0 : CONNECTIVITY_STATUS_DEBOUNCE
      }
    >
      {() =>
        connectivityStatus === 'connectingslow' ? (
          <div className={styleSet.warningNotification}>
            <WarningNotificationIcon />
            {localize('SLOW_CONNECTION_NOTIFICATION', language)}
          </div>
        ) : connectivityStatus === 'error' || connectivityStatus === 'notconnected' ? (
          <div className={styleSet.errorNotification}>
            <ErrorNotificationIcon />
            {localize('FAILED_CONNECTION_NOTIFICATION', language)}
          </div>
        ) : connectivityStatus === 'uninitialized' ? (
          <div className={styleSet.connectivityNotification}>
            <SpinnerAnimation />
            {localize('INITIAL_CONNECTION_NOTIFICATION', language)}
          </div>
        ) : connectivityStatus === 'reconnecting' ? (
          <div className={styleSet.connectivityNotification}>
            <SpinnerAnimation />
            {localize('INTERRUPTED_CONNECTION_NOTIFICATION', language)}
          </div>
        ) : connectivityStatus === 'sagaerror' ? (
          <div className={styleSet.errorNotification}>
            <ErrorNotificationIcon />
            {localize('RENDER_ERROR_NOTIFICATION', language)}
          </div>
        ) : (
          connectivityStatus === 'reconnected' || (connectivityStatus === 'connected' && false)
        )
      }
    </DebouncedConnectivityStatus>
  </div>
);

ConnectivityStatus.propTypes = {
  connectivityStatus: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  styleSet: PropTypes.shape({
    connectivityNotification: PropTypes.any.isRequired,
    errorNotification: PropTypes.any.isRequired,
    warningNotification: PropTypes.any.isRequired
  }).isRequired
};

export default connectConnectivityStatus(({ styleSet }) => ({ styleSet }))(ConnectivityStatus);
