import memoize from 'memoize-one';
import React from 'react';

import { AdaptiveCardBuilder } from '../Utils/AdaptiveCardBuilder';
import AudioContent from './AudioContent';
import CommonCard from './CommonCard';
import Context from '../Context';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.buildCard = memoize((adaptiveCards, content) => {
      const builder = new AdaptiveCardBuilder(adaptiveCards);

      (content.images || []).forEach(image => builder.addImage(image.url, null, image.tap));

      builder.addCommon(content);

      return builder.card;
    });
  }

  render() {
    const { props: { attachment } } = this;
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
}
