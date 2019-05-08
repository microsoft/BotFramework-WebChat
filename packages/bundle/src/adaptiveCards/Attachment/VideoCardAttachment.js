/* eslint react/no-array-index-key: "off" */

import React from 'react';

import { Components, connectToWebChat } from 'botframework-webchat-component';
import CommonCard from './CommonCard';

const { VideoContent } = Components;

const VideoCardAttachment = ({
  adaptiveCards,
  attachment,
  attachment: {
    content: {
      media,
      autostart,
      autoloop,
      image,
    } = {}
  } = {},
  styleSet
}) =>
  <div className={ styleSet.audioCardAttachment }>
    <ul className="media-list">
      {
        media.map((media, index) =>
          <li key={ index }>
            <VideoContent
              autoPlay={ autostart }
              loop={ autoloop }
              poster={ image && image.url }
              src={ media.url }
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

VideoCardAttachment.defaultProps = {
  adaptiveCards: null,
  attacment: {}
};

VideoCardAttachment.propTypes = {
  adaptiveCards: PropTypes.any,
  attachment: PropTypes.shape({
    content: PropTypes.shape({
      autoloop: PropTypes.bool,
      autostart: PropTypes.bool,
      image: PropTypes.shape({
        url: PropTypes.string
      }),
      media: PropTypes.arrayOf(
        PropTypes.shape({
          url: PropTypes.string
        })
      )
    })
  }),
  styleSet: PropTypes.shape({
    audioCardAttachment: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(
  ({ styleSet }) => ({ styleSet })
)(VideoCardAttachment)
