import PropTypes from 'prop-types';
import React, { FC, useMemo } from 'react';

import AdaptiveCardRenderer from './AdaptiveCardRenderer';
import useParseAdaptiveCardJSON from '../hooks/internal/useParseAdaptiveCardJSON';

function stripSubmitAction(card) {
  if (!card.actions) {
    return card;
  }

  // Filter out HTTP action buttons
  const nextActions = card.actions
    .filter(action => action.type !== 'Action.Submit')
    .map(action => (action.type === 'Action.ShowCard' ? { ...action, card: stripSubmitAction(action.card) } : action));

  return { ...card, nextActions };
}

type AdaptiveCardContentProps = {
  actionPerformedClassName?: string;
  content: any;
  disabled?: boolean;
};

const AdaptiveCardContent: FC<AdaptiveCardContentProps> = ({ actionPerformedClassName, content, disabled }) => {
  const parseAdaptiveCardJSON = useParseAdaptiveCardJSON();

  const card = useMemo(
    () =>
      parseAdaptiveCardJSON(
        stripSubmitAction({
          version: '1.0',
          ...(typeof content === 'object' ? content : {})
        }),
        { ignoreErrors: true }
      ),
    [content, parseAdaptiveCardJSON]
  );

  return (
    !!card && (
      <AdaptiveCardRenderer
        actionPerformedClassName={actionPerformedClassName}
        adaptiveCard={card}
        disabled={disabled}
      />
    )
  );
};

AdaptiveCardContent.defaultProps = {
  actionPerformedClassName: '',
  disabled: undefined
};

AdaptiveCardContent.propTypes = {
  actionPerformedClassName: PropTypes.string,
  content: PropTypes.any.isRequired,
  disabled: PropTypes.bool
};

export default AdaptiveCardContent;
