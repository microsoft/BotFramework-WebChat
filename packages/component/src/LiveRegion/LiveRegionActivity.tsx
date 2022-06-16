/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import activityAltText from '../Utils/activityAltText';
import LiveRegionAttachments from './private/LiveRegionAttachments';
import LiveRegionSuggestedActions from './private/LiveRegionSuggestedActions';
import useRenderMarkdownAsHTML from '../hooks/useRenderMarkdownAsHTML';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';

import type { VFC } from 'react';
import type { WebChatActivity } from 'botframework-webchat-core';

const { useAvatarForBot, useDateFormatter, useGetKeyByActivity, useLocalizer } = hooks;

const ROOT_STYLE = {
  '&.webchat__live-region-activity': {
    color: 'transparent',
    height: 1,
    opacity: 0,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    whiteSpace: 'nowrap',
    width: 1
  }
};

type LiveRegionActivityProps = {
  activity: WebChatActivity;
  id?: string;
};

// When "renderAttachments" is false, we will not render the content of attachments.
// That means, it will only render "2 attachments", instead of "image attachment".
// This is used in the visual transcript, where we render "Press ENTER to interact."
const LiveRegionActivity: VFC<LiveRegionActivityProps> = ({ activity, id }) => {
  const [{ initials: botInitials }] = useAvatarForBot();
  const {
    from: { role },
    timestamp,
    type
  } = activity;
  const fallbackText: string | undefined =
    type === 'message' ? activity.channelData['webchat:fallback-text'] : undefined;
  const formatDate = useDateFormatter();
  const getKeyByActivity = useGetKeyByActivity();
  const localize = useLocalizer();
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';
  const textAlt = useMemo(() => activityAltText(activity, renderMarkdownAsHTML), [activity, renderMarkdownAsHTML]);

  const greetingAlt: string = (
    role === 'user' ? localize('ACTIVITY_YOU_SAID_ALT') : localize('ACTIVITY_BOT_SAID_ALT', botInitials || '')
  ).replace(/\s{2,}/gu, ' ');

  const timestampAlt: string | undefined =
    timestamp && localize('ACTIVITY_STATUS_SEND_STATUS_ALT_SENT_AT', formatDate(timestamp));

  const labelId = useMemo(() => {
    const activityKey = getKeyByActivity(activity);

    return activityKey && `webchat__live-region-activity__label-${activityKey}`;
  }, [activity, getKeyByActivity]);

  // TODO: [P0] #4294 Investigate: this section seems to be narrated 2 times by some screen readers.
  return (
    <article
      aria-atomic={true}
      // Windows Narrator requires the "aria-labelledby" attribute, otherwise, it will only read "aria-roledescription".
      // However, iOS VoiceOver and NVDA both ignore the "aria-labelledby" and read out the whole content, including timestamp.
      aria-labelledby={labelId}
      aria-roledescription="message"
      className={classNames('webchat__live-region-activity', rootClassName)}
      // "id" attribute is used by `aria-labelledby`.
      // eslint-disable-next-line react/forbid-dom-props
      id={id}
    >
      {/* "id" attribute is used by `aria-labelledby`. */}
      {/* eslint-disable-next-line react/forbid-dom-props */}
      <p id={labelId}>
        <span>{greetingAlt}</span>
        <span>{textAlt}</span>
        {type === 'message' && activity.suggestedActions && (
          <LiveRegionSuggestedActions suggestedActions={activity.suggestedActions} />
        )}
      </p>
      {!fallbackText && type === 'message' && <LiveRegionAttachments activity={activity} />}
      {timestampAlt && <p className="webchat__live-region-activity__timestamp">{timestampAlt}</p>}
    </article>
  );
};

LiveRegionActivity.defaultProps = {
  id: undefined
};

LiveRegionActivity.propTypes = {
  activity: PropTypes.any.isRequired,
  id: PropTypes.string
};

export default LiveRegionActivity;

export type { LiveRegionActivityProps };
