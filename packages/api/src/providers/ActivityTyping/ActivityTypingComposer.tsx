import { getActivityLivestreamingMetadata, type WebChatActivity } from 'botframework-webchat-core';
import { queryReceivedAtFromActivity } from 'botframework-webchat-core/activity';
import { iteratorFind } from 'iter-fest';
import React, { memo, useCallback, useMemo, type ReactNode } from 'react';

import numberWithInfinity from '../../hooks/private/numberWithInfinity';
import usePonyfill from '../../hooks/usePonyfill';
import ActivityTypingContext, { ActivityTypingContextType } from './private/Context';
import useReduceActivities from './private/useReduceActivities';
import { type AllTyping } from './types/AllTyping';

type Entry = {
  livestreamActivities: Map<
    string,
    {
      activity: WebChatActivity;
      contentful: boolean;
      firstReceivedAt: number;
      lastReceivedAt: number;
    }
  >;
  name: string | undefined;
  role: 'bot' | 'user';
  typingIndicator:
    | {
        activity: WebChatActivity;
        duration: number;
        firstReceivedAt: number;
        lastReceivedAt: number;
      }
    | undefined;
};

type Props = Readonly<{ children?: ReactNode | undefined }>;

const ActivityTypingComposer = ({ children }: Props) => {
  const [{ Date }] = usePonyfill();

  const reducer = useCallback(
    (
      prevTypingState: ReadonlyMap<string, Readonly<Entry>> | undefined,
      activity: WebChatActivity
    ): ReadonlyMap<string, Readonly<Entry>> | undefined => {
      const {
        from: { id, name, role },
        type
      } = activity;

      if (role === 'channel') {
        return prevTypingState;
      }

      // A normal message activity, or final activity (which could be "message" or "typing"), will remove the typing indicator.
      const receivedAt = queryReceivedAtFromActivity(activity) ?? Date.now();

      const livestreamingMetadata = getActivityLivestreamingMetadata(activity);
      const typingState = new Map(prevTypingState);
      const existingEntry = typingState.get(id);
      const mutableEntry: Entry = {
        typingIndicator: undefined,
        ...existingEntry,
        livestreamActivities: new Map(existingEntry?.livestreamActivities),
        name,
        role
      };

      if (livestreamingMetadata) {
        mutableEntry.typingIndicator = undefined;

        const { sessionId } = livestreamingMetadata;

        if (livestreamingMetadata.type === 'final activity') {
          mutableEntry.livestreamActivities.delete(sessionId);
        } else {
          mutableEntry.livestreamActivities.set(
            sessionId,
            Object.freeze({
              firstReceivedAt: mutableEntry.livestreamActivities.get(sessionId)?.firstReceivedAt || receivedAt,
              ...mutableEntry.livestreamActivities.get(sessionId),
              activity,
              contentful: livestreamingMetadata.type !== 'contentless',
              lastReceivedAt: receivedAt
            })
          );
        }
      } else if (type === 'message') {
        mutableEntry.typingIndicator = undefined;
      } else if (type === 'typing') {
        mutableEntry.typingIndicator = Object.freeze({
          activity,
          duration: numberWithInfinity(activity.channelData.webChat?.styleOptions?.typingAnimationDuration),
          firstReceivedAt: mutableEntry.typingIndicator?.firstReceivedAt || receivedAt,
          lastReceivedAt: receivedAt
        });
      }

      typingState.set(id, Object.freeze(mutableEntry));

      return Object.freeze(typingState);
    },
    [Date]
  );

  const state: ReadonlyMap<string, Entry> = useReduceActivities(reducer) || Object.freeze(new Map());

  const allTyping = useMemo(() => {
    const map = new Map<string, AllTyping>();

    for (const [id, entry] of state.entries()) {
      const firstContentfulLivestream = iteratorFind(
        entry.livestreamActivities.values(),
        ({ contentful }) => contentful
      );

      const firstContentlessLivestream = iteratorFind(
        entry.livestreamActivities.values(),
        ({ contentful }) => !contentful
      );

      if (firstContentfulLivestream) {
        map.set(
          id,
          Object.freeze({
            firstReceivedAt: firstContentfulLivestream.firstReceivedAt,
            lastActivityDuration: Infinity,
            lastReceivedAt: firstContentfulLivestream.lastReceivedAt,
            name: entry.name,
            role: entry.role,
            type: 'livestream'
          } satisfies AllTyping)
        );
      } else if (firstContentlessLivestream) {
        map.set(
          id,
          Object.freeze({
            firstReceivedAt: firstContentlessLivestream.firstReceivedAt,
            lastActivityDuration: Infinity,
            lastReceivedAt: firstContentlessLivestream.lastReceivedAt,
            name: entry.name,
            role: entry.role,
            type: 'busy'
          } satisfies AllTyping)
        );
      } else if (entry.typingIndicator) {
        map.set(
          id,
          Object.freeze({
            firstReceivedAt: entry.typingIndicator.firstReceivedAt,
            lastActivityDuration: entry.typingIndicator.duration,
            lastReceivedAt: entry.typingIndicator.lastReceivedAt,
            name: entry.name,
            role: entry.role,
            type: 'busy'
          } satisfies AllTyping)
        );
      }
    }

    return map;
  }, [state]);

  const allTypingState = useMemo(() => Object.freeze([allTyping] as const), [allTyping]);

  const context = useMemo<ActivityTypingContextType>(() => ({ allTypingState }), [allTypingState]);

  return <ActivityTypingContext.Provider value={context}>{children}</ActivityTypingContext.Provider>;
};

ActivityTypingComposer.displayName = 'ActivityTypingComposer';

export default memo(ActivityTypingComposer);
