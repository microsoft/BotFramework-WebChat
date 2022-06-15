import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import random from 'math-random';
import React, { useEffect, useMemo, useRef } from 'react';
import type { FC, RefObject, VFC } from 'react';
import type { WebChatActivity } from 'botframework-webchat-core';

import LiveRegionActivity from '../LiveRegion/LiveRegionActivity';
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
    '& .webchat__live-region-transcript__interactive-note, & .webchat__live-region-transcript__suggested-actions-note, & .webchat__live-region-transcript__text-element':
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

/**
 * Checks if the rendering activity is presentational or not. Returns `true` if presentational, otherwise, `false`.
 *
 * Presentational activity, will be rendered visually but not going through screen reader.
 */
function isPresentational(activity: WebChatActivity): boolean {
  if (activity.type !== 'message') {
    return;
  }

  const { channelData } = activity;

  // "Fallback text" includes both message text and narratives for attachments.
  // Emptying out "fallback text" essentially mute for both message and attachments.
  const fallbackText = channelData?.['webchat:fallback-text'];

  if (typeof fallbackText === 'string') {
    return !fallbackText;
  }

  // If there are "displayText" (MessageBack), "text", any attachments, or suggested actions, there are something to narrate.
  return !(
    channelData?.messageBack?.displayText ||
    activity.text ||
    activity.attachments?.length ||
    activity.suggestedActions?.actions?.length
  );
}

type RenderingActivities = Map<string, WebChatActivity>;

type LiveRegionTranscriptCoreProps = {
  activityElementMapRef: RefObject<ActivityElementMap>;
};

const LiveRegionTranscriptCore: FC<LiveRegionTranscriptCoreProps> = ({ activityElementMapRef }) => {
  // We are looking for all activities instead of just those will be rendered.
  // This is because some activities that chosen not be rendered in the chat history,
  // we might still need to be read by screen reader. Such as, suggested actions without text content.
  const [accessKey] = useSuggestedActionsAccessKey();
  const [activities] = useActivities();
  const [typistNames] = useTypistNames();
  const getKeyByActivity = useGetKeyByActivity();
  const localize = useLocalizer();
  const localizeAccessKey = useLocalizeAccessKey();
  const queueStaticElement = useQueueStaticElement();

  const liveRegionInteractiveLabelAlt = localize('TRANSCRIPT_LIVE_REGION_INTERACTIVE_LABEL_ALT');
  const liveRegionInteractiveWithLinkLabelAlt = localize('TRANSCRIPT_LIVE_REGION_INTERACTIVE_WITH_LINKS_LABEL_ALT');
  const typingIndicator =
    !!typistNames.length &&
    localize(
      typistNames.length > 1 ? 'TYPING_INDICATOR_MULTIPLE_TEXT' : 'TYPING_INDICATOR_SINGLE_TEXT',
      typistNames[0]
    );

  // TODO: [P*] We should change the narration to "Message has suggested actions. Press SHIFT + ALT + A to select them."
  const liveRegionSuggestedActionsLabelAlt = localize(
    'SUGGESTED_ACTIONS_ALT',
    accessKey
      ? localize('SUGGESTED_ACTIONS_ALT_HAS_CONTENT_AND_ACCESS_KEY', localizeAccessKey(accessKey))
      : localize('SUGGESTED_ACTIONS_ALT_HAS_CONTENT')
  );

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

    if (hasNewLink || hasNewWidget) {
      // eslint-disable-next-line no-magic-numbers
      const labelId = `webchat__live-region-transcript__interactive-note--${random().toString(36).substr(2, 5)}`;

      queueStaticElement(
        // Inside ARIA live region:
        // - Edge + Narrator:
        //   - It read if `aria-labelledby` or `aria-label` is set;
        //   - It read nothing if `aria-labelledby` or `aria-label` are not set (in this case, it read "note").
        // - Safari + VoiceOver and Chrome + NVDA:
        //   - They read its content and ignore `aria-labelledby` or `aria-label`
        //   - They will not read if it is simply <div aria-label="Something" /> without content (self-closing tag).
        // For best compatibility, we need both `aria-labelledby` and contented <div>.
        <div
          aria-atomic="true"
          aria-labelledby={labelId}
          className="webchat__live-region-transcript__interactive-note"
          role="note"
        >
          {/* "id" is required */}
          {/* eslint-disable-next-line react/forbid-dom-props */}
          <span id={labelId}>{hasNewLink ? liveRegionInteractiveWithLinkLabelAlt : liveRegionInteractiveLabelAlt}</span>
        </div>
      );
    }

    // This is a footnote reading "Suggested actions container: has content. Press CTRL + SHIFT + A to select."
    if (hasSuggestedActions) {
      // eslint-disable-next-line no-magic-numbers
      const labelId = `webchat__live-region-transcript__suggested-actions-note--${random().toString(36).substr(2, 5)}`;

      queueStaticElement(
        <div aria-labelledby={labelId} className="webchat__live-region-transcript__suggested-actions-note" role="note">
          {/* "id" is required */}
          {/* eslint-disable-next-line react/forbid-dom-props */}
          <span id={labelId}>{liveRegionSuggestedActionsLabelAlt}</span>
        </div>
      );
    }

    prevRenderingActivitiesRef.current = keyedActivities;
  }, [
    activityElementMapRef,
    getKeyByActivity,
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

  return null;
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
