import { hooks } from 'botframework-webchat-api';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import cx from 'classnames';
import React from 'react';
import { any, array, boolean, function_, nonNullish, number, object, optional, pipe, readonly, string } from 'valibot';

import Bubble from './Bubble';
import ScreenReaderText from '../ScreenReaderText';

import styles from './CarouselFilmStripAttachment.module.css';

const { useLocalizer } = hooks;

const carouselFilmStripAttachmentPropsSchema = pipe(
  object({
    activity: pipe(
      object({
        attachments: optional(array(any())),
        from: pipe(object({ role: string() }), readonly()),
        text: optional(string()),
        textFormat: optional(string()),
        timestamp: optional(string())
      }),
      readonly()
    ),
    attachment: pipe(object({ content: optional(any()) }), readonly()),
    className: optional(string()),
    fromUser: nonNullish(any()),
    hasAvatar: nonNullish(any()),
    hideNub: boolean(),
    index: number(),
    renderAttachment: function_(),
    showAvatar: boolean(),
    showNub: boolean()
  }),
  readonly()
);

const CarouselFilmStripAttachment = props => {
  const {
    activity,
    attachment,
    className = '',
    fromUser,
    hasAvatar,
    hideNub,
    index,
    renderAttachment,
    showAvatar,
    showNub
  } = validateProps(carouselFilmStripAttachmentPropsSchema, props);

  const localize = useLocalizer();
  const classNames = useStyles(styles);

  const attachedAlt = localize(fromUser ? 'ACTIVITY_YOU_ATTACHED_ALT' : 'ACTIVITY_BOT_ATTACHED_ALT');

  return (
    <li
      aria-roledescription={localize('ACTIVITY_ATTACHMENT_ARIA_ROLE_ALT')}
      className={cx(
        classNames['carousel-filmstrip-attachment'],
        {
          [classNames['carousel-filmstrip-attachment--hide-avatar']]: hasAvatar && !showAvatar,
          [classNames['carousel-filmstrip-attachment--hide-nub']]: hideNub,
          [classNames['carousel-filmstrip-attachment--show-avatar']]: showAvatar,
          [classNames['carousel-filmstrip-attachment--show-nub']]: showNub
        },
        'react-film__filmstrip__item',
        className
      )}
      role="listitem"
      tabIndex={0}
    >
      <ScreenReaderText text={attachedAlt} />
      <Bubble fromUser={fromUser} key={index} nub={false}>
        {renderAttachment({ activity, attachment })}
        <div className={classNames['carousel-filmstrip-attachment--focus']} />
      </Bubble>
    </li>
  );
};

export default CarouselFilmStripAttachment;
