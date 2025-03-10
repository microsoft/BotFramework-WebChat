import { useGetActivityByKey, useSendStatusByActivityKey, useTrackEvent } from '../../hooks';

import usePrevious from '../../hooks/internal/usePrevious';

type TelemetrySendStatusChangePayload = {
  clientActivityID?: string;
  hasAttachment?: 'true' | 'false';
  key: string;
  prevStatus?: 'sending' | 'send failed' | 'sent';
  status: 'sending' | 'send failed' | 'sent';
  type?: string;
};

const ActivitySendStatusTelemetryComposer = () => {
  const [activityToSendStatusMap] = useSendStatusByActivityKey();
  const prevActivityToSendStatusMap = usePrevious(activityToSendStatusMap);
  const getActivityByKey = useGetActivityByKey();
  const trackEvent = useTrackEvent();

  if (prevActivityToSendStatusMap) {
    for (const key of activityToSendStatusMap.keys()) {
      const status = activityToSendStatusMap.get(key);
      const prevStatus = prevActivityToSendStatusMap.get(key);

      // `status` is falsy if it is not an outgoing activity.
      // `prevStatus` is undefined or a valid status, if it is undefined, it is newly added
      // This telemetry data point only emit changes in outgoing activities.
      if (status && status !== prevStatus) {
        const activity = getActivityByKey(key);
        const clientActivityID = activity?.channelData.clientActivityID;
        const type = activity?.type;

        const telemetryPayload: TelemetrySendStatusChangePayload = {
          hasAttachment: activity?.type === 'message' && activity.attachments?.length > 0 ? 'true' : 'false',
          key,
          status,
          ...(clientActivityID ? { clientActivityID } : {}),
          ...(type ? { type } : {})
        };

        // Only add prevStatus if it is NOT null/undefined
        if (prevStatus) {
          telemetryPayload.prevStatus = prevStatus;
        }

        trackEvent('send-status:change', telemetryPayload);
      }
    }
  }

  return null;
};

export default ActivitySendStatusTelemetryComposer;
