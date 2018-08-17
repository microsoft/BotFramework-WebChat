import memoize from 'memoize-one';
import React from 'react';

import AdaptiveCardRenderer from './AdaptiveCardRenderer';
import Context from '../Context';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.createAdaptiveCard = memoize((adaptiveCards, content, renderMarkdown) => {
      const card = new adaptiveCards.AdaptiveCard();

      // TODO: Checks if we could make the "renderMarkdown" per card
      //       Because there could be timing difference between .parse and .render, we could be using wrong Markdown engine
      adaptiveCards.AdaptiveCard.processMarkdown = renderMarkdown || (text => text);
      card.parse(content);

      return card;
    });
  }

  render() {
    const { props } = this;

    return (
      <Context.Consumer>
        { ({ adaptiveCards, renderMarkdown }) =>
          <AdaptiveCardRenderer
            adaptiveCard={ this.createAdaptiveCard(adaptiveCards, props.attachment.content, renderMarkdown) }
          />
        }
      </Context.Consumer>
    );
  }
}
