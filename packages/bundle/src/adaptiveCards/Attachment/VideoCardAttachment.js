import React from 'react';

import { Components, connectToWebChat } from 'botframework-webchat-component';
import CommonCard from './CommonCard';

const { VideoContent } = Components;

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
