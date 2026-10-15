import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-component';
import React, { memo, useMemo } from 'react';
import { boolean, object, optional, pipe, readonly, string } from 'valibot';

import useStyleOptions from '../../hooks/useStyleOptions';
import useAdaptiveCardsPackage from '../hooks/useAdaptiveCardsPackage';
import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';
import { directLineSignInCardSchema } from './private/directLineSchema';

const { useDirection } = hooks;

const oauthCardContentPropsSchema = pipe(
  object({
    actionPerformedClassName: optional(string()),
    content: directLineSignInCardSchema,
    disabled: optional(boolean()),
    replyToId: optional(string())
  }),
  readonly()
);

type OAuthCardContentProps = InferReactProps<typeof oauthCardContentPropsSchema>;

function OAuthCardContent(props: OAuthCardContentProps) {
  const { actionPerformedClassName, content, disabled, replyToId } = validateProps(oauthCardContentPropsSchema, props);

  const [adaptiveCardsPackage] = useAdaptiveCardsPackage();
  const [direction] = useDirection();
  const [styleOptions] = useStyleOptions();

  const builtCard = useMemo(() => {
    if (content) {
      const builder = new AdaptiveCardBuilder(adaptiveCardsPackage, styleOptions, direction);

      builder.addCommonHeaders(content as any);
      builder.addButtons(content.buttons as any, true);

      return builder.card;
    }
  }, [adaptiveCardsPackage, content, direction, styleOptions]);

  return (
    <AdaptiveCardRenderer
      actionPerformedClassName={actionPerformedClassName}
      adaptiveCard={builtCard}
      disabled={disabled}
      replyToId={replyToId}
    />
  );
}

export default memo(OAuthCardContent);
export { oauthCardContentPropsSchema, type OAuthCardContentProps };
