import React from 'react';

import connectToWebChat from '../connectToWebChat';
import { localize } from '../Localization/Localize';
import ErrorNotificationIcon from '../Attachment/Assets/ErrorNotificationIcon';
import SpinnerAnimation from '../Attachment/Assets/SpinnerAnimation';
import WarningNotificationIcon from '../Attachment/Assets/WarningNotificationIcon';
import classNames from 'classnames';

class ConnectivityDebounce extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      renderConnectivity: props.renderConnectivity,
      since: Date.now()
    };
  }

  componentWillReceiveProps(nextProps) {
    const { debounce } = nextProps;
    if (
      debounce !== this.props.debounce
      || nextProps.renderConnectivity !== this.props.renderConnectivity
    ) {
      clearTimeout(this.timeout);

      this.timeout = setTimeout(() => {
        this.setState(() => ({
          renderConnectivity: nextProps.renderConnectivity,
          since: Date.now()
        }));
      }, Math.max(0, debounce - Date.now() + this.state.since ));
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

class ConnectConnectivityAlert extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      language: props.language,
      styleSet: props.styleSet,
      connectivityStatus: props.connectivityStatus
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({
      language: nextProps.language,
      styleSet: nextProps.styleSet,
      connectivityStatus: nextProps.connectivityStatus
    }));
  }

  render() {
    const { connectivityStatus, language, styleSet } = this.state;

    return (
      <div
        aria-live='polite'
        className={
          classNames( {
            [ styleSet.errorNotification ]:
              connectivityStatus === 'error'
              || connectivityStatus === 'notconnected',
            [ styleSet.warningNotification ]:
              connectivityStatus === 'connectingslow',
            [ styleSet.connectivityNotification ]:
              connectivityStatus === 'uninitialized'
              || connectivityStatus === 'connected'
              || connectivityStatus === 'reconnected'
              || connectivityStatus === 'reconnecting'

          } )
        }
        role='status'
      >
        <ConnectivityDebounce
          debounce={ (connectivityStatus === 'uninitialized') || (connectivityStatus === 'error') ? 0 : 400 }
          renderConnectivity={ () => {
            return (connectivityStatus === 'connectingslow') ?
              <React.Fragment>
                <WarningNotificationIcon />
                { localize('SLOW_CONNECTION_NOTIFICATION', language) }
              </React.Fragment>
            : (connectivityStatus === 'error' || connectivityStatus === 'notconnected') ?
              <React.Fragment>
                <ErrorNotificationIcon />
                { localize('FAILED_CONNECTION_NOTIFICATION', language) }
              </React.Fragment>
            : (connectivityStatus === 'uninitialized') ?
              <React.Fragment>
                <SpinnerAnimation />
                { localize('INITIAL_CONNECTION_NOTIFICATION', language) }
              </React.Fragment>
            : (connectivityStatus === 'reconnecting') ?
              <React.Fragment>
                <SpinnerAnimation />
                { localize('INTERRUPTED_CONNECTION_NOTIFICATION', language) }
              </React.Fragment>
            : false
          } }
        />
      </div>
    );
  }
}

export default connectToWebChat(
  ( { connectivityStatus, language, styleSet } ) => ( { connectivityStatus, language, styleSet } )
)( ConnectConnectivityAlert )
