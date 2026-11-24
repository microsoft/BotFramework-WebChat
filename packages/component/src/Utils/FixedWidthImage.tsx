import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo, type SyntheticEvent } from 'react';
import {
  args,
  custom,
  function_,
  instance,
  is,
  object,
  optional,
  pipe,
  readonly,
  returns,
  string,
  tuple,
  void_
} from 'valibot';

import styles from './FixedWidthImage.module.css';

// React calls event handlers with a `SyntheticEvent`, which is not an `Event`, it wraps one in `nativeEvent`.
// `custom()` passes the event as-is, `object()` would pass a copy with only the validated properties.
const imageEventHandlerSchema = pipe(
  function_(),
  args(tuple([custom<SyntheticEvent<HTMLImageElement>>(value => is(object({ nativeEvent: instance(Event) }), value))])),
  returns(void_())
);

const fixedWidthImagePropsSchema = pipe(
  object({
    alt: string(),
    className: optional(string()),
    onError: optional(imageEventHandlerSchema),
    onLoad: optional(imageEventHandlerSchema),
    src: string()
  }),
  readonly()
);

type FixedWidthImageProps = InferReactProps<typeof fixedWidthImagePropsSchema>;

/**
 * Shows the image with fixed width but cropped top/bottom.
 */
function FixedWidthImage(props: FixedWidthImageProps) {
  const { alt, className, onError, onLoad, src } = validateProps(fixedWidthImagePropsSchema, props);

  const classNames = useStyles(styles, webChatPrefixedClassName);

  return (
    <div className={cx(classNames['fixed-width-image'], className)}>
      <img alt="" className={classNames['fixed-width-image__filler']} role="none" src={src} />
      <img alt={alt} className={classNames['fixed-width-image__image']} onError={onError} onLoad={onLoad} src={src} />
    </div>
  );
}

FixedWidthImage.displayName = 'FixedWidthImage';

export default memo(FixedWidthImage);
export { fixedWidthImagePropsSchema, type FixedWidthImageProps };
