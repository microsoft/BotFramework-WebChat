import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';

import { localize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';
import ErrorNotificationIcon from '../Attachment/Assets/ErrorNotificationIcon';
import ScreenReaderText from '../ScreenReaderText';
import SpinnerAnimation from '../Attachment/Assets/SpinnerAnimation';
import WarningNotificationIcon from '../Attachment/Assets/WarningNotificationIcon';

const CONNECTIVITY_STATUS_DEBOUNCE = 400;

const DebouncedConnectivityStatus = ({ interval, children: propsChildren }) => {
  const [children, setChildren] = useState(propsChildren);
  const [since, setSince] = useState(Date.now());

  useEffect(() => {
    const timeout = setTimeout(() => {
      setChildren(propsChildren);
      setSince(Date.now());
    }, Math.max(0, interval - Date.now() + since));

    return () => clearTimeout(timeout);
  }, [interval, propsChildren, setChildren, setSince, since]);

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

const ConnectivityStatus = ({ connectivityStatus, language, styleSet }) => {
  const renderConnectingSlow = useCallback(() => {
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
  }, [language, styleSet.warningNotification]);

  const renderNotConnected = useCallback(() => {
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
  }, [language, styleSet.errorNotification]);

  const renderUninitialized = useCallback(() => {
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
  }, [language, styleSet.connectivityNotification]);

  const renderReconnecting = useCallback(() => {
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
  }, [language, styleSet.connectivityNotification]);

  const renderSagaError = useCallback(() => {
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
  }, [language, styleSet.errorNotification]);

  const renderEmptyStatus = useCallback(
    () => <ScreenReaderText text={localize('CONNECTED_NOTIFICATION', language)} />,
    [language]
  );

  const renderStatus = useCallback(() => {
    if (connectivityStatus === 'connectingslow') {
      return renderConnectingSlow;
    } else if (connectivityStatus === 'error' || connectivityStatus === 'notconnected') {
      return renderNotConnected;
    } else if (connectivityStatus === 'uninitialized') {
      return renderUninitialized;
    } else if (connectivityStatus === 'reconnecting') {
      return renderReconnecting;
    } else if (connectivityStatus === 'sagaerror') {
      return renderSagaError;
    }
    return renderEmptyStatus;
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
  connectivityStatus: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  styleSet: PropTypes.shape({
    connectivityNotification: PropTypes.any.isRequired,
    errorNotification: PropTypes.any.isRequired,
    warningNotification: PropTypes.any.isRequired
  }).isRequired
};

export default connectConnectivityStatus(({ styleSet }) => ({ styleSet }))(ConnectivityStatus);
