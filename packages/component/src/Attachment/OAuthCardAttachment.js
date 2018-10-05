import memoize from 'memoize-one';
import React from 'react';

import { AdaptiveCardBuilder } from '../Utils/AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.buildCard = memoize((adaptiveCards, content) => {
      const builder = new AdaptiveCardBuilder(adaptiveCards);

      builder.addCommonHeaders(content);

      // "signin" button should be converted to "openUrl" with corresponding "?code_challenge" via saga in "botframework-webchat-core"
      // Thus, if we see "signin" button, they are not converted and not ready for the user to click on
      builder.addButtons(content.buttons.filter(({ type }) => type !== 'signin'));

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
      <AdaptiveCardRenderer adaptiveCard={ content && this.buildCard(adaptiveCards, content) } />
    );
  }
}
