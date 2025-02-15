import React, { memo } from 'react';

import ThumbDislike16Filled from './ThumbDislike16Filled';
import ThumbDislike16Regular from './ThumbDislike16Regular';
import ThumbLike16Filled from './ThumbLike16Filled';
import ThumbLike16Regular from './ThumbLike16Regular';

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
