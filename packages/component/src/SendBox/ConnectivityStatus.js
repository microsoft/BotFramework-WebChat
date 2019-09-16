import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';

import connectToWebChat from '../connectToWebChat';
import ErrorNotificationIcon from '../Attachment/Assets/ErrorNotificationIcon';
import ScreenReaderText from '../ScreenReaderText';
import SpinnerAnimation from '../Attachment/Assets/SpinnerAnimation';
import useConnectivityStatus from '../hooks/useConnectivityStatus';
import useLocalize from '../hooks/useLocalize';
import useStyleSet from '../hooks/useStyleSet';
import WarningNotificationIcon from '../Attachment/Assets/WarningNotificationIcon';

const CONNECTIVITY_STATUS_DEBOUNCE = 400;

const DebouncedConnectivityStatus = ({ interval, children: propsChildren }) => {
  const [children, setChildren] = useState(() => propsChildren);
  const [since, setSince] = useState(Date.now());

  const intervalBeforeSwitch = Math.max(0, interval - Date.now() + since);

  useEffect(() => {
    if (children === propsChildren) {
      return () => 0;
    }

    const timeout = setTimeout(() => {
      setChildren(() => propsChildren);
      setSince(Date.now());
    }, intervalBeforeSwitch);

    return () => clearTimeout(timeout);
  }, [children, intervalBeforeSwitch, propsChildren]);

  return typeof children === 'function' ? children() : false;
};

DebouncedConnectivityStatus.defaultProps = {
  children: undefined
};

DebouncedConnectivityStatus.propTypes = {
  children: PropTypes.any,
  interval: PropTypes.number.isRequired
};

const connectConnectivityStatus = (...selectors) => {
  console.warn(
    'Web Chat: connectConnectivityStatus() will be removed on or after 2021-09-27, please use useConnectivityStatus() instead.'
  );

  return connectToWebChat(({ connectivityStatus, language }) => ({ connectivityStatus, language }), ...selectors);
};

const ConnectivityStatus = () => {
  const [connectivityStatus] = useConnectivityStatus();

  const [
    {
      connectivityNotification: connectivityNotificationStyleSet,
      errorNotification: errorNotificationStyleSet,
      warningNotification: warningNotificationStyleSet
    }
  ] = useStyleSet();

  const connectingSlowText = useLocalize('SLOW_CONNECTION_NOTIFICATION');
  const renderConnectingSlow = useCallback(
    () => (
      <React.Fragment>
        <ScreenReaderText text={connectingSlowText} />
        <div aria-hidden={true} className={warningNotificationStyleSet}>
          <WarningNotificationIcon />
          {connectingSlowText}
        </div>
      </React.Fragment>
    ),
    [connectingSlowText, warningNotificationStyleSet]
  );

  const notConnectedText = useLocalize('FAILED_CONNECTION_NOTIFICATION');
  const renderNotConnected = useCallback(
    () => (
      <React.Fragment>
        <ScreenReaderText text={notConnectedText} />
        <div aria-hidden={true} className={errorNotificationStyleSet}>
          <ErrorNotificationIcon />
          {notConnectedText}
        </div>
      </React.Fragment>
    ),
    [notConnectedText, errorNotificationStyleSet]
  );

  const uninitializedText = useLocalize('INITIAL_CONNECTION_NOTIFICATION');
  const renderUninitialized = useCallback(
    () => (
      <React.Fragment>
        <ScreenReaderText text={uninitializedText} />
        <div aria-hidden={true} className={connectivityNotificationStyleSet}>
          <SpinnerAnimation />
          {uninitializedText}
        </div>
      </React.Fragment>
    ),
    [connectivityNotificationStyleSet, uninitializedText]
  );

  const reconnectingText = useLocalize('INTERRUPTED_CONNECTION_NOTIFICATION');
  const renderReconnecting = useCallback(
    () => (
      <React.Fragment>
        <ScreenReaderText text={reconnectingText} />
        <div aria-hidden={true} className={connectivityNotificationStyleSet}>
          <SpinnerAnimation />
          {reconnectingText}
        </div>
      </React.Fragment>
    ),
    [reconnectingText, connectivityNotificationStyleSet]
  );

  const sagaErrorText = useLocalize('RENDER_ERROR_NOTIFICATION');
  const renderSagaError = useCallback(
    () => (
      <React.Fragment>
        <ScreenReaderText text={sagaErrorText} />
        <div className={errorNotificationStyleSet}>
          <ErrorNotificationIcon />
          {sagaErrorText}
        </div>
      </React.Fragment>
    ),
    [sagaErrorText, errorNotificationStyleSet]
  );

  const emptyStatusText = useLocalize('CONNECTED_NOTIFICATION');
  const renderEmptyStatus = useCallback(() => <ScreenReaderText text={emptyStatusText} />, [emptyStatusText]);

  const renderStatus = useCallback(() => {
    if (connectivityStatus === 'connectingslow') {
      return renderConnectingSlow();
    } else if (connectivityStatus === 'error' || connectivityStatus === 'notconnected') {
      return renderNotConnected();
    } else if (connectivityStatus === 'uninitialized') {
      return renderUninitialized();
    } else if (connectivityStatus === 'reconnecting') {
      return renderReconnecting();
    } else if (connectivityStatus === 'sagaerror') {
      return renderSagaError();
    }

    return renderEmptyStatus();
  }, [
    connectivityStatus,
    renderConnectingSlow,
    renderEmptyStatus,
    renderNotConnected,
    renderReconnecting,
    renderSagaError,
    renderUninitialized
  ]);

  return (
    <div aria-atomic="false" aria-live="polite" role="status">
      <DebouncedConnectivityStatus
        interval={
          connectivityStatus === 'uninitialized' || connectivityStatus === 'error' ? 0 : CONNECTIVITY_STATUS_DEBOUNCE
        }
      >
        {renderStatus}
      </DebouncedConnectivityStatus>
    </div>
  );
};

export default ConnectivityStatus;

export { connectConnectivityStatus };
