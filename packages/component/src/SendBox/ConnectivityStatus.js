import classNames from 'classnames';
import React from 'react';

import { localize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';
import ErrorNotificationIcon from '../Attachment/Assets/ErrorNotificationIcon';
import SpinnerAnimation from '../Attachment/Assets/SpinnerAnimation';
import WarningNotificationIcon from '../Attachment/Assets/WarningNotificationIcon';

class ConnectivityDebounce extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      renderConnectivity: props.children,
      since: Date.now()
    };
  }

  componentWillReceiveProps(nextProps) {
    const { children, debounce } = nextProps;

    if (
      children !== this.props.children
      || debounce !== this.props.debounce
    ) {
      clearTimeout(this.timeout);

      this.timeout = setTimeout(() => {
        this.setState(() => ({
          renderConnectivity: children,
          since: Date.now()
        }));
      }, Math.max(0, debounce - Date.now() + this.state.since));
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  render() {
    const { renderConnectivity } = this.state;

    return typeof renderConnectivity === 'function' ? renderConnectivity() : false;
  }
}

const connectConnectivityStatus = (...selectors) => connectToWebChat(
  ({ connectivityStatus, language }) => ({ connectivityStatus, language }),
  ...selectors
)

export default connectConnectivityStatus(
  ({ styleSet }) => ({ styleSet })
)(
  ({ connectivityStatus, language, styleSet }) =>
    <div
      aria-live="polite"
      className={
        classNames({
          [styleSet.errorNotification]:
            connectivityStatus === 'error'
            || connectivityStatus === 'notconnected',
          [styleSet.warningNotification]:
            connectivityStatus === 'connectingslow',
          [styleSet.connectivityNotification]:
            connectivityStatus === 'uninitialized'
            || connectivityStatus === 'connected'
            || connectivityStatus === 'reconnected'
            || connectivityStatus === 'reconnecting'
        })
      }
      role="status"
    >
      <ConnectivityDebounce
        debounce={ (connectivityStatus === 'uninitialized' || connectivityStatus === 'error') ? 0 : 400 }>
        { () =>
          connectivityStatus === 'connectingslow' ?
            <React.Fragment>
              <WarningNotificationIcon />
              { localize('SLOW_CONNECTION_NOTIFICATION', language) }
            </React.Fragment>
          : (connectivityStatus === 'error' || connectivityStatus === 'notconnected') ?
            <React.Fragment>
              <ErrorNotificationIcon />
              { localize('FAILED_CONNECTION_NOTIFICATION', language) }
            </React.Fragment>
          : connectivityStatus === 'uninitialized' ?
            <React.Fragment>
              <SpinnerAnimation />
              { localize('INITIAL_CONNECTION_NOTIFICATION', language) }
            </React.Fragment>
          : connectivityStatus === 'reconnecting' &&
            <React.Fragment>
              <SpinnerAnimation />
              { localize('INTERRUPTED_CONNECTION_NOTIFICATION', language) }
            </React.Fragment>
        }
      </ConnectivityDebounce>
    </div>
  )
