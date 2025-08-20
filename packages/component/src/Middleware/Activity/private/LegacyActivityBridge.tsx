import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import {
  legacyActivityBridgeComponentPropsSchema,
  type LegacyActivityBridgeComponentProps
} from 'botframework-webchat-api/internal';
import React, { Fragment, memo, useContext, useMemo } from 'react';

import { LegacyActivityContext } from '../../ActivityGrouping/ui/LegacyActivityComposer';

function LegacyActivityBridge(props: LegacyActivityBridgeComponentProps) {
  const {
    hideTimestamp: hideTimestampFromProps,
    render,
    renderActivityStatus: renderActivityStatusFromProps,
    renderAvatar: renderAvatarFromProps,
    showCallout: showCalloutFromProps
  } = validateProps(legacyActivityBridgeComponentPropsSchema, props);

  const { hideTimestamp, renderActivityStatus, renderAttachment, renderAvatar, showCallout } =
    useContext(LegacyActivityContext);

  const children = useMemo(
    () =>
      render(renderAttachment, {
        hideTimestamp: typeof hideTimestampFromProps === 'undefined' ? hideTimestamp : hideTimestampFromProps,
        renderActivityStatus:
          typeof renderActivityStatusFromProps === 'undefined' ? renderActivityStatus : renderActivityStatusFromProps,
        renderAvatar: typeof renderAvatarFromProps === 'undefined' ? renderAvatar : renderAvatarFromProps,
        showCallout: typeof showCalloutFromProps === 'undefined' ? showCallout : showCalloutFromProps
      }),
    [
      hideTimestamp,
      hideTimestampFromProps,
      render,
      renderActivityStatus,
      renderActivityStatusFromProps,
      renderAttachment,
      renderAvatar,
      renderAvatarFromProps,
      showCallout,
      showCalloutFromProps
    ]
  );

  return <Fragment>{children}</Fragment>;
}

export default memo(LegacyActivityBridge);
