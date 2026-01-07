import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import React, { memo } from 'react';
import { literal, object, pipe, readonly, string, union, type InferInput } from 'valibot';

import styles from './SayAlt.module.css';

const sayAltPropsSchema = pipe(
  object({
    speak: union([literal(false), string()])
  }),
  readonly()
);

type SayAltProps = InferInput<typeof sayAltPropsSchema>;

const SayAlt = (props: SayAltProps) => {
  const { speak } = validateProps(sayAltPropsSchema, props);
  const classNames = useStyles(styles);

  return !!speak && <pre className={classNames['say-alt']}>{speak}</pre>;
};

export default memo(SayAlt);
export { sayAltPropsSchema, type SayAltProps };
