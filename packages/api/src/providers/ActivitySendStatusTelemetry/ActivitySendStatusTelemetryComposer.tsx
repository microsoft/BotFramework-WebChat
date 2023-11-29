import { type ActivityKey } from '../../types/ActivityKey';
import lastOf from '../../utils/lastOf';
import useGetActivitiesByKey from '../../hooks/useGetActivitiesByKey';
import usePrevious from '../../hooks/internal/usePrevious';
import useSendStatusByActivityKey from '../../hooks/useSendStatusByActivityKey';
import useTrackEvent from '../../hooks/useTrackEvent';

type TelemetrySendStatusChangePayload = {
  clientActivityID?: string;
  hasAttachment?: 'true' | 'false';
  key: ActivityKey;
  prevStatus?: 'sending' | 'send failed' | 'sent';
  status: 'sending' | 'send failed' | 'sent';
  type?: string;
};

const ActivitySendStatusTelemetryComposer = () => {
  const [activityToSendStatusMap] = useSendStatusByActivityKey();
  const prevActivityToSendStatusMap = usePrevious(activityToSendStatusMap);
  const getActivitiesByKey = useGetActivitiesByKey();
  const trackEvent = useTrackEvent();

  if (prevActivityToSendStatusMap) {
    for (const key of activityToSendStatusMap.keys()) {
      const status = activityToSendStatusMap.get(key);
      const prevStatus = prevActivityToSendStatusMap.get(key);

      // `status` is falsy if it is not an outgoing activity.
      // `prevStatus` is undefined or a valid status, if it is undefined, it is newly added
      // This telemetry data point only emit changes in outgoing activities.
      if (status && status !== prevStatus) {
        const activity = lastOf(getActivitiesByKey(key));
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
