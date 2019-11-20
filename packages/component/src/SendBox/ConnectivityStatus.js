import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';

import connectToWebChat from '../connectToWebChat';
import ErrorNotificationIcon from '../Attachment/Assets/ErrorNotificationIcon';
import ScreenReaderText from '../ScreenReaderText';
import SpinnerAnimation from '../Attachment/Assets/SpinnerAnimation';
import useLocalize from '../hooks/useLocalize';
import useStyleSet from '../hooks/useStyleSet';
import WarningNotificationIcon from '../Attachment/Assets/WarningNotificationIcon';

const CONNECTIVITY_STATUS_DEBOUNCE = 400;

function setTimeoutSync(fn, interval) {
  if (interval > 0) {
    return setTimeout(fn, interval);
  }

  fn();
}

const DebouncedConnectivityStatus = ({ interval, children: propsChildren }) => {
  const [children, setChildren] = useState(() => propsChildren);
  const [since, setSince] = useState(Date.now());

  const intervalBeforeSwitch = Math.max(0, interval - Date.now() + since);

  useEffect(() => {
    if (children !== propsChildren) {
      const timeout = setTimeoutSync(() => {
        setChildren(() => propsChildren);
        setSince(Date.now());
      }, intervalBeforeSwitch);

      return () => clearTimeout(timeout);
    }
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

const connectConnectivityStatus = (...selectors) =>
  connectToWebChat(({ connectivityStatus, language }) => ({ connectivityStatus, language }), ...selectors);

const ConnectivityStatus = ({ connectivityStatus }) => {
  const [
    {
      connectivityNotification: connectivityNotificationStyleSet,
      errorNotification: errorNotificationStyleSet,
      warningNotification: warningNotificationStyleSet
    }
  ] = useStyleSet();

  const connectedNotificationText = useLocalize('CONNECTED_NOTIFICATION');
  const failedConnectionText = useLocalize('FAILED_CONNECTION_NOTIFICATION');
  const initialConnectionText = useLocalize('INITIAL_CONNECTION_NOTIFICATION');
  const interruptedConnectionText = useLocalize('INTERRUPTED_CONNECTION_NOTIFICATION');
  const renderErrorNotificationText = useLocalize('RENDER_ERROR_NOTIFICATION');
  const slowConnectionText = useLocalize('SLOW_CONNECTION_NOTIFICATION');

  const renderConnectingSlow = useCallback(
    () => (
      <React.Fragment>
        <ScreenReaderText text={slowConnectionText} />
        <div aria-hidden={true} className={warningNotificationStyleSet}>
          <WarningNotificationIcon />
          {slowConnectionText}
        </div>
      </React.Fragment>
    ),
    [slowConnectionText, warningNotificationStyleSet]
  );

  const renderNotConnected = useCallback(
    () => (
      <React.Fragment>
        <ScreenReaderText text={failedConnectionText} />
        <div aria-hidden={true} className={errorNotificationStyleSet}>
          <ErrorNotificationIcon />
          {failedConnectionText}
        </div>
      </React.Fragment>
    ),
    [errorNotificationStyleSet, failedConnectionText]
  );

  const renderUninitialized = useCallback(
    () => (
      <React.Fragment>
        <ScreenReaderText text={initialConnectionText} />
        <div aria-hidden={true} className={connectivityNotificationStyleSet}>
          <SpinnerAnimation />
          {initialConnectionText}
        </div>
      </React.Fragment>
    ),
    [connectivityNotificationStyleSet, initialConnectionText]
  );

  const renderReconnecting = useCallback(
    () => (
      <React.Fragment>
        <ScreenReaderText text={interruptedConnectionText} />
        <div aria-hidden={true} className={connectivityNotificationStyleSet}>
          <SpinnerAnimation />
          {interruptedConnectionText}
        </div>
      </React.Fragment>
    ),
    [connectivityNotificationStyleSet, interruptedConnectionText]
  );

  const renderSagaError = useCallback(
    () => (
      <React.Fragment>
        <ScreenReaderText text={renderErrorNotificationText} />
        <div className={errorNotificationStyleSet}>
          <ErrorNotificationIcon />
          {renderErrorNotificationText}
        </div>
      </React.Fragment>
    ),
    [errorNotificationStyleSet, renderErrorNotificationText]
  );

  const renderEmptyStatus = useCallback(() => <ScreenReaderText text={connectedNotificationText} />, [
    connectedNotificationText
  ]);

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

ConnectivityStatus.propTypes = {
  connectivityStatus: PropTypes.string.isRequired
};

export default connectConnectivityStatus()(ConnectivityStatus);
