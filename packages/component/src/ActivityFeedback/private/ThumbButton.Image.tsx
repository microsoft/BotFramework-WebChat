import { validateProps } from 'botframework-webchat-react-valibot';
import React, { memo } from 'react';
import { boolean, literal, object, optional, pipe, readonly, string, union, type InferInput } from 'valibot';

import { ComponentIcon } from '../../Icon';

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

  return (
    <ComponentIcon
      appearance="text"
      className={className}
      icon={
        direction === 'down' ? (filled ? 'thumb-down-filled' : 'thumb-down') : filled ? 'thumb-up-filled' : 'thumb-up'
      }
    />
  );
});

ThumbButtonImage.displayName = 'ThumbButtonImage';

export default ThumbButtonImage;
export { thumbButtonImagePropsSchema, type ThumbButtonImageProps };
