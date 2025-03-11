import { getActivityLivestreamingMetadata, type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useCallback, useMemo, type ReactNode } from 'react';

import numberWithInfinity from '../../hooks/private/numberWithInfinity';
import usePonyfill from '../../hooks/usePonyfill';
import ActivityTypingContext, { ActivityTypingContextType } from './private/Context';
import useReduceActivities from './private/useReduceActivities';
import { type AllTyping } from './types/AllTyping';

type Props = Readonly<{ children?: ReactNode | undefined }>;

const ActivityTypingComposer = ({ children }: Props) => {
  const [{ Date }] = usePonyfill();

  const reducer = useCallback(
    (
      prevTypingState: ReadonlyMap<string, AllTyping> | undefined,
      activity: WebChatActivity
    ): ReadonlyMap<string, AllTyping> | undefined => {
      const {
        from,
        from: { id, role },
        type
      } = activity;

      const livestreamingMetadata = getActivityLivestreamingMetadata(activity);
      const typingState = new Map(prevTypingState);

      if (type === 'message' || livestreamingMetadata?.type === 'final activity') {
        // A normal message activity, or final activity (which could be "message" or "typing"), will remove the typing indicator.
        typingState.delete(id);
      } else if (type === 'typing' && (role === 'bot' || role === 'user')) {
        const currentTyping = typingState.get(id);
        // TODO: When we rework on types of DLActivity, we will make sure all activities has "webChat.receivedAt", this coalesces can be removed.
        const receivedAt = activity.channelData.webChat?.receivedAt || Date.now();

        typingState.set(id, {
          firstReceivedAt: currentTyping?.firstReceivedAt || receivedAt,
          lastActivityDuration: numberWithInfinity(activity.channelData.webChat?.styleOptions?.typingAnimationDuration),
          lastReceivedAt: receivedAt,
          name: from.name,
          role,
          type: livestreamingMetadata && livestreamingMetadata.type !== 'indicator only' ? 'livestream' : 'busy'
        });
      }

      return Object.freeze(typingState);
    },
    [Date]
  );

  const allTyping: ReadonlyMap<string, AllTyping> = useReduceActivities(reducer) || Object.freeze(new Map());

  const allTypingState = useMemo(() => Object.freeze([allTyping] as const), [allTyping]);

  const context = useMemo<ActivityTypingContextType>(() => ({ allTypingState }), [allTypingState]);

  return <ActivityTypingContext.Provider value={context}>{children}</ActivityTypingContext.Provider>;
};

ActivityTypingComposer.displayName = 'ActivityTypingComposer';

export default memo(ActivityTypingComposer);
