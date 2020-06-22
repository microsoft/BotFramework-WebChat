import { hooks } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';
import useAdaptiveCardsPackage from '../hooks/useAdaptiveCardsPackage';

const { useDirection, useStyleOptions } = hooks;

const OAuthCardContent = ({ actionPerformedClassName, content, disabled }) => {
  const [adaptiveCardsPackage] = useAdaptiveCardsPackage();
  const [direction] = useDirection();
  const [styleOptions] = useStyleOptions();

  const builtCard = useMemo(() => {
    if (content) {
      const builder = new AdaptiveCardBuilder(adaptiveCardsPackage, styleOptions, direction);

      builder.addCommonHeaders(content);
      builder.addButtons(content.buttons, true);

      return builder.card;
    }
  }, [adaptiveCardsPackage, content, direction, styleOptions]);

  return (
    <AdaptiveCardRenderer
      actionPerformedClassName={actionPerformedClassName}
      adaptiveCard={builtCard}
      disabled={disabled}
    />
  );
};

OAuthCardContent.defaultProps = {
  actionPerformedClassName: '',
  disabled: undefined
};

OAuthCardContent.propTypes = {
  actionPerformedClassName: PropTypes.string,
  content: PropTypes.shape({
    buttons: PropTypes.array
  }).isRequired,
  disabled: PropTypes.bool
};

export default OAuthCardContent;
