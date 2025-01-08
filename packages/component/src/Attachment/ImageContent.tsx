import React, { memo } from 'react';

import FixedWidthImage from '../Utils/FixedWidthImage';

const ImageContent = memo(
  ({
    alt,
    src
  }: Readonly<{
    alt?: string;
    src: string;
  }>) => <FixedWidthImage alt={alt || ''} src={src} />
);

export default ImageContent;
