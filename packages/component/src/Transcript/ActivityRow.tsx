import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { forwardRef, useCallback, useMemo, useRef } from 'react';

import type { DirectLineActivity } from 'botframework-webchat-core';
import type { FocusEventHandler, KeyboardEventHandler, MouseEventHandler, PropsWithChildren } from 'react';

import FocusRedirector from '../Utils/FocusRedirector';
import getTabIndex from '../Utils/TypeFocusSink/getTabIndex';
import ScreenReaderActivity from '../ScreenReaderActivity';
import SpeakActivity from '../Activity/Speak';
// TODO: [P*] Rename to "getTabbableElements".
import tabbableElements from '../Utils/tabbableElements';
import useActiveDescendantId from '../providers/TranscriptFocus/useActiveDescendantId';
import useComputeElementIdFromActivityKey from '../providers/TranscriptFocus/useComputeElementIdFromActivityKey';
import useFocusByActivityKey from '../providers/TranscriptFocus/useFocusByActivityKey';
import useValueRef from '../hooks/internal/useValueRef';

const { useGetHasAcknowledgedByActivityKey, useGetHasReadByActivityKey, useLocalizer } = hooks;

type ActivityRowProps = PropsWithChildren<{
  activity: DirectLineActivity;
  activityKey: string;
  shouldSpeak?: boolean;
}>;

