import React from 'react';

import { AdaptiveCardBuilder } from '../Utils/AdaptiveCardBuilder';
import { AdaptiveCardRenderer } from './AdaptiveCard';

export default class extends React.Component {
  render() {
    const {
      props: {
        attachment: { content } = {}
      }
    } = this;

    const builder = new AdaptiveCardBuilder();

    (content.images || []).forEach(image => builder.addImage(image.url, null, image.tap));

    builder.addCommon(content);

    return (
      <AdaptiveCardRenderer adaptiveCard={ builder.card } />
    );
  }
}
