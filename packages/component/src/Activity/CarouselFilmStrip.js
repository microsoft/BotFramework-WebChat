/* eslint complexity: ["error", 30] */

import { hooks } from 'botframework-webchat-api';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { useItemContainerCallbackRef, useScrollableCallbackRef } from 'react-film';
import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Bubble from './Bubble';
import CarouselFilmStripAttachment from './CarouselFilmStripAttachment';
import isZeroOrPositive from '../Utils/isZeroOrPositive';
import ScreenReaderText from '../ScreenReaderText';
import textFormatToContentType from '../Utils/textFormatToContentType';

import styles from './CarouselFilmStrip.module.css';

const { useAvatarForBot, useAvatarForUser, useDirection, useLocalizer, useStyleOptions } = hooks;

const CarouselFilmStrip = ({
  activity,
  className,
  hideTimestamp,
  renderActivityStatus,
  renderAttachment,
  renderAvatar,
  showCallout
}) => {
  const [{ bubbleNubOffset, bubbleNubSize, bubbleFromUserNubOffset, bubbleFromUserNubSize }] = useStyleOptions();
  const [{ initials: botInitials }] = useAvatarForBot();
  const [{ initials: userInitials }] = useAvatarForUser();
  const [direction] = useDirection();
  const localize = useLocalizer();
  const showActivityStatus = typeof renderActivityStatus === 'function';
  const classNames = useStyles(styles);

  const itemContainerCallbackRef = useItemContainerCallbackRef();
  const scrollableCallbackRef = useScrollableCallbackRef();

  const {
    attachments = [],
    channelData: { messageBack: { displayText: messageBackDisplayText } = {} } = {},
    from: { role } = {},
    text,
    textFormat
  } = activity;

  const activityDisplayText = messageBackDisplayText || text;
  const fromUser = role === 'user';

  const greetingAlt = (
    fromUser ? localize('ACTIVITY_YOU_SAID_ALT') : localize('ACTIVITY_BOT_SAID_ALT', botInitials || '')
  ).replace(/\s{2,}/gu, ' ');

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
          [classNames['carousel-filmstrip--rtl']]: direction === 'rtl',
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
            <div aria-roledescription="message" className={classNames['carousel-filmstrip__message']} role="group">
              <ScreenReaderText text={greetingAlt} />
              <Bubble
                className={classNames['carousel-filmstrip__bubble']}
                fromUser={fromUser}
                nub={showNub || ((hasAvatar || hasNub) && 'hidden')}
              >
                {renderAttachment({
                  activity,
                  attachment: {
                    content: activityDisplayText,
                    contentType: textFormatToContentType(textFormat)
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
};

CarouselFilmStrip.defaultProps = {
  className: '',
  hideTimestamp: false,
  renderActivityStatus: false,
  renderAvatar: false,
  showCallout: false
};

CarouselFilmStrip.propTypes = {
  activity: PropTypes.shape({
    attachments: PropTypes.array,
    channelData: PropTypes.shape({
      messageBack: PropTypes.shape({
        displayText: PropTypes.string
      })
    }),
    from: PropTypes.shape({
      role: PropTypes.string.isRequired
    }).isRequired,
    text: PropTypes.string,
    textFormat: PropTypes.string,
    timestamp: PropTypes.string
  }).isRequired,
  className: PropTypes.string,
  hideTimestamp: PropTypes.bool,
  renderActivityStatus: PropTypes.oneOfType([PropTypes.oneOf([false]), PropTypes.func]),
  renderAttachment: PropTypes.func.isRequired,
  renderAvatar: PropTypes.oneOfType([PropTypes.oneOf([false]), PropTypes.func]),
  showCallout: PropTypes.bool
};

export default CarouselFilmStrip;
