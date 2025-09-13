/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 10, 15, 25, 50, 75] }] */

import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-component';
import { type DirectLineCardAction } from 'botframework-webchat-core';
import React, { memo, useMemo } from 'react';
import { boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useStyleOptions from '../../hooks/useStyleOptions';
import useAdaptiveCardsPackage from '../hooks/useAdaptiveCardsPackage';
import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';
import { directLineReceiptCardSchema } from './private/directLineSchema';

const { useDirection, useLocalizer } = hooks;

function nullOrUndefined(obj) {
  return obj === null || typeof obj === 'undefined';
}

const receiptCardContentPropsSchema = pipe(
  object({
    actionPerformedClassName: optional(string()),
    content: directLineReceiptCardSchema,
    disabled: optional(boolean())
  }),
  readonly()
);

type ReceiptCardContentProps = InferInput<typeof receiptCardContentPropsSchema>;

function ReceiptCardContent(props: ReceiptCardContentProps) {
  const { actionPerformedClassName, content, disabled } = validateProps(receiptCardContentPropsSchema, props);

  const [adaptiveCardsPackage] = useAdaptiveCardsPackage();
  const [direction] = useDirection();
  const [styleOptions] = useStyleOptions();
  const localize = useLocalizer();

  const taxText = localize('RECEIPT_CARD_TAX');
  const totalText = localize('RECEIPT_CARD_TOTAL');
  const vatText = localize('RECEIPT_CARD_VAT');

  const builtCard = useMemo(() => {
    const builder = new AdaptiveCardBuilder(adaptiveCardsPackage, styleOptions, direction);
    const { HorizontalAlignment, TextSize, TextWeight } = adaptiveCardsPackage;
    const { buttons, facts, items, tax, title, total, vat } = content;
    const { richCardWrapTitle } = styleOptions;

    if (content) {
      builder.addTextBlock(title, { size: TextSize.Medium, weight: TextWeight.Bolder, wrap: richCardWrapTitle });

      if (facts) {
        const [firstFactColumn, lastFactColumn] = builder.addColumnSet([75, 25]);

        facts.map(({ key, value }) => {
          builder.addTextBlock(key, { size: TextSize.Medium }, firstFactColumn);
          builder.addTextBlock(
            value,
            { size: TextSize.Medium, horizontalAlignment: HorizontalAlignment.Right },
            lastFactColumn
          );
        });
      }

      items &&
        items.map(({ image, price, quantity, subtitle, tap, text, title }) => {
          let itemColumns;

          if (image?.url) {
            const [itemImageColumn, ...columns] = builder.addColumnSet([15, 75, 10]);

            itemColumns = columns;
            builder.addImage(image?.url, itemImageColumn, image?.tap as DirectLineCardAction, image?.alt);
          } else {
            itemColumns = builder.addColumnSet([75, 25], undefined, tap && (tap as DirectLineCardAction));
          }

          const [itemTitleColumn, itemPriceColumn] = itemColumns;

          builder.addTextBlock(
            quantity ? `${title} &times; ${quantity}` : title,
            { size: TextSize.Medium, weight: TextWeight.Bolder, wrap: richCardWrapTitle },
            itemTitleColumn
          );
          builder.addTextBlock(subtitle, { size: TextSize.Medium, wrap: richCardWrapTitle }, itemTitleColumn);
          builder.addTextBlock(price, { horizontalAlignment: HorizontalAlignment.Right }, itemPriceColumn);

          if (text) {
            builder.addTextBlock(text, { size: TextSize.Medium, wrap: richCardWrapTitle }, itemTitleColumn);
          }
        });

      if (!nullOrUndefined(vat)) {
        const vatCol = builder.addColumnSet([75, 25]);

        builder.addTextBlock(vatText, { size: TextSize.Medium, weight: TextWeight.Bolder }, vatCol[0]);
        builder.addTextBlock(vat, { horizontalAlignment: HorizontalAlignment.Right }, vatCol[1]);
      }

      if (!nullOrUndefined(tax)) {
        const taxCol = builder.addColumnSet([75, 25]);

        builder.addTextBlock(taxText, { size: TextSize.Medium, weight: TextWeight.Bolder }, taxCol[0]);
        builder.addTextBlock(tax, { horizontalAlignment: HorizontalAlignment.Right }, taxCol[1]);
      }

      if (!nullOrUndefined(total)) {
        const totalCol = builder.addColumnSet([75, 25]);

        builder.addTextBlock(totalText, { size: TextSize.Medium, weight: TextWeight.Bolder }, totalCol[0]);
        builder.addTextBlock(
          total,
          { horizontalAlignment: HorizontalAlignment.Right, size: TextSize.Medium, weight: TextWeight.Bolder },
          totalCol[1]
        );
      }

      builder.addButtons(buttons);

      return builder.card;
    }
  }, [adaptiveCardsPackage, content, direction, styleOptions, taxText, totalText, vatText]);

  return (
    <AdaptiveCardRenderer
      actionPerformedClassName={actionPerformedClassName}
      adaptiveCard={builtCard}
      disabled={disabled}
      tapAction={content && content.tap}
    />
  );
}

export default memo(ReceiptCardContent);
export { receiptCardContentPropsSchema, type ReceiptCardContentProps };
