/* eslint react/no-array-index-key: "off" */

import { Components, connectToWebChat } from 'botframework-webchat-component';
import React from 'react';

import CommonCard from './CommonCard';

const { AudioContent } = Components;

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
              <AudioContent
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
