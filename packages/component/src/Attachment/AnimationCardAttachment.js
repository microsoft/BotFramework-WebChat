import memoize from 'memoize-one';
import React from 'react';

import { AdaptiveCardBuilder } from '../Utils/AdaptiveCardBuilder';
import CommonCard from './CommonCard';
import Context from '../Context';
import ImageContent from './ImageContent';
import VideoContent from './VideoContent';

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
    const { props: { adaptiveCards, attachment } } = this;
    const { content = {} } = attachment || {};

    return (
      <Context.Consumer>
        { ({ styleSet }) =>
          <div className={ styleSet.animationCardAttachment }>
            <ul className="media-list">
              {
                content.media.map((media, index) =>
                  <li key={ index }>
                    {
                      /\.gif$/i.test(media.url) ?
                        <ImageContent
                          alt={ media.profile }
                          src={ media.url }
                        />
                      :
                        <VideoContent
                          alt={ media.profile }
                          src={ media.url }
                        />
                    }
                  </li>
                )
              }
            </ul>
            <CommonCard
              adaptiveCards={ adaptiveCards }
              attachment={ attachment }
            />
          </div>
        }
      </Context.Consumer>
    );
  }
}
