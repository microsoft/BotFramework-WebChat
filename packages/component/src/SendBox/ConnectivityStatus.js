/* eslint react/no-unsafe: off */

import PropTypes from 'prop-types';
import React from 'react';

import { localize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';
import ErrorNotificationIcon from '../Attachment/Assets/ErrorNotificationIcon';
import ScreenReaderText from '../ScreenReaderText';
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

  UNSAFE_componentWillReceiveProps(nextProps) {
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
  <div aria-atomic="false" aria-live="polite" role="status">
    <DebouncedConnectivityStatus
      interval={
        connectivityStatus === 'uninitialized' || connectivityStatus === 'error' ? 0 : CONNECTIVITY_STATUS_DEBOUNCE
      }
    >
      {() => {
        if (connectivityStatus === 'connectingslow') {
          const localizedText = localize('SLOW_CONNECTION_NOTIFICATION', language);

          return (
            <React.Fragment>
              <ScreenReaderText text={localizedText} />
              <div aria-hidden={true} className={styleSet.warningNotification}>
                <WarningNotificationIcon />
                {localizedText}
              </div>
            </React.Fragment>
          );
        } else if (connectivityStatus === 'error' || connectivityStatus === 'notconnected') {
          const localizedText = localize('FAILED_CONNECTION_NOTIFICATION', language);

          return (
            <React.Fragment>
              <ScreenReaderText text={localizedText} />
              <div aria-hidden={true} className={styleSet.errorNotification}>
                <ErrorNotificationIcon />
                {localizedText}
              </div>
            </React.Fragment>
          );
        } else if (connectivityStatus === 'uninitialized') {
          const localizedText = localize('INITIAL_CONNECTION_NOTIFICATION', language);

          return (
            <React.Fragment>
              <ScreenReaderText text={localizedText} />
              <div aria-hidden={true} className={styleSet.connectivityNotification}>
                <SpinnerAnimation />
                {localizedText}
              </div>
            </React.Fragment>
          );
        } else if (connectivityStatus === 'reconnecting') {
          const localizedText = localize('INTERRUPTED_CONNECTION_NOTIFICATION', language);

          return (
            <React.Fragment>
              <ScreenReaderText text={localizedText} />
              <div aria-hidden={true} className={styleSet.connectivityNotification}>
                <SpinnerAnimation />
                {localizedText}
              </div>
            </React.Fragment>
          );
        } else if (connectivityStatus === 'sagaerror') {
          const localizedText = localize('RENDER_ERROR_NOTIFICATION', language);

          return (
            <React.Fragment>
              <ScreenReaderText text={localizedText} />
              <div className={styleSet.errorNotification}>
                <ErrorNotificationIcon />
                {localizedText}
              </div>
            </React.Fragment>
          );
        }

        return <ScreenReaderText text={localize('CONNECTED_NOTIFICATION', language)} />;
      }}
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