const ActivityRow = forwardRef<HTMLLIElement, ActivityRowProps>(
  ({ activity, activityKey, children, shouldSpeak }, ref) => {
    const [activeDescendantId] = useActiveDescendantId();
    const acknowledged = useGetHasAcknowledgedByActivityKey()(activityKey);
    const activityKeyRef = useValueRef<string>(activityKey);
    const ariaLabelId = useMemo(() => `webchat__basic-transcript__activity-label--${activityKey}`, [activityKey]);
    const bodyRef = useRef<HTMLDivElement>();
    const focusByActivityKey = useFocusByActivityKey();
    const id = useComputeElementIdFromActivityKey()(activityKey);
    const localize = useLocalizer();
    const read = useGetHasReadByActivityKey()(activityKey);

    const activityInteractiveAlt = localize('ACTIVITY_INTERACTIVE_LABEL_ALT'); // "Click to interact."
    const isActiveDescendant = id === activeDescendantId;

    const focusSelf = useCallback<(withFocus?: boolean) => void>(
      (withFocus?: boolean) => focusByActivityKey(activityKeyRef.current, withFocus),
      [activityKeyRef, focusByActivityKey]
    );

    const handleClick: MouseEventHandler = useCallback(
      ({ currentTarget, target }) => {
        // (Related to #4020)
        //
        // This is called while screen reader is running:
        //
        // 1. When scan mode is on (Windows Narrator) or in browse mode (NVDA), ENTER key is pressed, or;
        // 2. When scan mode is off (Windows Narrator) or in focus mode (NVDA), CAPSLOCK + ENTER is pressed
        //
        // Although `document.activeElement` (a.k.a. primary focus) is on the transcript,
        // when ENTER key is pressed with screen reader in scan mode, screen reader will
        // "do primary action", which ask the browser to send a `click` event to the
        // active descendant (a.k.a. focused activity).
        //
        // While outside of scan mode, this will also capture CAPSLOCK + ENTER,
        // which is a key combo for "do primary action" or "activates the current navigator object".
        //
        // We cannot capture plain ENTER key outside of scan mode here.
        // We can only capture it on `keydown` event fired to the transcript element.
        //
        // Also see https://github.com/nvaccess/nvda/issues/7898.

        if (
          // The followings are for Windows Narrator:
          // - When scan mode is on
          //   - Press ENTER will dispatch "click" event to the <li> element
          //   - This is called "Do primary action"
          target === currentTarget ||
          // The followings are for NVDA:
          // - When in browse mode (red border), and the red box is around the <ScreenReaderActivity>
          //   - The much simplified DOM tree: <li><article><p>...</p></article></li>
          //   - Press ENTER will dispatch `click` event
          //      - NVDA 2020.2 (buggy): In additional to ENTER, when navigating using UP/DOWN arrow keys, it dispatch "click" event to the <article> element
          //      - NVDA 2021.2: After press ENTER, it dispatch 2 `click` events. First to the <article> element, then to the element currently bordered in red (e.g. <p>)
          //   - Perhaps, we should add role="application" to container of Web Chat to disable browse mode, as we are not a web document and already offered a full-fledge navigation experience
          document.getElementById(currentTarget.getAttribute('aria-labelledby')).contains(target as HTMLElement)
        ) {
          // Focus on the first tabbable element inside the activity.
          tabbableElements(bodyRef.current)[0]?.focus();
        }
      },
      [bodyRef]
    );

    // When a child of the activity receives focus, notify the transcript to set the `aria-activedescendant` to this activity.
    const handleFocus: FocusEventHandler = useCallback(() => focusSelf(false), [focusSelf]);

    const handleKeyDown: KeyboardEventHandler = useCallback(
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
    // We should do the same for mouse, that is why we have the mouse down handler here.
    // We are doing it in event capture phase to prevent other components from stopping event propagation to us.
    const handleMouseDownCapture: MouseEventHandler = useCallback(
      ({ target }) => {
        const element = target as HTMLLIElement;
        const tabIndex = getTabIndex(element);

        // If mouse down on an element which is not tabbable, then, focus-self.
        if (typeof tabIndex !== 'number' || tabIndex < 0 || element.getAttribute('aria-disabled') === 'true') {
          focusSelf(false);
        }
      },
      [focusSelf]
    );

    // If "webchat:fallback-text" field is set to empty string, the activity must not be narrated.
    // TODO: [P*] Add test.
    const supportScreenReader = activity.channelData?.['webchat:fallback-text'] !== '';

    // TODO: [P*] Fix this.
    const isContentInteractive = false;

    const handleSentinelFocus: () => void = useCallback(() => focusSelf(), [focusSelf]);

    return (
      <li
        aria-labelledby={supportScreenReader ? ariaLabelId : undefined}
        className={classNames('webchat__basic-transcript__activity', {
          'webchat__basic-transcript__activity--acknowledged': acknowledged,
          'webchat__basic-transcript__activity--read': read
        })}
        // "id" is required for aria-activedescendant.
        // eslint-disable-next-line react/forbid-dom-props
        id={id}
        // This is for capturing "do primary action" done by the screen reader.
        // With screen reader, will narrate "Press ENTER to interact". But in scan mode, ENTER means "do primary action".
        // If `onClick` is set, screen reader will send click event when "do primary action".
        // Related to #4020.
        onClick={handleClick}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        // When NVDA is in browse mode, using up/down arrow key to "browse" will dispatch "click" and "mousedown" events for <article> element (inside <ScreenReaderActivity>).
        onMouseDownCapture={handleMouseDownCapture}
        ref={ref}
      >
        {/* TODO: [P*] Fix double narration. */}
        {supportScreenReader && (
          <ScreenReaderActivity activity={activity} id={ariaLabelId} renderAttachments={false}>
            {!!isContentInteractive && <p>{activityInteractiveAlt}</p>}
          </ScreenReaderActivity>
        )}
        {/* TODO: [P*] Consider focus trap. */}
        <FocusRedirector className="webchat__basic-transcript__activity-sentinel" onFocus={handleSentinelFocus} />
        <div className="webchat__basic-transcript__activity-box" ref={bodyRef}>
          {children}
        </div>
        {shouldSpeak && <SpeakActivity activity={activity} />}
        <FocusRedirector className="webchat__basic-transcript__activity-sentinel" onFocus={handleSentinelFocus} />
        <div
          className={classNames('webchat__basic-transcript__activity-indicator', {
            'webchat__basic-transcript__activity-indicator--focus': isActiveDescendant
          })}
        />
      </li>
    );
  }
);

ActivityRow.defaultProps = {
  children: undefined,
  shouldSpeak: false
};

ActivityRow.propTypes = {
  activity: PropTypes.shape({
    channelData: PropTypes.shape({
      'webchat:fallback-text': PropTypes.string
    })
  }).isRequired,
  activityKey: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
  shouldSpeak: PropTypes.bool
};

export default ActivityRow;
