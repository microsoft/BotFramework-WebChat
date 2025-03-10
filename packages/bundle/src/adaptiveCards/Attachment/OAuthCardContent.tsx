import { hooks } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React, { FC, useMemo } from 'react';
import type { DirectLineOAuthCard } from 'botframework-webchat-core';

import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';
import useAdaptiveCardsPackage from '../hooks/useAdaptiveCardsPackage';
import useStyleOptions from '../../hooks/useStyleOptions';

const { useDirection } = hooks;

type OAuthCardContentProps = {
  actionPerformedClassName?: string;
  content: DirectLineOAuthCard;
  disabled?: boolean;
};

const OAuthCardContent: FC<OAuthCardContentProps> = ({ actionPerformedClassName, content, disabled }) => {
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
  // PropTypes cannot fully capture TypeScript types.
  // @ts-ignore
  content: PropTypes.shape({
    buttons: PropTypes.array
  }).isRequired,
  disabled: PropTypes.bool
};

export default OAuthCardContent;
