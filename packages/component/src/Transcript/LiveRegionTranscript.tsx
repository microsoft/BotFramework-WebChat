import { hooks } from 'botframework-webchat-api';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef } from 'react';

import type { DirectLineActivity } from 'botframework-webchat-core';
import type { FC, RefObject, VFC } from 'react';

import LiveRegionTwinComposer from '../providers/LiveRegionTwin/LiveRegionTwinComposer';
import ScreenReaderActivity from '../ScreenReaderActivity';
import ScreenReaderText from '../ScreenReaderText';
import tabbableElements from '../Utils/tabbableElements';
import useActivityTreeWithRenderer from '../providers/ActivityTree/useActivityTreeWithRenderer';
import useQueueStaticElement from '../providers/LiveRegionTwin/useQueueStaticElement';

import type { ActivityElementMap } from './types';

const { useGetKeyByActivity, useLocalizer, useStyleOptions } = hooks;

/**
 * Checks if the rendering activity is presentational or not. Returns `true` if presentational, otherwise, `false`.
 *
 * Presentational activity, will be rendered visually but not going through screen reader.
 */
function isPresentational(activity: DirectLineActivity): boolean {
  const { channelData }: { attachments?: []; channelData?: { messageBack?: { displayText?: string } }; text?: string } =
    activity;

  // "Fallback text" includes both message text and narratives for attachments.
  // Emptying out "fallback text" essentially mute for both message and attachments.
  const fallbackText = channelData?.['webchat:fallback-text'];

  if (typeof fallbackText === 'string') {
    return !fallbackText;
  }

  // If there are "displayText" (MessageBack), "text", or any attachments, there are something to narrate.
  return !(channelData?.messageBack?.displayText || activity.text || activity.attachments?.length);
}

type RenderingActivities = Map<string, DirectLineActivity>;

type LiveRegionTranscriptCoreProps = {
  activityElementMapRef: RefObject<ActivityElementMap>;
};

const LiveRegionTranscriptCore: FC<LiveRegionTranscriptCoreProps> = ({ activityElementMapRef }) => {
  const [activityTree] = useActivityTreeWithRenderer();
  const getKeyByActivity = useGetKeyByActivity();
  const localize = useLocalizer();
  const queueStaticElement = useQueueStaticElement();

  const liveRegionInteractiveLabelAlt = localize('TRANSCRIPT_LIVE_REGION_INTERACTIVE_LABEL_ALT');
  const liveRegionInteractiveWithLinkLabelAlt = localize('TRANSCRIPT_LIVE_REGION_INTERACTIVE_WITH_LINKS_LABEL_ALT');

  // TODO: [P*] Consider refactoring this hook.
  //       After refactoring, we should memoize the result more precisely.
  const renderingActivities = useMemo<Readonly<RenderingActivities>>(
    () =>
      Object.freeze(
        activityTree.reduce<RenderingActivities>(
          (intermediate, entriesWithSameSender) =>
            entriesWithSameSender.reduce(
              (intermediate, entriesWithSameSenderAndStatus) =>
                entriesWithSameSenderAndStatus.reduce((intermediate, { activity }) => {
                  intermediate.set(getKeyByActivity(activity), activity);

                  return intermediate;
                }, intermediate),
              intermediate
            ),
          new Map<string, DirectLineActivity>()
        )
      ),
    [activityTree, getKeyByActivity]
  );

  const prevRenderingActivitiesRef = useRef<Readonly<RenderingActivities>>();

  useEffect(() => {
    const { current: prevRenderingActivities } = prevRenderingActivitiesRef;
    const appendedActivities: { activity: DirectLineActivity; key: string }[] = [];

    // Bottom-up, find activities which are recently appended (i.e. new activity will have a new key).
    // We only consider new activities added to the bottom of the chat history.
    // Based on how `aria-relevant="additions"` works, activities that are updated, deleted, or reordered, should be ignored.
    for (const [key, activity] of Array.from(renderingActivities.entries()).reverse()) {
      if (prevRenderingActivities.has(key)) {
        break;
      }

      appendedActivities.unshift({ activity, key });

      isPresentational(activity) || queueStaticElement(<ScreenReaderActivity activity={activity} />);
    }

    const hasNewLink = appendedActivities.some(({ key }) => activityElementMapRef.current.get(key)?.querySelector('a'));

    const hasNewWidget = appendedActivities.some(
      ({ key }) =>
        !!tabbableElements(
          activityElementMapRef.current.get(key)?.querySelector('.webchat__basic-transcript__activity-box')
        ).length
    );

    if (hasNewLink || hasNewWidget) {
      // VoiceOver did not narrate empty self-closing tag, such as <div aria-label="Something" />.
      // Thus, <ScreenReaderText> is needed.
      queueStaticElement(
        <div aria-atomic="true" role="note">
          <ScreenReaderText text={hasNewLink ? liveRegionInteractiveWithLinkLabelAlt : liveRegionInteractiveLabelAlt} />
        </div>
      );
    }

    prevRenderingActivitiesRef.current = renderingActivities;
  }, [
    activityElementMapRef,
    getKeyByActivity,
    liveRegionInteractiveLabelAlt,
    liveRegionInteractiveWithLinkLabelAlt,
    prevRenderingActivitiesRef,
    renderingActivities,
    queueStaticElement
  ]);

  return null;
};

type LiveRegionTranscriptProps = {
  activityElementMapRef: RefObject<ActivityElementMap>;
};

const LiveRegionTranscript: VFC<LiveRegionTranscriptProps> = ({ activityElementMapRef }) => {
  const [{ internalLiveRegionFadeAfter }] = useStyleOptions();
  const localize = useLocalizer();

  const transcriptRoleDescription = localize('TRANSCRIPT_ARIA_ROLE_ALT');

  return (
    <LiveRegionTwinComposer
      aria-roledescription={transcriptRoleDescription}
      fadeAfter={internalLiveRegionFadeAfter}
      role="log"
    >
      <LiveRegionTranscriptCore activityElementMapRef={activityElementMapRef} />
    </LiveRegionTwinComposer>
  );
};

LiveRegionTranscript.propTypes = {
  // PropTypes cannot be fully expressed in TypeScript.
  // @ts-ignore
  activityElementMapRef: PropTypes.shape({
    current: PropTypes.instanceOf(Map)
  }).isRequired
};

export default LiveRegionTranscript;
