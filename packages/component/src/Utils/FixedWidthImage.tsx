import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import classNames from 'classnames';
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

import { useStyleToEmotionObject } from '../hooks/internal/styleToEmotionObject';
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

  return (
    <div
      className={classNames(
        'webchat__fixed-width-image',
        useStyleToEmotionObject()(ROOT_STYLE) + '',
        (className || '') + ''
      )}
    >
      <img alt="" className="webchat__fixed-width-image__filler" role="none" src={src} />
      <img alt={alt} className="webchat__fixed-width-image__image" onError={onError} onLoad={onLoad} src={src} />
    </div>
  );
}

FixedWidthImage.displayName = 'FixedWidthImage';

export default memo(FixedWidthImage);
export { fixedWidthImagePropsSchema, type FixedWidthImageProps };
