import PropTypes from 'prop-types';
import React from 'react';

import ReceiptCardContent from './ReceiptCardContent';

const ReceiptCardAttachment = ({ attachment: { content }, disabled }) => (
  <ReceiptCardContent content={content} disabled={disabled} />
);

ReceiptCardAttachment.defaultProps = {
  disabled: undefined
};

ReceiptCardAttachment.propTypes = {
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
  disabled: PropTypes.bool
};

export default ReceiptCardAttachment;
