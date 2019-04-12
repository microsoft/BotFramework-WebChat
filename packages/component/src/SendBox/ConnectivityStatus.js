import React from 'react';

import connectToWebChat from '../connectToWebChat';
import { localize } from '../Localization/Localize';
import ErrorNotificationIcon from '../Attachment/Assets/ErrorNotificationIcon';
import SpinnerAnimation from '../Attachment/Assets/SpinnerAnimation';
import WarningNotificationIcon from '../Attachment/Assets/WarningNotificationIcon';
import classnames from 'classnames';

class connectConnectivityAlert extends React.Component {

  connectivityStatusText() {
    const { connectivityStatus: { status, timeoutCompleted }, language } = this.props;
    const { connectingSlow } = this.state;

    if ( this.timerId ) {
      clearTimeout( this.timerId );
    }

    if ( status === 'uninitialized' || ( status === 'connected' && timeoutCompleted === false && connectingSlow === false ) ) {
      if ( status === 'connected' ) {
        this.timerId = this.dispatchConnectivityTimeout();
        this.timerId = null;
      }
      return (
        <React.Fragment>
          <SpinnerAnimation />
          {localize( 'INITIAL_CONNECTION_NOTIFICATION', language )}
        </React.Fragment>
      );
    } else if ( status === 'reconnecting' || (status === 'reconnected' && timeoutCompleted === false && connectingSlow === false)) {
      if ( status === 'reconnected' ) {
        this.timerId = this.dispatchConnectivityTimeout();
        this.timerId = null;
      }
      return (
        <React.Fragment>
          <SpinnerAnimation />
          {localize( 'INTERRUPTED_CONNECTION_NOTIFICATION', language )}
        </React.Fragment>
      );
    } else if ( status === 'connectingslow' ) {
      return (
        <React.Fragment>
          <WarningNotificationIcon />
          {localize( 'SLOW_CONNECTION_NOTIFICATION', language )}
        </React.Fragment>
      );
    } else if ( status === 'error' ) {
      return (
        <React.Fragment>
          <ErrorNotificationIcon />
          {localize( 'FAILED_CONNECTION_NOTIFICATION', language )}
        </React.Fragment>
      );
    }
  }

  dispatchConnectivityTimeout() {
    setTimeout( () => {
      this.props.dispatch( { type: 'DIRECT_LINE/CONNECT_TIMEOUT_COMPLETE' } );
    }, 400 );
  }

  constructor( props ) {
    super( props );

    this.state = {
      connectivityStatus: props.connectivityStatus,
      connectingSlow: false,
      language: props.language,
      styleSet: props.styleSet,
    }
  }

  componentDidUpdate( props ) {
    const { connectivityStatus: { status } } = props;
    const { connectingSlow } = this.state

    if ( status === 'connectingslow' && connectingSlow === false ) {
      this.setState( () => ( { connectingSlow: true } ) );
    }
  }

  static getDerivedStateFromProps( props, state ) {
    if ( props !== state ) {
      state = {
        connectivityStatus: props.connectivityStatus,
        connectingSlow: false,
        language: props.language,
        styleSet: props.styleSet,
      }
    }
    return state;
  }

  render() {
    const { connectivityStatus, styleSet } = this.state;
    const { status } = connectivityStatus;
    return (
      <div
        aria-live="polite"
        className={classnames( {
          [ styleSet.errorNotification ]: ( status === 'error' ),
          [ styleSet.warningNotification ]: status === 'connectingslow' || status === 'reconnecting',
          [ styleSet.connectivityNotification ]: status === 'connected' || status === 'uninitialized' || status === 'reconnecting' || status === 'reconnected'
        } )}
        role="status"
      >
        {this.connectivityStatusText()}
      </div>
    );
  }
}

export default connectToWebChat(
  ( { connectivityStatus, language, styleSet } ) => ( { connectivityStatus, language, styleSet } )
)( connectConnectivityAlert )
