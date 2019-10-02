/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 10, 15, 25, 75] }] */

import { connectToWebChat, localize } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';

function nullOrUndefined(obj) {
  return obj === null || typeof obj === 'undefined';
}

const ReceiptCardAttachment = ({
  adaptiveCardHostConfig,
  adaptiveCards,
  attachment: { content },
  language,
  styleSet: { options }
}) => {
  const builtCard = useMemo(() => {
    const builder = new AdaptiveCardBuilder(adaptiveCards, options);
    const { HorizontalAlignment, TextSize, TextWeight } = adaptiveCards;
    const { buttons, facts, items, tax, title, total, vat } = content;
    const { richCardWrapTitle } = options;

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
        items.map(({ image: { tap, url } = {}, price, subtitle, title }) => {
          let itemColumns;

          if (url) {
            const [itemImageColumn, ...columns] = builder.addColumnSet([15, 75, 10]);

            itemColumns = columns;
            builder.addImage(url, itemImageColumn, tap);
          } else {
            itemColumns = builder.addColumnSet([75, 25]);
          }

          const [itemTitleColumn, itemPriceColumn] = itemColumns;

          builder.addTextBlock(
            title,
            { size: TextSize.Medium, weight: TextWeight.Bolder, wrap: richCardWrapTitle },
            itemTitleColumn
          );
          builder.addTextBlock(subtitle, { size: TextSize.Medium, wrap: richCardWrapTitle }, itemTitleColumn);
          builder.addTextBlock(price, { horizontalAlignment: HorizontalAlignment.Right }, itemPriceColumn);
        });

      if (!nullOrUndefined(vat)) {
        const vatCol = builder.addColumnSet([75, 25]);

        builder.addTextBlock(
          localize('VAT', language),
          { size: TextSize.Medium, weight: TextWeight.Bolder },
          vatCol[0]
        );
        builder.addTextBlock(vat, { horizontalAlignment: HorizontalAlignment.Right }, vatCol[1]);
      }

      if (!nullOrUndefined(tax)) {
        const taxCol = builder.addColumnSet([75, 25]);

        builder.addTextBlock(
          localize('Tax', language),
          { size: TextSize.Medium, weight: TextWeight.Bolder },
          taxCol[0]
        );
        builder.addTextBlock(tax, { horizontalAlignment: HorizontalAlignment.Right }, taxCol[1]);
      }

      if (!nullOrUndefined(total)) {
        const totalCol = builder.addColumnSet([75, 25]);

        builder.addTextBlock(
          localize('Total', language),
          { size: TextSize.Medium, weight: TextWeight.Bolder },
          totalCol[0]
        );
        builder.addTextBlock(
          total,
          { horizontalAlignment: HorizontalAlignment.Right, size: TextSize.Medium, weight: TextWeight.Bolder },
          totalCol[1]
        );
      }

      builder.addButtons(buttons);

      return builder.card;
    }
  }, [adaptiveCards, content, language, options]);

  return (
    <AdaptiveCardRenderer
      adaptiveCard={builtCard}
      adaptiveCardHostConfig={adaptiveCardHostConfig}
      tapAction={content && content.tap}
    />
  );
};

ReceiptCardAttachment.propTypes = {
  adaptiveCardHostConfig: PropTypes.any.isRequired,
  adaptiveCards: PropTypes.any.isRequired,
  attachment: PropTypes.shape({
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
            tap: PropTypes.any,
            url: PropTypes.string.isRequired
          }),
          price: PropTypes.string.isRequired,
          subtitle: PropTypes.string,
          title: PropTypes.string.isRequired
        })
      ),
      tap: PropTypes.any,
      tax: PropTypes.string,
      title: PropTypes.string,
      total: PropTypes.string,
      vat: PropTypes.string
    }).isRequired
  }).isRequired,
  language: PropTypes.string.isRequired,
  styleSet: PropTypes.shape({
    options: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ language, styleSet }) => ({ language, styleSet }))(ReceiptCardAttachment);
