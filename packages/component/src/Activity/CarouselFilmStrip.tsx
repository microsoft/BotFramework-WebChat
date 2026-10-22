/* eslint complexity: ["error", 30] */

import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import cx from 'classnames';
import { useItemContainerCallbackRef, useScrollableCallbackRef, useScrollTo } from 'react-film';
import React, { memo, useCallback, type FocusEvent, type KeyboardEvent, type ReactNode } from 'react';
import { boolean, custom, function_, is, literal, object, optional, pipe, readonly, string, union } from 'valibot';

import Bubble from './Bubble';
import CarouselFilmStripAttachment from './CarouselFilmStripAttachment';
import isZeroOrPositive from '../Utils/isZeroOrPositive';
import ScreenReaderText from '../ScreenReaderText';
import textFormatToContentType from '../Utils/textFormatToContentType';
import useLocalizeActivityGreetingAlt from '../hooks/internal/useLocalizeActivityGreetingAlt.js';

import styles from './CarouselFilmStrip.module.css';

const { useAvatarForBot, useAvatarForUser, useDirection, useLocalizer, useStyleOptions } = hooks;

// Controls without their own LEFT/RIGHT behavior. Inputs that use arrow keys (text, number, date, radio, range, select)
// and media are left out. Adaptive Cards render a `selectAction` as `[role="button"]` or, for Action.OpenUrl,
// `[role="link"]`.
const CONTROLS_WITHOUT_ARROW_KEYS_SELECTOR =
  'a[href], button, input[type="button"], input[type="checkbox"], input[type="reset"], input[type="submit"], [role="button"], [role="link"]';

const carouselFilmStripPropsSchema = pipe(
  object({
    activity: custom<WebChatActivity>(value => is(object({}), value)),
    className: optional(string()),
    hideTimestamp: optional(boolean()),
    // Legacy render functions use `custom()` to keep their signatures, as `createActivityPolymiddlewareFromLegacy.tsx`
    // does: `pipe(function_(), args(), returns())` would type them as `(...args: unknown[]) => unknown`.
    renderActivityStatus: optional(
      union([
        literal(false),
        custom<(options: { readonly hideTimestamp: boolean }) => ReactNode>(value => is(function_(), value))
      ])
    ),
    renderAttachment: custom<
      (options: { readonly activity: WebChatActivity; readonly attachment: unknown }) => ReactNode
    >(value => is(function_(), value)),
    renderAvatar: optional(
      union([
        literal(false),
        custom<(options: { readonly activity: WebChatActivity }) => ReactNode>(value => is(function_(), value))
      ])
    ),
    showCallout: optional(boolean())
  }),
  readonly()
);

type CarouselFilmStripProps = InferReactProps<typeof carouselFilmStripPropsSchema>;

