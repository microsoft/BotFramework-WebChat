import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo, useMemo } from 'react';
import { any, boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useParseAdaptiveCardJSON from '../hooks/internal/useParseAdaptiveCardJSON';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';

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

const adaptiveCardContentPropsSchema = pipe(
  object({
    actionPerformedClassName: optional(string()),
    content: optional(any()),
    disabled: optional(boolean())
  }),
  readonly()
);

type AdaptiveCardContentProps = InferInput<typeof adaptiveCardContentPropsSchema>;

function AdaptiveCardContent(props: AdaptiveCardContentProps) {
  const { actionPerformedClassName, content, disabled } = validateProps(adaptiveCardContentPropsSchema, props);

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
}

export default memo(AdaptiveCardContent);
export { adaptiveCardContentPropsSchema, type AdaptiveCardContentProps };
