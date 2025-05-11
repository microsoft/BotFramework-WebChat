import { hooks } from 'botframework-webchat-component';
import { parseProps } from 'botframework-webchat-component/internal';
import React, { memo, useMemo } from 'react';
import { any, array, boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useStyleOptions from '../../hooks/useStyleOptions';
import useAdaptiveCardsPackage from '../hooks/useAdaptiveCardsPackage';
import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';

const { useDirection } = hooks;

const oauthCardContentPropsSchema = pipe(
  object({
    actionPerformedClassName: optional(string(), ''), // TODO: Should remove default value.
    content: pipe(
      object({
        buttons: pipe(array(any()), readonly())
      }),
      readonly()
    ),
    disabled: optional(boolean())
  }),
  readonly()
);

type OAuthCardContentProps = InferInput<typeof oauthCardContentPropsSchema>;

function OAuthCardContent(props: OAuthCardContentProps) {
  const { actionPerformedClassName, content, disabled } = parseProps(oauthCardContentPropsSchema, props);

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
}

export default memo(OAuthCardContent);
export { oauthCardContentPropsSchema, type OAuthCardContentProps };