function CarouselFilmStrip(props: CarouselFilmStripProps) {
  const {
    activity,
    className = '',
    hideTimestamp = false,
    renderActivityStatus = false,
    renderAttachment,
    renderAvatar = false,
    showCallout = false
  } = validateProps(carouselFilmStripPropsSchema, props);

  const [{ bubbleNubOffset, bubbleNubSize, bubbleFromUserNubOffset, bubbleFromUserNubSize }] = useStyleOptions();
  const [{ initials: botInitials }] = useAvatarForBot();
  const [{ initials: userInitials }] = useAvatarForUser();
  const [direction] = useDirection();
  const localize = useLocalizer();
  const showActivityStatus = typeof renderActivityStatus === 'function';
  const classNames = useStyles(styles);

  const itemContainerCallbackRef = useItemContainerCallbackRef();
  const scrollableCallbackRef = useScrollableCallbackRef();
  const scrollTo = useScrollTo();

  // When the keyboard moves the focus into a card from outside of it (TAB or SHIFT-TAB), center the card with react-film,
  // as LEFT/RIGHT do, instead of leaving it partially visible. Clicking a card or button is not :focus-visible and does not
  // scroll; text inputs are, so the card is centered for typing.
  const handleAttachmentsFocus = useCallback(
    ({ currentTarget, relatedTarget, target }: FocusEvent<HTMLUListElement>) => {
      const cards = Array.from(currentTarget.children);

      const index = cards.findIndex(card => card.contains(target));

      ~index && !cards[+index].contains(relatedTarget) && target.matches(':focus-visible') && scrollTo(() => index);
    },
    [scrollTo]
  );

  // When a card itself has focus (not a control inside it), LEFT/RIGHT move the focus to the previous/next card
  // (mirrored in RTL), HOME/END to the first/last card. This is a shortcut: every card is still a tab stop.
  const handleAttachmentsKeyDown = useCallback(
    (event: KeyboardEvent<HTMLUListElement>) => {
      const { altKey, ctrlKey, currentTarget, key, metaKey, shiftKey, target } = event;
      const cards = Array.from(currentTarget.children).filter(
        (card): card is HTMLElement => card instanceof HTMLElement
      );

      const index = cards.findIndex(card => card === target);
      const rtl = direction === 'rtl';

      if (altKey || ctrlKey || metaKey || shiftKey) {
        return;
      }

      if (!~index) {
        // On a button, link, or checkbox inside a card, LEFT/RIGHT do nothing. Otherwise, the browser would scroll the
        // carousel and react-film would center the card again, or, on a held key, scroll the control out of view.
        (key === 'ArrowLeft' || key === 'ArrowRight') &&
          target instanceof Element &&
          target.matches(CONTROLS_WITHOUT_ARROW_KEYS_SELECTOR) &&
          event.preventDefault();

        return;
      }

      let nextIndex;

      switch (key) {
        case 'ArrowLeft':
          nextIndex = rtl ? index + 1 : index - 1;
          break;

        case 'ArrowRight':
          nextIndex = rtl ? index - 1 : index + 1;
          break;

        case 'End':
          nextIndex = cards.length - 1;
          break;

        case 'Home':
          nextIndex = 0;
          break;

        default:
          return;
      }

      nextIndex = Math.max(0, Math.min(cards.length - 1, nextIndex));

      event.preventDefault();

      // Center the card with react-film, as the flippers do, instead of the native scroll on focus.
      cards[+nextIndex].focus({ preventScroll: true });
      scrollTo(() => nextIndex);
    },
    [direction, scrollTo]
  );

  const isMessageOrTyping = activity.type === 'message' || activity.type === 'typing';

  const activityDisplayText = isMessageOrTyping && (activity.channelData?.messageBack?.displayText || activity.text);
  const attachments = (isMessageOrTyping && activity.attachments) || [];
  const fromUser = activity.from?.role === 'user';

  const [greetingAlt] = useLocalizeActivityGreetingAlt()(activity);

  const initials = fromUser ? userInitials : botInitials;
  const nubOffset = fromUser ? bubbleFromUserNubOffset : bubbleNubOffset;
  const nubSize = fromUser ? bubbleFromUserNubSize : bubbleNubSize;
  const otherInitials = fromUser ? botInitials : userInitials;
  const otherNubSize = fromUser ? bubbleNubSize : bubbleFromUserNubSize;

  const hasAvatar = initials || typeof initials === 'string';
  const hasOtherAvatar = otherInitials || typeof otherInitials === 'string';
  const hasNub = typeof nubSize === 'number';
  const hasOtherNub = typeof otherNubSize === 'number';
  const topAlignedCallout = isZeroOrPositive(nubOffset);

  const extraTrailing = !hasOtherAvatar && hasOtherNub; // This is for bot message with user nub and no user avatar. And vice versa.

  const showAvatar = showCallout && hasAvatar && !!renderAvatar;
  const showNub = showCallout && hasNub && (topAlignedCallout || !attachments.length);

  const hideNub = hasNub && !showNub;

  return (
    <div
      className={cx(
        classNames['carousel-filmstrip'],
        {
          [classNames['carousel-filmstrip--extra-trailing']]: extraTrailing,
          [classNames['carousel-filmstrip--hide-avatar']]: hasAvatar && !showAvatar,
          [classNames['carousel-filmstrip--hide-nub']]: hideNub,
          [classNames['carousel-filmstrip--no-message']]: !activityDisplayText,
          [classNames['carousel-filmstrip--show-avatar']]: showAvatar,
          [classNames['carousel-filmstrip--show-nub']]: showNub,
          [classNames['carousel-filmstrip--top-callout']]: topAlignedCallout
        },
        'react-film__filmstrip',
        className
      )}
      ref={scrollableCallbackRef}
    >
      <div className={classNames['carousel-filmstrip__main']}>
        <div className={classNames['carousel-filmstrip__avatar-gutter']}>
          {showAvatar && renderAvatar({ activity })}
        </div>
        <div className={classNames['carousel-filmstrip__content']}>
          {!!activityDisplayText && (
            <div
              aria-roledescription={localize('ACTIVITY_MESSAGE_ARIA_ROLE_ALT')}
              className={classNames['carousel-filmstrip__message']}
              role="group"
            >
              <ScreenReaderText text={greetingAlt} />
              <Bubble
                className={classNames['carousel-filmstrip__bubble']}
                fromUser={fromUser}
                nub={showNub || (hasAvatar || hasNub ? 'hidden' : false)}
              >
                {renderAttachment({
                  activity,
                  attachment: {
                    content: activityDisplayText,
                    contentType: textFormatToContentType('textFormat' in activity ? activity.textFormat : undefined)
                  }
                })}
              </Bubble>
              <div className={classNames['carousel-filmstrip__filler']} />
            </div>
          )}
          <div className={classNames['carousel-filmstrip__complimentary']}>
            <div className={classNames['carousel-filmstrip__nub-pad']} />
            <div className={classNames['carousel-filmstrip__complimentary-content']}>
              <ul
                className={cx(classNames['carousel-filmstrip__attachments'], 'react-film__filmstrip__list')}
                onFocus={handleAttachmentsFocus}
                onKeyDown={handleAttachmentsKeyDown}
                ref={itemContainerCallbackRef}
              >
                {attachments.map((attachment, index) => (
                  <CarouselFilmStripAttachment
                    activity={activity}
                    attachment={attachment}
                    fromUser={fromUser}
                    hasAvatar={hasAvatar}
                    hideNub={hideNub}
                    index={index}
                    /* Attachments do not have an ID; it is always indexed by number */
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    renderAttachment={renderAttachment}
                    showAvatar={showAvatar}
                    showNub={showNub}
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className={classNames['carousel-filmstrip__alignment-pad']} />
      </div>
      {showActivityStatus && (
        <div className={classNames['carousel-filmstrip__status']}>
          <div className={classNames['carousel-filmstrip__avatar-gutter']} />
          <div className={classNames['carousel-filmstrip__nub-pad']} />
          {renderActivityStatus({ hideTimestamp })}
        </div>
      )}
    </div>
  );
}

CarouselFilmStrip.displayName = 'CarouselFilmStrip';

export default memo(CarouselFilmStrip);
export { carouselFilmStripPropsSchema, type CarouselFilmStripProps };
