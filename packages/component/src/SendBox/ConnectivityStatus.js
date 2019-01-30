import React from 'react';

import connectToWebChat from '../connectToWebChat';
import { localize } from '../Localization/Localize';
import ErrorNotificationIcon from '../Attachment/Assets/ErrorNotificationIcon';
import WarningNotificationIcon from '../Attachment/Assets/WarningNotificationIcon';

const connectConnectivityAlert = (...selectors) => connectToWebChat(
  ({ connectivityStatus, language }) => ({ connectivityStatus, language }),
  ...selectors
)

export default connectConnectivityAlert(
  ({ styleSet }) => ({ styleSet })
)(
  ({
    connectivityStatus,
    language,
    styleSet
  }) => {
    if (connectivityStatus === 'connectingslow') {
      return (
        <div className={ styleSet.warningNotification }>
          <WarningNotificationIcon />{ localize('SLOW_CONNECTION_NOTIFICATION', language) }
        </div>
      );
    } else if (connectivityStatus === 'error') {
      return (
        <div className={ styleSet.errorNotification }>
          <ErrorNotificationIcon />{ localize('FAILED_CONNECTION_NOTIFICATION', language) }
        </div>
      );
    } else {
      return false;
    }
  }
)

export { connectConnectivityAlert }
