import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef } from 'react';
import type { FC, RefObject, VFC } from 'react';
import type { WebChatActivity } from 'botframework-webchat-core';

import isPresentational from './LiveRegion/isPresentational';
import LiveRegionActivity from '../LiveRegion/LiveRegionActivity';
import LiveRegionSendFailed from './LiveRegion/SendFailed';
import LiveRegionTwinComposer from '../providers/LiveRegionTwin/LiveRegionTwinComposer';
import tabbableElements from '../Utils/tabbableElements';
import useLocalizeAccessKey from '../hooks/internal/useLocalizeAccessKey';
import useQueueStaticElement from '../providers/LiveRegionTwin/useQueueStaticElement';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';
import useSuggestedActionsAccessKey from '../hooks/internal/useSuggestedActionsAccessKey';
import useTypistNames from './useTypistNames';

import type { ActivityElementMap } from './types';

const { useActivities, useGetKeyByActivity, useLocalizer, useStyleOptions } = hooks;

const ROOT_STYLE = {
  '&.webchat__live-region-transcript': {
    '& .webchat__live-region-transcript__note, & .webchat__live-region-transcript__note, & .webchat__live-region-transcript__text-element':
      {
        color: 'transparent',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        top: 0,
        whiteSpace: 'nowrap',
        width: 1
      }
  }
};

type RenderingActivities = Map<string, WebChatActivity>;

type LiveRegionTranscriptCoreProps = Readonly<{
  activityElementMapRef: RefObject<ActivityElementMap>;
}>;

const LiveRegionTranscriptCore: FC<LiveRegionTranscriptCoreProps> = ({ activityElementMapRef }) => {
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

type LiveRegionTranscriptProps = {
  activityElementMapRef: RefObject<ActivityElementMap>;
};

const LiveRegionTranscript: VFC<LiveRegionTranscriptProps> = ({ activityElementMapRef }) => {
  const [{ internalLiveRegionFadeAfter }] = useStyleOptions();
  const localize = useLocalizer();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  const transcriptRoleDescription = localize('TRANSCRIPT_ARIA_ROLE_ALT');

  return (
    <LiveRegionTwinComposer
      aria-roledescription={transcriptRoleDescription}
      className={classNames('webchat__live-region-transcript', rootClassName)}
      fadeAfter={internalLiveRegionFadeAfter}
      role="log"
      textElementClassName="webchat__live-region-transcript__text-element"
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
