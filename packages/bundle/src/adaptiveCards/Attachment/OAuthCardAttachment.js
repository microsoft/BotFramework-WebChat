import { hooks } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';

import useAdaptiveCardsPackage from '../../hooks/useAdaptiveCardsPackage';

const { useStyleOptions } = hooks;

const OAuthCardAttachment = ({ attachment: { content } = {} }) => {
  const [adaptiveCards] = useAdaptiveCardsPackage();
  const [styleOptions] = useStyleOptions();

  const builtCard = useMemo(() => {
    if (content) {
      const builder = new AdaptiveCardBuilder(adaptiveCards, styleOptions);

      builder.addCommonHeaders(content);
      builder.addButtons((content || {}).buttons, true);

      return builder.card;
    }
  }, [adaptiveCards, content, styleOptions]);

  return <AdaptiveCardRenderer adaptiveCard={builtCard} />;
};

OAuthCardAttachment.propTypes = {
  attachment: PropTypes.shape({
    content: PropTypes.shape({
      buttons: PropTypes.array
    }).isRequired
  }).isRequired
};

export default OAuthCardAttachment;
