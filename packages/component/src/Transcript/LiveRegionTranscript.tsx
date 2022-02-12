import { hooks } from 'botframework-webchat-api';
import PropTypes from 'prop-types';
import random from 'math-random';
import React, { useEffect, useMemo, useRef } from 'react';

import type { DirectLineActivity } from 'botframework-webchat-core';
import type { FC, RefObject, VFC } from 'react';

import LiveRegionTwinComposer from '../providers/LiveRegionTwin/LiveRegionTwinComposer';
import ScreenReaderActivity from '../ScreenReaderActivity';
import tabbableElements from '../Utils/tabbableElements';
import useActivityTreeWithRenderer from '../providers/ActivityTree/useActivityTreeWithRenderer';
import useQueueStaticElement from '../providers/LiveRegionTwin/useQueueStaticElement';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';

import type { ActivityElementMap } from './types';
import classNames from 'classnames';

const { useGetKeyByActivity, useLocalizer, useStyleOptions } = hooks;

const ROOT_STYLE = {
  '&.webchat__live-region-transcript': {
    '& .webchat__live-region-transcript__interactive_note': {
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
function isPresentational(activity: DirectLineActivity): boolean {
  const { channelData }: { channelData?: { messageBack?: { displayText?: string } }; text?: string } = activity;

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
  const [flattenedActivityTree] = useActivityTreeWithRenderer({ flat: true });
  const getKeyByActivity = useGetKeyByActivity();
  const localize = useLocalizer();
  const queueStaticElement = useQueueStaticElement();

  const liveRegionInteractiveLabelAlt = localize('TRANSCRIPT_LIVE_REGION_INTERACTIVE_LABEL_ALT');
  const liveRegionInteractiveWithLinkLabelAlt = localize('TRANSCRIPT_LIVE_REGION_INTERACTIVE_WITH_LINKS_LABEL_ALT');

  const renderingActivities = useMemo<Readonly<RenderingActivities>>(
    () =>
      Object.freeze(
        flattenedActivityTree.reduce<RenderingActivities>(
          (intermediate, { activity }) => intermediate.set(getKeyByActivity(activity), activity),
          new Map<string, DirectLineActivity>()
        )
      ),
    [flattenedActivityTree, getKeyByActivity]
  );

  const prevRenderingActivitiesRef = useRef<Readonly<RenderingActivities>>();

  useEffect(() => {
    const { current: prevRenderingActivities } = prevRenderingActivitiesRef;
    const appendedActivities: { activity: DirectLineActivity; key: string }[] = [];

    // Bottom-up, find activities which are recently appended (i.e. new activity will have a new key).
    // We only consider new activities added to the bottom of the chat history.
    // Based on how `aria-relevant="additions"` works, activities that are updated, deleted, or reordered, should be ignored.
    for (const [key, activity] of Array.from(renderingActivities.entries()).reverse()) {
      if (prevRenderingActivities?.has(key)) {
        break;
      }

      appendedActivities.unshift({ activity, key });

      isPresentational(activity) || queueStaticElement(<ScreenReaderActivity activity={activity} />);
    }

    const hasNewLink = appendedActivities.some(({ key }) => activityElementMapRef.current.get(key)?.querySelector('a'));

    const hasNewWidget = appendedActivities.some(
      ({ key }) =>
        !!tabbableElements(
          activityElementMapRef.current.get(key)?.querySelector('.webchat__basic-transcript__activity-body')
        ).length
    );

    if (hasNewLink || hasNewWidget) {
      // eslint-disable-next-line no-magic-numbers
      const labelId = `webchat__live-region-transcript__interactive_note--${random().toString(36).substr(2, 5)}`;

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
          className="webchat__live-region-transcript__interactive_note"
          role="note"
        >
          {/* "id" is required for "aria-activedescendant" */}
          {/* eslint-disable-next-line react/forbid-dom-props */}
          <span id={labelId}>{hasNewLink ? liveRegionInteractiveWithLinkLabelAlt : liveRegionInteractiveLabelAlt}</span>
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
    queueStaticElement,
    renderingActivities
  ]);

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
