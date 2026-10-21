/* eslint-disable react/no-array-index-key */
import PropTypes from 'prop-types';
import React from 'react';
import { hooks } from 'botframework-webchat-component';

const { useLocalizer } = hooks;

const RichCardAttachment = ({ content = {} }) => {
  const localize = useLocalizer();
  const { buttons, facts, image, images, items, subtitle, tax, text, title, total, vat } = content;

  const taxLabel = localize('RECEIPT_CARD_TAX');
  const totalLabel = localize('RECEIPT_CARD_TOTAL');
  const vatLabel = localize('RECEIPT_CARD_VAT');

  const cardLabel = localize('ATTACHMENT_CARD', title || '', subtitle || '', text || '');

  return (
    <div role="none">
      <div role="none">{cardLabel}</div>
      {!!image && !!image.alt && <img alt={image.alt} />}
      {!!images && !!images.length && images.map(({ alt }, index) => <img alt={alt} key={index} />)}
      {!!facts && !!facts.length && (
        <dl>
          {facts.map(({ key, value }, index) => (
            <React.Fragment key={index}>
              <dt>{key}</dt>
              <dd>{value}</dd>
            </React.Fragment>
          ))}
        </dl>
      )}
      {!!items && !!items.length && (
        <ul>
          {items.map(({ image, price, quantity, subtitle, text, title }, index) => (
            <li key={index}>
              {!!image && !!image.alt && <img alt={image.alt} />}
              {!!title && <p role="none">{title}</p>}
              {!!subtitle && <p role="none">{subtitle}</p>}
              {!!text && <p role="none">{text}</p>}
              {!!quantity && <p role="none">{quantity}</p>}
              {!!price && <p role="none">{price}</p>}
            </li>
          ))}
        </ul>
      )}
      {!!vat && (
        <p role="none">
          {vatLabel} {vat}
        </p>
      )}
      {!!tax && (
        <p role="none">
          {taxLabel} {tax}
        </p>
      )}
      {!!total && (
        <p role="none">
          {totalLabel} {total}
        </p>
      )}
      {!!buttons && !!buttons.length && (
        <div role="none">
          {buttons.map(({ title }, index) => (
            <button key={index} tabIndex={-1} type="button">
              {title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

RichCardAttachment.propTypes = {
  content: PropTypes.any.isRequired
};

export default RichCardAttachment;
