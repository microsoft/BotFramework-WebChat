import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo } from 'react';
import { literal, object, pipe, readonly, string, union, type InferInput } from 'valibot';

import { useStyleToEmotionObject } from '../hooks/internal/styleToEmotionObject';

// TODO: [P3] Although this is for development purpose, prettify it
const ROOT_STYLE = {
  color: 'Red',
  margin: 0
};

const sayAltPropsSchema = pipe(
  object({
    speak: union([literal(false), string()])
  }),
  readonly()
);

type SayAltProps = InferInput<typeof sayAltPropsSchema>;

const SayAlt = (props: SayAltProps) => {
  const { speak } = validateProps(sayAltPropsSchema, props);
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  return !!speak && <pre className={rootClassName}>{speak}</pre>;
};

export default memo(SayAlt);
export { sayAltPropsSchema, type SayAltProps };
