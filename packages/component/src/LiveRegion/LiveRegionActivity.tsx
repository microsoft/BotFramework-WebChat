/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Fragment, useMemo } from 'react';

import activityAltText from '../Utils/activityAltText';
import LiveRegionAttachments from './private/LiveRegionAttachments';
import LiveRegionSuggestedActions from './private/LiveRegionSuggestedActions';
import useRenderMarkdownAsHTML from '../hooks/useRenderMarkdownAsHTML';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';

import type { VFC } from 'react';
import type { WebChatActivity } from 'botframework-webchat-core';

const { useAvatarForBot, useLocalizer } = hooks;

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
};

const LiveRegionActivity: VFC<LiveRegionActivityProps> = ({ activity }) => {
  const [{ initials: botInitials }] = useAvatarForBot();
  const {
    from: { role },
    type
  } = activity;
  const fallbackText: string | undefined =
    type === 'message' ? activity.channelData['webchat:fallback-text'] : undefined;
  const localize = useLocalizer();
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';
  const textAlt = useMemo(() => activityAltText(activity, renderMarkdownAsHTML), [activity, renderMarkdownAsHTML]);

  const greetingAlt: string = (
    role === 'user' ? localize('ACTIVITY_YOU_SAID_ALT') : localize('ACTIVITY_BOT_SAID_ALT', botInitials || '')
  ).replace(/\s{2,}/gu, ' ');
  const validFallbackText = fallbackText && typeof fallbackText === 'string';

  return (
    <article aria-atomic={true} className={classNames('webchat__live-region-activity', rootClassName)}>
      <div>{greetingAlt}</div>
      {validFallbackText ? (
        <div>{fallbackText}</div>
      ) : (
        <Fragment>
          <div>{textAlt}</div>
          {type === 'message' && (
            <Fragment>
              {!!activity.suggestedActions && (
                <LiveRegionSuggestedActions suggestedActions={activity.suggestedActions} />
              )}
              <LiveRegionAttachments activity={activity} />
            </Fragment>
          )}
        </Fragment>
      )}
    </article>
  );
};

LiveRegionActivity.propTypes = {
  activity: PropTypes.any.isRequired
};

export default LiveRegionActivity;

export type { LiveRegionActivityProps };
