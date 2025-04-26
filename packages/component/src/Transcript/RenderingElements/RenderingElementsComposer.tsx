import { hooks } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo, type ReactNode } from 'react';
import { instance, map, object, optional, parse, pipe, readonly, string, type InferOutput } from 'valibot';
import useMemoized from '../../hooks/internal/useMemoized';
import TranscriptActivity from '../../TranscriptActivity';
import isZeroOrPositive from '../../Utils/isZeroOrPositive';
import useActivityTreeWithRenderer from '../../providers/ActivityTree/useActivityTreeWithRenderer';
import mutableRefObject from './private/mutableRefObject';
import reactNode from './private/reactNode';
import RenderingElementsContext, { type RenderingElementsContextType } from './private/RenderingElementsContext';

const { useCreateAvatarRenderer, useGetKeyByActivity, useStyleOptions } = hooks;

const renderingElementsComposerPropsSchema = pipe(
  object({
    activityElementMapRef: mutableRefObject(map(string(), instance(HTMLElement))),
    children: optional(reactNode()),
    grouping: string()
  }),
  readonly()
);

type RenderingElementsComposerProps = InferOutput<typeof renderingElementsComposerPropsSchema>;

const RenderingElementsComposer = (props: RenderingElementsComposerProps) => {
  const { activityElementMapRef, children, grouping } = parse(renderingElementsComposerPropsSchema, props);

  const [{ bubbleFromUserNubOffset, bubbleNubOffset, groupTimestamp, showAvatarInGroup }] = useStyleOptions();
  const [activityWithRendererTree] = useActivityTreeWithRenderer();
  const createAvatarRenderer = useCreateAvatarRenderer();
  const getKeyByActivity = useGetKeyByActivity();

  const hideAllTimestamps = groupTimestamp === false;

  const createAvatarRendererMemoized = useMemoized(
    (activity: WebChatActivity) => createAvatarRenderer({ activity }),
    [createAvatarRenderer]
  );

  // Flatten the tree back into an array with information related to rendering.
  const renderingElementsState = useMemo<readonly [readonly ReactNode[]]>(() => {
    const renderingElements: ReactNode[] = [];
    const topSideBotNub = isZeroOrPositive(bubbleNubOffset);
    const topSideUserNub = isZeroOrPositive(bubbleFromUserNubOffset);

    activityWithRendererTree.forEach(entriesWithSameSender => {
      const [[{ activity: firstActivity }]] = entriesWithSameSender;
      const renderAvatar = createAvatarRendererMemoized(firstActivity);

      entriesWithSameSender.forEach((entriesWithSameSenderAndStatus, indexWithinSenderGroup) => {
        const firstInSenderGroup = !indexWithinSenderGroup;
        const lastInSenderGroup = indexWithinSenderGroup === entriesWithSameSender.length - 1;

        entriesWithSameSenderAndStatus.forEach(({ activity, renderActivity }, indexWithinSenderAndStatusGroup) => {
          // We only show the timestamp at the end of the sender group. But we always show the "Send failed, retry" prompt.
          const firstInSenderAndStatusGroup = !indexWithinSenderAndStatusGroup;
          const key: string = getKeyByActivity(activity);
          const lastInSenderAndStatusGroup =
            indexWithinSenderAndStatusGroup === entriesWithSameSenderAndStatus.length - 1;
          const topSideNub = activity.from?.role === 'user' ? topSideUserNub : topSideBotNub;

          let showCallout: boolean;

          // Depending on the "showAvatarInGroup" setting, the avatar will render in different positions.
          if (showAvatarInGroup === 'sender') {
            if (topSideNub) {
              showCallout = firstInSenderGroup && firstInSenderAndStatusGroup;
            } else {
              showCallout = lastInSenderGroup && lastInSenderAndStatusGroup;
            }
          } else if (showAvatarInGroup === 'status') {
            if (topSideNub) {
              showCallout = firstInSenderAndStatusGroup;
            } else {
              showCallout = lastInSenderAndStatusGroup;
            }
          } else {
            showCallout = true;
          }

          renderingElements.push(
            <TranscriptActivity
              activity={activity}
              activityElementMapRef={activityElementMapRef}
              // "hideTimestamp" is a render-time parameter for renderActivityStatus().
              // If true, it will hide the timestamp, but it will continue to show the
              // retry prompt. And show the screen reader version of the timestamp.
              activityKey={key}
              hideTimestamp={
                hideAllTimestamps || indexWithinSenderAndStatusGroup !== entriesWithSameSenderAndStatus.length - 1
              }
              key={key}
              renderActivity={renderActivity}
              renderAvatar={renderAvatar}
              showCallout={showCallout}
            />
          );
        });
      });
    });

    return Object.freeze([renderingElements]);
  }, [
    activityElementMapRef,
    activityWithRendererTree,
    bubbleFromUserNubOffset,
    bubbleNubOffset,
    createAvatarRendererMemoized,
    getKeyByActivity,
    hideAllTimestamps,
    showAvatarInGroup
  ]);

  const context = useMemo<RenderingElementsContextType>(
    () =>
      Object.freeze({
        grouping,
        renderingElementsState
      }),
    [grouping, renderingElementsState]
  );

  return <RenderingElementsContext.Provider value={context}>{children}</RenderingElementsContext.Provider>;
};

RenderingElementsComposer.displayName = 'RenderingElementsComposer';

export default memo(RenderingElementsComposer);

export { type RenderingElementsComposerProps };
