import classNames from 'classnames';
import React, { memo } from 'react';

import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';
import CSSTokens from '../Styles/CSSTokens';

const ROOT_STYLE = {
  '&.webchat__fixed-width-image': {
    display: 'flex',
    justifyContent: 'center',
    maxHeight: CSSTokens.MaxHeightImageBubble,
    minHeight: CSSTokens.MinHeightImageBubble,

    '& .webchat__fixed-width-image__image': {
      objectFit: 'contain',
      width: '100%'
    }
  }
};

const FixedWidthImage = memo(
  ({
    alt,
    className,
    src
  }: Readonly<{
    alt: string;
    className?: string | undefined;
    src: string;
  }>) => (
    <div
      className={classNames(
        'webchat__fixed-width-image',
        useStyleToEmotionObject()(ROOT_STYLE) + '',
        (className || '') + ''
      )}
    >
      <img alt={alt} className="webchat__fixed-width-image__image" src={src} />
    </div>
  )
);

FixedWidthImage.displayName = 'FixedWidthImage';

export default FixedWidthImage;
