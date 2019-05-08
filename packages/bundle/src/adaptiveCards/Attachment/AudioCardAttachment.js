/* eslint react/no-array-index-key: "off" */

import { Components, connectToWebChat } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React from 'react';

import CommonCard from './CommonCard';

const { AudioContent } = Components;

const AudioCardAttachment = ({
  adaptiveCards,
  attachment,
  attachment: {
    content: {
      autostart,
      autoloop,
      image,
      media
    } = {}
  } = {},
  styleSet
}) =>
  <div className={ styleSet.audioCardAttachment }>
    <ul className="media-list">
      {
        media.map(({ url }, index) =>
          <li key={ index }>
            <AudioContent
              autoPlay={ autostart }
              loop={ autoloop }
              poster={ image && image.url }
              src={ url }
            />
          </li>
        )
      }
    </ul>
    <CommonCard
      adaptiveCards={ adaptiveCards }
      attachment={ attachment }
    />
  </div>;

AudioCardAttachment.defaultProps = {
  adaptiveCards: null
};

AudioCardAttachment.propTypes = {
  adaptiveCards: PropTypes.any,
  attachment: PropTypes.shape({
    content: {
      autostart: PropTypes.bool,
      autoloop: PropTypes.bool,
      image: PropTypes.shape({
        url: PropTypes.string.isRequired
      }),
      media: PropTypes.arrayOf(
        PropTypes.shape({
          url: PropTypes.string.isRequired
        }).isRequired
      ).isRequired
    }
  }).isRequired,
  styleSet: PropTypes.shape({
    audioCardAttachment: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(
  ({ styleSet }) => ({ styleSet })
)(AudioCardAttachment)
