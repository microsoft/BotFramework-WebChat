/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 10, 15, 25, 50, 75] }] */

import { hooks } from 'botframework-webchat-component';
import { parseProps } from 'botframework-webchat-component/internal';
import { type DirectLineCardAction } from 'botframework-webchat-core';
import React, { memo, useMemo } from 'react';
import { any, array, boolean, looseObject, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useStyleOptions from '../../hooks/useStyleOptions';
import useAdaptiveCardsPackage from '../hooks/useAdaptiveCardsPackage';
import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';

const { useDirection, useLocalizer } = hooks;

function nullOrUndefined(obj) {
  return obj === null || typeof obj === 'undefined';
}

// TODO: Should build `directLineCardActionSchema`.
const directLineCardActionSchema = pipe(
  looseObject({
    image: optional(string()),
    title: optional(string()),
    type: string(),
    value: optional(string())
  }),
  readonly()
);

const receiptCardContentPropsSchema = pipe(
  object({
    actionPerformedClassName: optional(string(), ''), // TODO: Should remove default value.
    content: pipe(
      object({
        buttons: optional(pipe(array(any()), readonly())),
        facts: optional(
          pipe(
            array(
              pipe(
                object({
                  key: optional(string()),
                  value: optional(string())
                }),
                readonly()
              )
            ),
            readonly()
          )
        ),
        items: optional(
          pipe(
            array(
              pipe(
                object({
                  image: pipe(
                    object({
                      alt: string(),
                      tap: optional(directLineCardActionSchema),
                      url: string()
                    }),
                    readonly()
                  ),
                  price: string(),
                  quantity: optional(string()),
                  subtitle: optional(string()),
                  tap: optional(directLineCardActionSchema),
                  text: optional(string()),
                  title: string()
                }),
                readonly()
              )
            ),
            readonly()
          )
        ),
        tap: optional(directLineCardActionSchema),
        tax: optional(string()),
        title: optional(string()),
        total: optional(string()),
        vat: optional(string())
      }),
      readonly()
    ),
    disabled: optional(boolean())
  }),
  readonly()
);

type ReceiptCardContentProps = InferInput<typeof receiptCardContentPropsSchema>;

function ReceiptCardContent(props: ReceiptCardContentProps) {
  const { actionPerformedClassName, content, disabled } = parseProps(receiptCardContentPropsSchema, props);

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
        items.map(({ image: { alt, tap: imageTap, url } = {}, price, quantity, subtitle, tap, text, title }) => {
          let itemColumns;

          if (url) {
            const [itemImageColumn, ...columns] = builder.addColumnSet([15, 75, 10]);

            itemColumns = columns;
            builder.addImage(url, itemImageColumn, imageTap as DirectLineCardAction, alt);
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
