import React from 'react';

import AudioContent from './AudioContent';
import CommonCard from './CommonCard';
import connectWithContext from '../connectWithContext';

export default connectWithContext(
  ({ styleSet }) => ({ styleSet })
)(
  ({
    adaptiveCards,
    attachment,
    attachment: { content = {} } = {}
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
