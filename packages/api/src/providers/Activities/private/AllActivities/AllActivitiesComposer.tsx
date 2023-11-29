import {
  type DirectLineActivity,
  type DirectLineJSBotConnection,
  type Observable,
  type WebChatActivity
} from 'botframework-webchat-core';
import React, { memo, type PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';

import ActivitiesComposerContext from './private/Context';
import createRectifyActivityFactory from './private/patchActivity';
import patchSendStatus from './private/patchSendStatus';
import prepareUserId from './private/prepareUserId';

type Props = PropsWithChildren<{
  readonly directLine: DirectLineJSBotConnection;
  // eslint-disable-next-line react/require-default-props
  readonly initialUserId?: string;
}>;

// TODO: We should move this component outside of Web Chat. We should only send `activities`, `postActivity` as props to Web Chat.
const AllActivitiesComposer = memo(({ children, directLine, initialUserId }: Props) => {
  const [activities, setActivities] = useState<readonly Readonly<WebChatActivity>[]>(Object.freeze([]));
  const initialUserIdRef = useRef(initialUserId);

  useEffect(() => {
    // Should move this logic to DirectLineJS.
    const rectifiedUserId = prepareUserId(directLine, initialUserIdRef.current);

    const rectifyActivity = createRectifyActivityFactory(rectifiedUserId);

    const subscription = (directLine.activity$ as Observable<DirectLineActivity>).subscribe({
      next(activity: DirectLineActivity) {
        // TODO: Sort.
        // sequence-id
        // timestamp
        // replyToId
        setActivities(activities =>
          Object.freeze([...activities, patchSendStatus(activities, rectifyActivity(activity))])
        );
      }
    });

    return () => subscription.unsubscribe();
  }, [directLine, initialUserIdRef, setActivities]);

  // const [messageActivities, recentTypingActivities] = useMemo(() => {
  //   const recentTypingActivities = new Map<string, Readonly<WebChatActivity>>();
  //   const messageActivities: WebChatActivity[] = [];

  //   for (const activity of activities) {
  //     const { type } = activity;

  //     if (type === 'message') {
  //       messageActivities.push(activity);
  //     } else if (type === 'typing') {
  //       recentTypingActivities.set(activity.from.id, activity);
  //     }
  //   }

  //   return [messageActivities, Object.freeze(recentTypingActivities)];
  // }, [activities]);

  const context = useMemo(
    () => ({
      activitiesState: Object.freeze([
        // TODO: We should not append typing activities after message activities. We should have the typing activity in correct order.
        // Object.freeze([...messageActivities, ...recentTypingActivities.values()] as const)
        activities
      ] as const)
      // recentTypingActivitiesState: Object.freeze([recentTypingActivities] as const)
    }),
    // [messageActivities, recentTypingActivities]
    [activities]
  );

  return <ActivitiesComposerContext.Provider value={context}>{children}</ActivitiesComposerContext.Provider>;
});

AllActivitiesComposer.displayName = 'AllActivitiesComposer';

export default AllActivitiesComposer;
