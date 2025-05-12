/* eslint no-magic-numbers: ["error", { "ignore": [25, 75] }] */

import { hooks } from 'botframework-webchat-component';
import React, { memo, useMemo } from 'react';
import { boolean, object, optional, parse, pipe, readonly, string, type InferInput } from 'valibot';

import useStyleOptions from '../../hooks/useStyleOptions';
import useAdaptiveCardsPackage from '../hooks/useAdaptiveCardsPackage';
import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';
import { directLineBasicCardSchema } from './private/directLineSchema';

const { useDirection } = hooks;

const thumbnailCardContentPropsSchema = pipe(
  object({
    actionPerformedClassName: optional(string()),
    content: directLineBasicCardSchema,
    disabled: optional(boolean())
  }),
  readonly()
);

type ThumbnailCardContentProps = InferInput<typeof thumbnailCardContentPropsSchema>;

function ThumbnailCardContent(props: ThumbnailCardContentProps) {
  const { actionPerformedClassName, content, disabled } = parse(thumbnailCardContentPropsSchema, props);

  const [adaptiveCardsPackage] = useAdaptiveCardsPackage();
  const [direction] = useDirection();
  const [styleOptions] = useStyleOptions();

  const builtCard = useMemo(() => {
    if (content) {
      const builder = new AdaptiveCardBuilder(adaptiveCardsPackage, styleOptions, direction);
      const { TextSize, TextWeight } = adaptiveCardsPackage;
      const { buttons, images, subtitle, text, title } = content;
      const { richCardWrapTitle } = styleOptions;

      if (images && images.length) {
        const [firstColumn, lastColumn] = builder.addColumnSet([75, 25]);
        const [{ alt, tap, url }] = images;

        builder.addTextBlock(
          title,
          { size: TextSize.Medium, weight: TextWeight.Bolder, wrap: richCardWrapTitle },
          firstColumn
        );

        builder.addTextBlock(subtitle, { isSubtle: true, wrap: richCardWrapTitle }, firstColumn);
        builder.addImage(url, lastColumn, tap as any, alt);
        builder.addTextBlock(text, { wrap: true });
        builder.addButtons(buttons as any);
      } else {
        builder.addCommon(content as any);
      }
      return builder.card;
    }
  }, [adaptiveCardsPackage, direction, content, styleOptions]);

  return (
    <AdaptiveCardRenderer
      actionPerformedClassName={actionPerformedClassName}
      adaptiveCard={builtCard}
      disabled={disabled}
      tapAction={content && content.tap}
    />
  );
}

export default memo(ThumbnailCardContent);
export { thumbnailCardContentPropsSchema, type ThumbnailCardContentProps };
