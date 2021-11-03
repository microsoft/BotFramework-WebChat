import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Bubble from './Bubble';
import ScreenReaderText from '../ScreenReaderText';
import useStyleSet from '../hooks/useStyleSet';

const { useDirection, useLocalizer } = hooks;

const CarouselFilmStripAttachment = ({
  activity,
  attachment,
  className,
  fromUser,
  hasAvatar,
  hideNub,
  index,
  renderAttachment,
  showAvatar,
  showNub
}) => {
  const [direction] = useDirection();
  const localize = useLocalizer();
  const [{ carouselFilmStripAttachment: carouselFilmStripAttachmentStyleSet }] = useStyleSet();

  const attachedAlt = localize(fromUser ? 'ACTIVITY_YOU_ATTACHED_ALT' : 'ACTIVITY_BOT_ATTACHED_ALT');

  return (
    <li
      aria-roledescription="attachment"
      className={classNames(
        'webchat__carousel-filmstrip-attachment',
        {
          'webchat__carousel-filmstrip-attachment--hide-avatar': hasAvatar && !showAvatar,
          'webchat__carousel-filmstrip-attachment--hide-nub': hideNub,
          'webchat__carousel-filmstrip-attachment--rtl': direction === 'rtl',
          'webchat__carousel-filmstrip-attachment--show-avatar': showAvatar,
          'webchat__carousel-filmstrip-attachment--show-nub': showNub
        },
        'react-film__filmstrip__item',
        carouselFilmStripAttachmentStyleSet + '',
        (className || '') + ''
      )}
      role="listitem"
      tabIndex={0}
    >
      <ScreenReaderText text={attachedAlt} />
      <Bubble fromUser={fromUser} key={index} nub={false}>
        {renderAttachment({ activity, attachment })}
        <div className="webchat__carousel-filmstrip-attachment--focus" />
      </Bubble>
    </li>
  );
};

CarouselFilmStripAttachment.defaultProps = {
  className: ''
};

CarouselFilmStripAttachment.propTypes = {
  activity: PropTypes.shape({
    attachments: PropTypes.array,
    channelData: PropTypes.shape({
      messageBack: PropTypes.shape({
        displayText: PropTypes.string
      }),
      state: PropTypes.string
    }),
    from: PropTypes.shape({
      role: PropTypes.string.isRequired
    }).isRequired,
    text: PropTypes.string,
    textFormat: PropTypes.string,
    timestamp: PropTypes.string
  }).isRequired,
  attachment: PropTypes.shape({
    content: PropTypes.any
  }).isRequired,
  className: PropTypes.string,
  fromUser: PropTypes.any.isRequired,
  hasAvatar: PropTypes.any.isRequired,
  hideNub: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,
  renderAttachment: PropTypes.func.isRequired,
  showAvatar: PropTypes.bool.isRequired,
  showNub: PropTypes.bool.isRequired
};

export default CarouselFilmStripAttachment;
