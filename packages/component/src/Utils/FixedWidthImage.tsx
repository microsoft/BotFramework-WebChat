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
    overflow: 'hidden',
    position: 'relative',

    '& .webchat__fixed-width-image__filler': {
      visibility: 'hidden',
      width: '100%'
    },

    '& .webchat__fixed-width-image__image': {
      left: '50%',
      objectFit: 'cover',
      position: 'absolute',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: '100%'
    }
  }
};

/**
 * Shows the image with fixed width but cropped top/bottom.
 */
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
      <img alt="" className="webchat__fixed-width-image__filler" role="none" src={src} />
      <img alt={alt} className="webchat__fixed-width-image__image" src={src} />
    </div>
  )
);

FixedWidthImage.displayName = 'FixedWidthImage';

export default FixedWidthImage;
