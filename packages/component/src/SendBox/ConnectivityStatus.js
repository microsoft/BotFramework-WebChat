import React from 'react';

import connectToWebChat from '../connectToWebChat';
import { localize } from '../Localization/Localize';
import ErrorNotificationIcon from '../Attachment/Assets/ErrorNotificationIcon';
import WarningNotificationIcon from '../Attachment/Assets/WarningNotificationIcon';
import classnames from 'classnames';

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
  }) =>
    <div
      aria-live="polite"
      className={ classnames({
        [styleSet.errorNotification]: connectivityStatus === 'error',
        [styleSet.warningNotification]: connectivityStatus === 'connectingslow'
      }) }
      role="status"
    >
      {
        connectivityStatus === 'connectingslow' ?
          <React.Fragment>
            <WarningNotificationIcon />
            { localize('SLOW_CONNECTION_NOTIFICATION', language) }
          </React.Fragment>
        : connectivityStatus === 'error' &&
          <React.Fragment>
            <ErrorNotificationIcon />
            { localize('FAILED_CONNECTION_NOTIFICATION', language) }
          </React.Fragment>
      }
    </div>

)

export { connectConnectivityAlert }
