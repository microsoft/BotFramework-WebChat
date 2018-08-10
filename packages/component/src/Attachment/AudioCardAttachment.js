import React from 'react';

import AudioContent from './AudioContent';
import CommonCard from './CommonCard';
import Context from '../Context';

export default ({ attachment }) => {
  const { content = {} } = attachment || {};

  return (
    <Context.Consumer>
      { ({ styleSet }) =>
        <div className={ styleSet.audioCardAttachment }>
          <CommonCard attachment={ attachment } />
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
        </div>
      }
    </Context.Consumer>
  );
}
