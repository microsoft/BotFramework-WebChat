import { validateProps } from 'botframework-webchat-api/internal';
import classNames from 'classnames';
import React, { memo, useMemo, type CSSProperties } from 'react';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import { useStyleSet } from '../hooks';

const monochromeImageMaskerPropsSchema = pipe(
  object({
    className: optional(string()),
    src: string()
  }),
  readonly()
);

type MonochromeImageMaskerProps = InferInput<typeof monochromeImageMaskerPropsSchema>;

function MonochromeImageMasker(props: MonochromeImageMaskerProps) {
  const { className, src } = validateProps(monochromeImageMaskerPropsSchema, props);

  const [{ monochromeImageMasker }] = useStyleSet();
  const style = useMemo(
    () => ({ '--webchat__monochrome-image-masker__mask-image': `url(${src})` }) as CSSProperties,
    [src]
  );

  return (
    <div className={classNames(monochromeImageMasker, 'webchat__monochrome-image-masker', className)} style={style} />
  );
}

export default memo(MonochromeImageMasker);
export { monochromeImageMaskerPropsSchema, type MonochromeImageMaskerProps };
