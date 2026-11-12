/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import React, { Fragment, useMemo } from 'react';
import { any, object, pipe, readonly } from 'valibot';

import useLocalizeActivityGreetingAlt from '../hooks/internal/useLocalizeActivityGreetingAlt.js';
import useRenderMarkdownAsHTML from '../hooks/useRenderMarkdownAsHTML';
import activityAltText from '../Utils/activityAltText';
import styles from './LiveRegionActivity.module.css';
import LiveRegionAttachments from './private/LiveRegionAttachments';
import LiveRegionSuggestedActions from './private/LiveRegionSuggestedActions';

const liveRegionActivityPropsSchema = pipe(
  object({
    activity: any()
  }),
  readonly()
);

type LiveRegionActivityProps = InferReactProps<typeof liveRegionActivityPropsSchema>;

function LiveRegionActivity(props: LiveRegionActivityProps) {
  const { activity } = validateProps(liveRegionActivityPropsSchema, props);

  const { type } = activity;
  const fallbackText: string | undefined =
    type === 'message' ? activity.channelData['webchat:fallback-text'] : undefined;
  const [greetingAlt] = useLocalizeActivityGreetingAlt()(activity);
  const classNames = useStyles(styles, webChatPrefixedClassName);
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML('accessible name');
  const textAlt = useMemo(() => activityAltText(activity, renderMarkdownAsHTML), [activity, renderMarkdownAsHTML]);

  const validFallbackText = fallbackText && typeof fallbackText === 'string';

  // Lines are `role="none"`: on Windows, generic `<div>` and `<p>` are exposed as "group", screen readers would read "group" before each line.
  // The message itself stays in the accessibility tree, as required by `aria-atomic`.
  return (
    <div aria-atomic={true} className={classNames['live-region-activity']}>
      <div role="none">{greetingAlt}</div>
      {validFallbackText ? (
        <div role="none">{fallbackText}</div>
      ) : (
        <Fragment>
          <div role="none">{textAlt}</div>
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
    </div>
  );
}

export default LiveRegionActivity;
export { liveRegionActivityPropsSchema, type LiveRegionActivityProps };
