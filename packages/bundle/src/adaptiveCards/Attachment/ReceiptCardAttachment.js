/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 10, 15, 25, 75] }] */

import { connectToWebChat, localize } from 'botframework-webchat-component';
import memoize from 'memoize-one';
import PropTypes from 'prop-types';
import React from 'react';

import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';

function nullOrUndefined(obj) {
  return obj === null || typeof obj === 'undefined';
}

class ReceiptCardAttachment extends React.Component {
  constructor(props) {
    super(props);

    this.buildCard = memoize((adaptiveCards, { buttons, facts, items, tax, title, total, vat }, language) => {
      const builder = new AdaptiveCardBuilder(adaptiveCards);
      const { HorizontalAlignment, TextSize, TextWeight } = adaptiveCards;

      builder.addTextBlock(title, { size: TextSize.Medium, weight: TextWeight.Bolder });

      if (facts) {
        const [firstFactColumn, lastFactColumn] = builder.addColumnSet([75, 25]);

        // tslint:disable-next-line:no-unused-expression
        facts.map(({ key, value }) => {
          builder.addTextBlock(key, { size: TextSize.Medium }, firstFactColumn);
          builder.addTextBlock(
            value,
            { size: TextSize.Medium, horizontalAlignment: HorizontalAlignment.Right },
            lastFactColumn
          );
        });
      }

      // tslint:disable-next-line:no-unused-expression
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
            { size: TextSize.Medium, weight: TextWeight.Bolder, wrap: true },
            itemTitleColumn
          );
          builder.addTextBlock(subtitle, { size: TextSize.Medium, wrap: true }, itemTitleColumn);
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
    });
  }

  render() {
    const { adaptiveCardHostConfig, adaptiveCards, attachment: { content } = {}, language } = this.props;

    return (
      <AdaptiveCardRenderer
        adaptiveCard={content && this.buildCard(adaptiveCards, content, language)}
        adaptiveCardHostConfig={adaptiveCardHostConfig}
        tapAction={content && content.tap}
      />
    );
  }
}

ReceiptCardAttachment.propTypes = {
  adaptiveCardHostConfig: PropTypes.any.isRequired,
  adaptiveCards: PropTypes.any.isRequired,
  attachment: PropTypes.shape({
    content: PropTypes.shape({
      buttons: PropTypes.array,
      fact: PropTypes.arrayOf(
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
      tax: PropTypes.string,
      title: PropTypes.string,
      total: PropTypes.string,
      vat: PropTypes.string
    }).isRequired
  }).isRequired,
  language: PropTypes.string.isRequired
};

export default connectToWebChat(({ language }) => ({ language }))(ReceiptCardAttachment);
