import memoize from 'memoize-one';
import React from 'react';

import { AdaptiveCardBuilder } from '../Utils/AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.buildCard = memoize((adaptiveCards, content) => {
      const builder = new AdaptiveCardBuilder(adaptiveCards);
      const { TextSize, TextWeight } = adaptiveCards;

      if (content.images && content.images.length) {
        const columns = builder.addColumnSet([75, 25]);

        builder.addTextBlock(content.title, { size: TextSize.Medium, weight: TextWeight.Bolder }, columns[0]);
        builder.addTextBlock(content.subtitle, { isSubtle: true, wrap: true }, columns[0]);
        builder.addImage(content.images[0].url, columns[1], content.images[0].tap);
        builder.addTextBlock(content.text, { wrap: true });
        builder.addButtons(content.buttons);
      } else {
        builder.addCommon(content);
      }

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
