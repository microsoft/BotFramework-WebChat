import React from 'react';

import CommonCard from './CommonCard';
import connectToWebChat from '../connectToWebChat';
import VideoContent from './VideoContent';

export default connectToWebChat(
  ({ styleSet }) => ({ styleSet })
)(
  ({
    adaptiveCards,
    attachment,
    attachment: { content = {} } = {},
    styleSet
  }) =>
    <div className={ styleSet.audioCardAttachment }>
      <ul className="media-list">
        {
          content.media.map((media, index) =>
            <li key={ index }>
              <VideoContent
                autoPlay={ content.autostart }
                loop={ content.autoloop }
                poster={ content.image && content.image.url }
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
    </div>
)
