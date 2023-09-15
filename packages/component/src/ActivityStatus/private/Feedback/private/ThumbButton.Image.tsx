import React, { memo } from 'react';

import ThumbDislike16Filled from './icons/ThumbDislike16Filled';
import ThumbDislike16Regular from './icons/ThumbDislike16Regular';
import ThumbLike16Filled from './icons/ThumbLike16Filled';
import ThumbLike16Regular from './icons/ThumbLike16Regular';

type Props = Readonly<{
  className?: string;
  direction: 'down' | 'up';
  filled?: boolean;
}>;

const ThumbButtonImage = memo(({ className, direction, filled = false }: Props) =>
  direction === 'down' ? (
    filled ? (
      <ThumbDislike16Filled className={className} />
    ) : (
      <ThumbDislike16Regular className={className} />
    )
  ) : filled ? (
    <ThumbLike16Filled className={className} />
  ) : (
    <ThumbLike16Regular className={className} />
  )
);

ThumbButtonImage.displayName = 'ThumbButtonImage';

export default ThumbButtonImage;
