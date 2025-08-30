import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { Fragment, memo, useMemo } from 'react';

import useCreateActivityStatusRenderer from '../hooks/useCreateActivityStatusRenderer';
import useCreateAvatarRenderer from '../hooks/useCreateAvatarRenderer';
import useRenderAttachment from '../hooks/useRenderAttachment';
import { legacyActivityBridgeComponentPropsSchema, type LegacyActivityBridgeComponentProps } from '../internal';
import { useLegacyActivityContext } from './LegacyActivityBridgeContext';

/**
 * This component is solely for `createActivityPolymiddlewareFromLegacy`.
 *
 * @param props Legacy activity middleware props, includes `hideTimestamp`, `renderActivityStatus`, `renderAvatar`, and `showCallout`.
 * @returns An activity node rendered using the `props.render()` of type `LegacyRenderFunction`.
 */
function LegacyActivityBridge(props: LegacyActivityBridgeComponentProps) {
  const {
    activity,
    hideTimestamp: hideTimestampFromProps,
    render,
    renderActivityStatus: renderActivityStatusFromProps,
    renderAvatar: renderAvatarFromProps,
    showCallout: showCalloutFromProps
  } = validateProps(legacyActivityBridgeComponentPropsSchema, props);

  // These props are only available when the activity is being rendered through <BasicTranscript>.
  // Otherwise, they will be false/undefined.
  const { hideTimestamp, showCallout } = useLegacyActivityContext();

  const createActivityStatusRenderer = useCreateActivityStatusRenderer();
  const renderAttachment = useRenderAttachment();
  const renderAvatarRaw = useCreateAvatarRenderer();

  const renderActivityStatus = useMemo(
    () => createActivityStatusRenderer(Object.freeze({ activity })),
    [activity, createActivityStatusRenderer]
  );
  const renderAvatar = useMemo(
    () => !!renderAvatarRaw && renderAvatarRaw(Object.freeze({ activity })),
    [activity, renderAvatarRaw]
  );

  const children = useMemo(
    () =>
      render(
        renderAttachment,
        Object.freeze({
          hideTimestamp: typeof hideTimestampFromProps === 'undefined' ? hideTimestamp : hideTimestampFromProps,
          renderActivityStatus:
            typeof renderActivityStatusFromProps === 'undefined' ? renderActivityStatus : renderActivityStatusFromProps,
          renderAvatar: typeof renderAvatarFromProps === 'undefined' ? renderAvatar : renderAvatarFromProps,
          showCallout: typeof showCalloutFromProps === 'undefined' ? showCallout : showCalloutFromProps
        })
      ),
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
