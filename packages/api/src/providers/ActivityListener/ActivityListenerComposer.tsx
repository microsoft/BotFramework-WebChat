import type { WebChatActivity } from 'botframework-webchat-core';
import { memo, useEffect, type ReactNode } from 'react';
import usePrevious from '../../hooks/internal/usePrevious';
import useActivities from '../../hooks/useActivities';
import { usePropagate } from './private/propagation';

type Props = Readonly<{ children?: ReactNode | undefined }>;

// Typings are preferred over defaultProps/propTypes.
// eslint-disable-next-line react/prop-types
const ActivityListenerComposer = memo(({ children }: Props) => {
  const [activities] = useActivities();
  const prevActivities = usePrevious(activities);
  const propagate = usePropagate();

  useEffect(() => {
    if (prevActivities !== activities) {
      const upserts: WebChatActivity[] = [];

      for (const activity of activities) {
        prevActivities.includes(activity) || upserts.push(activity);
      }

      propagate(Object.freeze(upserts));
    }
  }, [activities, prevActivities, propagate]);

  return children;
});

export default ActivityListenerComposer;
