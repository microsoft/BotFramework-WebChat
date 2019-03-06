import memoize from 'memoize-one';
import React from 'react';

import { AdaptiveCardBuilder } from '../Utils/AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';

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
    const {
      props: {
        adaptiveCards,
        attachment: { content } = {}
      }
    } = this;

    return (
      <AdaptiveCardRenderer
        adaptiveCard={ content && this.buildCard(adaptiveCards, content) }
        tapAction={ content && content.tap }
      />
    );
  }
}
