import { hooks } from 'botframework-webchat-api';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef } from 'react';

import isPresentational from './LiveRegion/isPresentational';
import LiveRegionActivity from '../LiveRegion/LiveRegionActivity';
import LiveRegionSendFailed from './LiveRegion/SendFailed';
import tabbableElements from '../Utils/tabbableElements';
import useLocalizeAccessKey from '../hooks/internal/useLocalizeAccessKey';
import useQueueStaticElement from '../providers/LiveRegionTwin/useQueueStaticElement';
import useSuggestedActionsAccessKey from '../hooks/internal/useSuggestedActionsAccessKey';
import useTypistNames from './useTypistNames';

import type { ActivityElementMap } from './types';
import type { FC, RefObject } from 'react';
import type { WebChatActivity } from 'botframework-webchat-core';

const { useActivities, useGetKeyByActivity, useLocalizer } = hooks;

type RenderingActivities = Map<string, WebChatActivity>;

type LiveRegionTranscriptProps = {
  activityElementMapRef: RefObject<ActivityElementMap>;
};

const LiveRegionTranscript: FC<LiveRegionTranscriptProps> = ({ activityElementMapRef }) => {
  // We are looking for all activities instead of just those will be rendered.
  // This is because some activities that chosen not be rendered in the chat history,
  // we might still need to be read by screen reader. Such as, suggested actions without text content.
  const [accessKey] = useSuggestedActionsAccessKey();
  const [activities] = useActivities();
  const [typistNames] = useTypistNames();
  const getKeyByActivity = useGetKeyByActivity();
  const localize = useLocalizer();
  const localizeAccessKeyAsAccessibleName = useLocalizeAccessKey('accessible name');
  const queueStaticElement = useQueueStaticElement();

  const liveRegionInteractiveLabelAlt = localize('TRANSCRIPT_LIVE_REGION_INTERACTIVE_LABEL_ALT');
  const liveRegionInteractiveWithLinkLabelAlt = localize('TRANSCRIPT_LIVE_REGION_INTERACTIVE_WITH_LINKS_LABEL_ALT');
  const typingIndicator =
    !!typistNames.length &&
    localize(
      typistNames.length > 1 ? 'TYPING_INDICATOR_MULTIPLE_TEXT' : 'TYPING_INDICATOR_SINGLE_TEXT',
      typistNames[0]
    );

  const liveRegionSuggestedActionsLabelAlt = accessKey
    ? localize(
        'TRANSCRIPT_LIVE_REGION_SUGGESTED_ACTIONS_WITH_ACCESS_KEY_LABEL_ALT',
        localizeAccessKeyAsAccessibleName(accessKey)
      )
    : localize('TRANSCRIPT_LIVE_REGION_SUGGESTED_ACTIONS_LABEL_ALT');

  const keyedActivities = useMemo<Readonly<RenderingActivities>>(
    () =>
      Object.freeze(
        activities.reduce<RenderingActivities>((intermediate, activity) => {
          // Only "message" activity will be read by screen reader.
          if (activity.type === 'message') {
            return intermediate.set(getKeyByActivity(activity), activity);
          }

          return intermediate;
        }, new Map<string, WebChatActivity>())
      ),
    [activities, getKeyByActivity]
  );

  const prevRenderingActivitiesRef = useRef<Readonly<RenderingActivities>>();

  useEffect(() => {
    const { current: prevRenderingActivities } = prevRenderingActivitiesRef;
    const appendedActivities: { activity: WebChatActivity; key: string }[] = [];

    // Bottom-up, find activities which are recently appended (i.e. new activity will have a new key).
    // We only consider new activities added to the bottom of the chat history.
    // Based on how `aria-relevant="additions"` works, activities that are updated, deleted, or reordered, should be ignored.
    for (const [key, activity] of Array.from(keyedActivities.entries()).reverse()) {
      if (prevRenderingActivities?.has(key)) {
        break;
      }

      appendedActivities.unshift({ activity, key });

      isPresentational(activity) || queueStaticElement(<LiveRegionActivity activity={activity} />);
    }

    const hasNewLink = appendedActivities.some(({ key }) => activityElementMapRef.current.get(key)?.querySelector('a'));

    const hasNewWidget = appendedActivities.some(
      ({ key }) =>
        !!tabbableElements(
          activityElementMapRef.current.get(key)?.querySelector('.webchat__basic-transcript__activity-body')
        ).length
    );

    const hasSuggestedActions = appendedActivities.some(
      ({ activity }) => activity.type === 'message' && activity.suggestedActions?.actions?.length
    );

    // This is a footnote reading either:
    // - "Message is interactive. Press shift tab key 2 to 3 times to switch to the chat history. Then click on the message to interact.", or;
    // - "One or more links in the message. Press shift tab key 2 to 3 times to switch to the chat history. Then click on the message to interact."
    if (hasNewLink || hasNewWidget) {
      queueStaticElement(
        <div className="webchat__live-region-transcript__note" role="note">
          {hasNewLink ? liveRegionInteractiveWithLinkLabelAlt : liveRegionInteractiveLabelAlt}
        </div>
      );
    }

    // This is a footnote reading "Suggested actions container: has content. Press CTRL + SHIFT + A to select."
    if (hasSuggestedActions) {
      queueStaticElement(
        <div className="webchat__live-region-transcript__note" role="note">
          {liveRegionSuggestedActionsLabelAlt}
        </div>
      );
    }

    prevRenderingActivitiesRef.current = keyedActivities;
  }, [
    activityElementMapRef,
    liveRegionInteractiveLabelAlt,
    liveRegionInteractiveWithLinkLabelAlt,
    liveRegionSuggestedActionsLabelAlt,
    prevRenderingActivitiesRef,
    queueStaticElement,
    keyedActivities
  ]);

  useEffect(() => {
    typingIndicator && queueStaticElement(typingIndicator);
  }, [queueStaticElement, typingIndicator]);

  return <LiveRegionSendFailed />;
};

LiveRegionTranscript.propTypes = {
  // PropTypes cannot be fully expressed in TypeScript.
  // @ts-ignore
  activityElementMapRef: PropTypes.shape({
    current: PropTypes.instanceOf(Map)
  }).isRequired
};

export default LiveRegionTranscript;
