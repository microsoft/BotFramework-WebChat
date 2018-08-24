import memoize from 'memoize-one';
import React from 'react';

import CommonCard from './CommonCard';
import Context from '../Context';
import VideoContent from './VideoContent';

export default class extends React.Component {
  render() {
    const { props: { attachment } } = this;
    const { content = {} } = attachment || {};

    return (
      <Context.Consumer>
        { ({ styleSet }) =>
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
            <CommonCard attachment={ attachment } />
          </div>
        }
      </Context.Consumer>
    );
  }
}
