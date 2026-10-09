import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-component';
import React, { memo, useMemo } from 'react';
import { array, boolean, object, optional, pipe, readonly, string } from 'valibot';

import useStyleOptions from '../../hooks/useStyleOptions';
import useAdaptiveCardsPackage from '../hooks/useAdaptiveCardsPackage';
import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';
import directLineCardActionSchema from './private/directLineCardActionSchema';

const { useDirection } = hooks;

const commonCardPropsSchema = pipe(
  object({
    actionPerformedClassName: optional(string()),
    content: object({
      buttons: optional(pipe(array(directLineCardActionSchema), readonly())),
      subtitle: optional(string()),
      text: optional(string()),
      title: optional(string()),
      tap: optional(directLineCardActionSchema)
    }),
    disabled: optional(boolean()),
    replyToId: optional(string())
  }),
  readonly()
);

type CommonCardProps = InferReactProps<typeof commonCardPropsSchema>;

const CommonCard = memo((props: CommonCardProps) => {
  const { actionPerformedClassName, content, disabled, replyToId } = validateProps(commonCardPropsSchema, props);

  const [adaptiveCardsPackage] = useAdaptiveCardsPackage();
  const [direction] = useDirection();
  const [styleOptions] = useStyleOptions();

  const builtCard = useMemo(() => {
    if (content) {
      const builder = new AdaptiveCardBuilder(adaptiveCardsPackage, styleOptions, direction);

      builder.addCommon(content);

      return builder.card;
    }
  }, [adaptiveCardsPackage, content, direction, styleOptions]);

  return (
    <AdaptiveCardRenderer
      actionPerformedClassName={actionPerformedClassName}
      adaptiveCard={builtCard}
      disabled={disabled}
      replyToId={replyToId}
      tapAction={content && content.tap}
    />
  );
});

CommonCard.displayName = 'CommonCard';

export default CommonCard;
