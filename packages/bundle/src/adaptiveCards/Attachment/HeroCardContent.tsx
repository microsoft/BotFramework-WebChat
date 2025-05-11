import { hooks } from 'botframework-webchat-component';
import { parseProps } from 'botframework-webchat-component/internal';
import { type DirectLineCardAction } from 'botframework-webchat-core';
import React, { memo, useMemo } from 'react';
import { boolean, custom, object, optional, pipe, readonly, safeParse, string, type InferInput } from 'valibot';

import useStyleOptions from '../../hooks/useStyleOptions';
import useAdaptiveCardsPackage from '../hooks/useAdaptiveCardsPackage';
import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';
import { directLineBasicCardSchema } from './private/directLineSchema';

const { useDirection } = hooks;

const heroCardContentPropsSchema = pipe(
  object({
    actionPerformedClassName: optional(string(), ''), // TODO: Should remove default value.
    content: pipe(
      custom<InferInput<typeof directLineBasicCardSchema>>(value => safeParse(directLineBasicCardSchema, value).success)
    ),
    disabled: optional(boolean())
  }),
  readonly()
);

type HeroCardContentProps = InferInput<typeof heroCardContentPropsSchema>;

function HeroCardContent(props: HeroCardContentProps) {
  const { actionPerformedClassName, content, disabled } = parseProps(heroCardContentPropsSchema, props);

  const [adaptiveCardsPackage] = useAdaptiveCardsPackage();
  const [styleOptions] = useStyleOptions();
  const [direction] = useDirection();

  const builtCard = useMemo(() => {
    const builder = new AdaptiveCardBuilder(adaptiveCardsPackage, styleOptions, direction);

    if (content) {
      // TODO: Need to build `directLineCardActionSchema`.
      (content.images || []).forEach(image =>
        builder.addImage(image.url, null, image.tap as DirectLineCardAction, image.alt)
      );

      // TODO: Need to build `directLineCardActionSchema`.
      builder.addCommon(content as typeof content & { buttons: readonly DirectLineCardAction[] });

      return builder.card;
    }
  }, [adaptiveCardsPackage, content, direction, styleOptions]);

  return (
    <AdaptiveCardRenderer
      actionPerformedClassName={actionPerformedClassName}
      adaptiveCard={builtCard}
      disabled={disabled}
      tapAction={content && content.tap}
    />
  );
}

export default memo(HeroCardContent);
export { heroCardContentPropsSchema, type HeroCardContentProps };
