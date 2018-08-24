import memoize from 'memoize-one';
import React from 'react';

import { AdaptiveCardBuilder } from '../Utils/AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';
import Context from '../Context';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.buildCard = memoize((adaptiveCards, content) => {
      const builder = new AdaptiveCardBuilder(adaptiveCards);

      builder.addCommonHeaders(content);
      builder.addButtons(content.buttons, true);

      return builder.card;
    });
  }

  render() {
    const {
      props: {
        attachment: { content } = {}
      }
    } = this;

    return (
      <Context.Consumer>
        { ({ adaptiveCards }) =>
          <AdaptiveCardRenderer
            adaptiveCard={ content && this.buildCard(adaptiveCards, content) }
            tapAction={ content.tap }
          />
        }
      </Context.Consumer>
    );
  }
}
