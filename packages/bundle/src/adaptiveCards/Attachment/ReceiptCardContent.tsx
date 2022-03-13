/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 10, 15, 25, 50, 75] }] */

import { hooks } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React, { FC, useMemo } from 'react';
import type { DirectLineReceiptCard } from 'botframework-webchat-core';

import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';
import useAdaptiveCardsPackage from '../hooks/useAdaptiveCardsPackage';
import useStyleOptions from '../../hooks/useStyleOptions';

const { useDirection, useLocalizer } = hooks;

function nullOrUndefined(obj) {
  return obj === null || typeof obj === 'undefined';
}

type ReceiptCardContentProps = {
  actionPerformedClassName?: string;
  content: DirectLineReceiptCard;
  disabled?: boolean;
};

const ReceiptCardContent: FC<ReceiptCardContentProps> = ({ actionPerformedClassName, content, disabled }) => {
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
            builder.addImage(url, itemImageColumn, imageTap, alt);
          } else {
            itemColumns = builder.addColumnSet([75, 25], undefined, tap && tap);
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
};

ReceiptCardContent.defaultProps = {
  actionPerformedClassName: '',
  disabled: undefined
};

ReceiptCardContent.propTypes = {
  actionPerformedClassName: PropTypes.string,
  // PropTypes cannot fully capture TypeScript types.
  // @ts-ignore
  content: PropTypes.shape({
    buttons: PropTypes.array,
    facts: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string,
        value: PropTypes.string
      })
    ),
    items: PropTypes.arrayOf(
      PropTypes.shape({
        image: PropTypes.shape({
          alt: PropTypes.string.isRequired,
          tap: PropTypes.any,
          url: PropTypes.string.isRequired
        }),
        price: PropTypes.string.isRequired,
        quantity: PropTypes.string,
        subtitle: PropTypes.string,
        tap: PropTypes.any,
        text: PropTypes.string,
        title: PropTypes.string.isRequired
      })
    ),
    tap: PropTypes.any,
    tax: PropTypes.string,
    title: PropTypes.string,
    total: PropTypes.string,
    vat: PropTypes.string
  }).isRequired,
  disabled: PropTypes.bool
};

export default ReceiptCardContent;
