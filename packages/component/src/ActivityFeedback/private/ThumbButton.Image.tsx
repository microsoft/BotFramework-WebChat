import { validateProps } from 'botframework-webchat-api/internal';
import React, { memo } from 'react';
import { boolean, literal, object, optional, pipe, readonly, string, union, type InferInput } from 'valibot';

import ThumbDislike16Filled from './ThumbDislike16Filled';
import ThumbDislike16Regular from './ThumbDislike16Regular';
import ThumbLike16Filled from './ThumbLike16Filled';
import ThumbLike16Regular from './ThumbLike16Regular';

const thumbButtonImagePropsSchema = pipe(
  object({
    className: optional(string()),
    direction: union([literal('down'), literal('up')]),
    filled: optional(boolean())
  }),
  readonly()
);

type ThumbButtonImageProps = InferInput<typeof thumbButtonImagePropsSchema>;

const ThumbButtonImage = memo((props: ThumbButtonImageProps) => {
  const { className, direction, filled = false } = validateProps(thumbButtonImagePropsSchema, props);

  return direction === 'down' ? (
    filled ? (
      <ThumbDislike16Filled className={className} />
    ) : (
      <ThumbDislike16Regular className={className} />
    )
  ) : filled ? (
    <ThumbLike16Filled className={className} />
  ) : (
    <ThumbLike16Regular className={className} />
  );
});

ThumbButtonImage.displayName = 'ThumbButtonImage';

export default ThumbButtonImage;
export { thumbButtonImagePropsSchema, type ThumbButtonImageProps };
