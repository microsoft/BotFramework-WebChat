import { hooks } from 'botframework-webchat-api';
import React, { Fragment, memo, MutableRefObject, useCallback, useEffect, useMemo } from 'react';
import { useAnimatingToEnd, useAtEnd, useScrollToEnd, useSticky } from 'react-scroll-to-bottom';
import { useRefFrom } from 'use-ref-from';

import useRenderingActivityKeys from '../../providers/RenderingActivities/useRenderingActivityKeys';
import useFocusByActivityKey from '../../providers/TranscriptFocus/useFocusByActivityKey';

const { useActivityKeysByRead, useCreateScrollToEndButtonRenderer, useMarkActivityKeyAsRead, useStyleOptions } = hooks;

const EMPTY_ARRAY = Object.freeze([]);

const useScrollToEndRenderResult = (terminatorRef: MutableRefObject<HTMLDivElement>) => {
  const [renderingActivityKeys] = useRenderingActivityKeys();
  const [sticky]: [boolean] = useSticky();
  const [animatingToEnd]: [boolean] = useAnimatingToEnd();
  const [atEnd]: [boolean] = useAtEnd();
  const [, unreadActivityKeys] = useActivityKeysByRead();
  const [styleOptions] = useStyleOptions();
  const focusByActivityKey = useFocusByActivityKey();
  const markActivityKeyAsRead = useMarkActivityKeyAsRead();
  const scrollToEnd: (options?: ScrollToOptions) => void = useScrollToEnd();

  // Acknowledged means either:
  // 1. The user sent a message
  //    - We don't need a condition here. When Web Chat sends the user's message, it will scroll to bottom, and it will trigger condition 2 below.
  // 2. The user scroll to the bottom of the transcript, from a non-bottom scroll position
  //    - If the transcript is already at the bottom, the user needs to scroll up and then go back down
  //    - What happens if we are relaxing "scrolled from a non-bottom scroll position":
  //      1. The condition will become solely "at the bottom of the transcript"
  //      2. Auto-scroll will always scroll the transcript to the bottom
  //      3. Web Chat will always acknowledge all activities as it is at the bottom
  //      4. Acknowledge flag become useless
  //      5. Therefore, even the developer set "pause after 3 activities", if activities are coming in at a slow pace (not batched in a single render)
  //         Web Chat will keep scrolling and not snapped/paused

  // Note: When Web Chat is loaded, there are no activities acknowledged. We need to assume all arriving activities are acknowledged until end-user sends their first activity.
  //       Activities loaded initially could be from conversation history. Without assuming acknowledgement, Web Chat will not scroll initially (as everything is not acknowledged).
  //       It would be better if the chat adapter should let Web Chat know if the activity is loaded from history or not.

  // TODO: [P2] #3670 Move the "conversation history acknowledgement" logic mentioned above to polyfill of chat adapters.
  //       1. Chat adapter should send "acknowledged" as part of "channelData"
  //       2. If "acknowledged" is "undefined", we set it to:
  //          a. true, if there are no egress activities yet
  //          b. Otherwise, false

  const renderingActivityKeysRef = useRefFrom(renderingActivityKeys);

  // To prevent flashy button, we are not waiting for another render loop to update the `[readActivityKeys, unreadActivityKeys]` state.
  // Instead, we are building the next one in this `useMemo` call.
  const [nextUnreadActivityKeys, activityKeyToMarkAsRead] = useMemo<readonly [readonly string[], string | undefined]>(
    () =>
      Object.freeze(
        sticky && unreadActivityKeys.length
          ? [EMPTY_ARRAY, unreadActivityKeys[unreadActivityKeys.length - 1]]
          : [unreadActivityKeys, undefined]
      ),
    [sticky, unreadActivityKeys]
  );

  // This code need to be careful reviewed as it will cause another render. The code should be converging.
  // After we call `markActivityKeyAsRead`, everything will be read and nothing will be unread.
  // That means, in next render, `unreadActivityKeys` will be emptied and the `markActivityKeyAsRead` will not get called again.
  useEffect(() => {
    activityKeyToMarkAsRead && markActivityKeyAsRead(activityKeyToMarkAsRead);
  }, [activityKeyToMarkAsRead, markActivityKeyAsRead]);

  const nextUnreadActivityKeysRef = useRefFrom(nextUnreadActivityKeys);

  // If we are rendering anything that is unread, we should show the "New messages" button.
  // Not everything in the `unreadActivityKeys` are rendered, say, bot typing indicator.
  // We should not show the "New messages" button for bot typing indicator as it will confuse the user.
  const unread = useMemo(
    () => nextUnreadActivityKeys.some(key => renderingActivityKeys.includes(key)),
    [renderingActivityKeys, nextUnreadActivityKeys]
  );

  const handleScrollToEndButtonClick = useCallback(() => {
    scrollToEnd({ behavior: 'smooth' });

    const { current: renderingActivityKeys } = renderingActivityKeysRef;

    // After the "New message" button is clicked, focus on the first unread activity which will be rendered.
    const firstUnreadRenderingActivityKey = nextUnreadActivityKeysRef.current.find(key =>
      renderingActivityKeys.includes(key)
    );

    if (firstUnreadRenderingActivityKey) {
      focusByActivityKey(firstUnreadRenderingActivityKey);
    } else {
      // If no unread activity, send the focus to the terminator block.
      terminatorRef.current?.focus();
    }
  }, [focusByActivityKey, nextUnreadActivityKeysRef, renderingActivityKeysRef, scrollToEnd, terminatorRef]);

  // According to tests no memo is expected here
  const renderScrollToEndButton = useCreateScrollToEndButtonRenderer()({
    atEnd: animatingToEnd || atEnd || sticky,
    styleOptions,
    unread
  });

  return renderScrollToEndButton && renderScrollToEndButton({ onClick: handleScrollToEndButtonClick });
};

function ScrollToEndButton({ terminatorRef }: Readonly<{ terminatorRef: MutableRefObject<HTMLDivElement> }>) {
  const children = useScrollToEndRenderResult(terminatorRef);

  return <Fragment>{children}</Fragment>;
}

export default memo(ScrollToEndButton);
