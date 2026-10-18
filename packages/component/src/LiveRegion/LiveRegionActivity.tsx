/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import classNames from 'classnames';
import React, { Fragment, useMemo } from 'react';
import { any, object, pipe, readonly, type InferInput } from 'valibot';

import { useStyleToEmotionObject } from '../hooks/internal/styleToEmotionObject';
import useActivityGreetingAlt from '../hooks/internal/useActivityGreetingAlt.js';
import useRenderMarkdownAsHTML from '../hooks/useRenderMarkdownAsHTML';
import activityAltText from '../Utils/activityAltText';
import LiveRegionAttachments from './private/LiveRegionAttachments';
import LiveRegionSuggestedActions from './private/LiveRegionSuggestedActions';

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

const liveRegionActivityPropsSchema = pipe(
  object({
    activity: any()
  }),
  readonly()
);

type LiveRegionActivityProps = InferInput<typeof liveRegionActivityPropsSchema>;

function LiveRegionActivity(props: LiveRegionActivityProps) {
  const { activity } = validateProps(liveRegionActivityPropsSchema, props);

  const {
    from: { role },
    type
  } = activity;
  const fallbackText: string | undefined =
    type === 'message' ? activity.channelData['webchat:fallback-text'] : undefined;
  const greetingAlt = useActivityGreetingAlt(activity, role === 'user');
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML('accessible name');
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';
  const textAlt = useMemo(() => activityAltText(activity, renderMarkdownAsHTML), [activity, renderMarkdownAsHTML]);

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
}

export default LiveRegionActivity;
export { liveRegionActivityPropsSchema, type LiveRegionActivityProps };
