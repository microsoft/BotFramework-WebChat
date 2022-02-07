import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { forwardRef, useCallback, useRef } from 'react';

import type { DirectLineActivity } from 'botframework-webchat-core';
import type { FocusEventHandler, KeyboardEventHandler, MouseEventHandler, PropsWithChildren } from 'react';

import { android } from '../Utils/detectBrowser';
import FocusRedirector from '../Utils/FocusRedirector';
import ScreenReaderText from '../ScreenReaderText';
import SpeakActivity from '../Activity/Speak';
import useActiveDescendantId from '../providers/TranscriptFocus/useActiveDescendantId';
import useActivityAccessibleName from './useActivityAccessibleName';
import useFocusByActivityKey from '../providers/TranscriptFocus/useFocusByActivityKey';
import useGetDescendantIdByActivityKey from '../providers/TranscriptFocus/useGetDescendantIdByActivityKey';
import useValueRef from '../hooks/internal/useValueRef';

const { useGetHasAcknowledgedByActivityKey, useGetHasReadByActivityKey, useGetKeyByActivity } = hooks;

type ActivityRowProps = PropsWithChildren<{
  activity: DirectLineActivity;
}>;

const ActivityRow = forwardRef<HTMLLIElement, ActivityRowProps>(({ activity, children }, ref) => {
  const [activeDescendantId] = useActiveDescendantId();
  const bodyRef = useRef<HTMLDivElement>();
  const focusByActivityKey = useFocusByActivityKey();
  const getKeyByActivity = useGetKeyByActivity();
  // TODO: [P2] #2858 We should use core/definitions/speakingActivity for this predicate instead
  const shouldSpeak = activity.channelData?.speak;

  const [accessibleName] = useActivityAccessibleName(activity, bodyRef);
  const activityKey = getKeyByActivity(activity);

  const acknowledged = useGetHasAcknowledgedByActivityKey()(activityKey);
  const activityKeyRef = useValueRef<string>(activityKey);
  const descendantId = useGetDescendantIdByActivityKey()(activityKey);
  const descendantLabelId = `webchat__basic-transcript__active-descendant-label--${activityKey}`;
  const read = useGetHasReadByActivityKey()(activityKey);

  const isActiveDescendant = descendantId === activeDescendantId;

  const focusSelf = useCallback<(withFocus?: boolean) => void>(
    (withFocus?: boolean) => focusByActivityKey(activityKeyRef.current, withFocus),
    [activityKeyRef, focusByActivityKey]
  );

  // When a child of the activity receives focus, notify the transcript to set the `aria-activedescendant` to this activity.
  const handleDescendantFocus: FocusEventHandler = useCallback(() => focusSelf(false), [focusSelf]);

  // When receive Escape key from descendant, focus back to the activity.
  const handleDescendantKeyDown: KeyboardEventHandler = useCallback(
    event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();

        focusSelf();
      }
    },
    [focusSelf]
  );

  // For accessibility: when the user press up/down arrow keys, we put a visual focus indicator around the focused activity.
  // We should do the same for mouse, when the user click on the activity, we should also put a visual focus indicator around the focused activity.
  // We are doing it in event capture phase to prevent descendants from stopping event propagation to us.

  const handleMouseDownCapture: MouseEventHandler = useCallback(() => focusSelf(false), [focusSelf]);
  const handleSentinelFocus: () => void = useCallback(() => focusSelf(), [focusSelf]);

  return (
    // TODO: [P2] Add `aria-roledescription="message"` for better AX, need localization strings.
    <article
      // TODO: [P*] If "webchat:fallback-text" field is set to empty string, this activity is presentational.
      // aria-hidden={activity.channelData?.['webchat:fallback-text'] === ''}
      className={classNames('webchat__basic-transcript__activity', {
        'webchat__basic-transcript__activity--acknowledged': acknowledged,
        'webchat__basic-transcript__activity--read': read
      })}
      // When NVDA is in browse mode, using up/down arrow key to "browse" will dispatch "click" and "mousedown" events for <article> element (inside <ScreenReaderActivity>).
      onMouseDownCapture={handleMouseDownCapture}
      ref={ref}
    >
      {/* TODO: [P*] File a crbug for TalkBack. It should not able to read the content twice when scanning. */}

      {/* The following <div> is designed for active descendant only.
          We want to prevent screen reader from scanning the content that is authored only for active descendant.
          The specific content should only read when user press UP/DOWN arrow keys to change `aria-activedescendant`.
          However, Android TalkBack 12.1 is buggy when the there is an element with ID of one of the `aria-activedescendant` potential candidates,
          TalkBack will narrate the message content twice (i.e. content of `bodyRef`), regardless whether the ID is currently set as `aria-activedescendant` or not.
          As Android does not support active descendant, we are hiding the whole DOM element altogether. */}

      {!android && (
        <div
          aria-labelledby={descendantLabelId}
          className="webchat__basic-transcript__activity-active-descendant-label"
          // "id" is required for "aria-labelledby"
          // eslint-disable-next-line react/forbid-dom-props
          id={descendantId}
          role="article"
        >
          <ScreenReaderText aria-hidden={true} id={descendantLabelId} text={accessibleName} />
        </div>
      )}

      {/* TODO: [P*] Consider focus trap. */}
      <FocusRedirector className="webchat__basic-transcript__activity-sentinel" onFocus={handleSentinelFocus} />
      <div
        className="webchat__basic-transcript__activity-box"
        onFocus={handleDescendantFocus}
        onKeyDown={handleDescendantKeyDown}
        ref={bodyRef}
      >
        {children}
      </div>
      {shouldSpeak && <SpeakActivity activity={activity} />}
      <FocusRedirector className="webchat__basic-transcript__activity-sentinel" onFocus={handleSentinelFocus} />
      <div
        className={classNames('webchat__basic-transcript__activity-indicator', {
          'webchat__basic-transcript__activity-indicator--focus': isActiveDescendant
        })}
      />
    </article>
  );
});

ActivityRow.defaultProps = {
  children: undefined
};

ActivityRow.propTypes = {
  activity: PropTypes.shape({
    channelData: PropTypes.shape({
      speak: PropTypes.bool,
      'webchat:fallback-text': PropTypes.string
    })
  }).isRequired,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)])
};

export default ActivityRow;
