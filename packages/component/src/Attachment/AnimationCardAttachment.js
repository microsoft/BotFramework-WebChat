import memoize from 'memoize-one';
import React from 'react';

import { AdaptiveCardBuilder } from '../Utils/AdaptiveCardBuilder';
import CommonCard from './CommonCard';
import connectToWebChat from '../connectToWebChat';
import ImageContent from './ImageContent';
import VideoContent from './VideoContent';

class AnimationCardAttachment extends React.Component {
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
    const { props: { adaptiveCards, attachment, styleSet } } = this;
    const { content = {} } = attachment || {};

    return (
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
    );
  }
}

export default connectToWebChat(
  ({ styleSet }) => ({ styleSet })
)(AnimationCardAttachment)
