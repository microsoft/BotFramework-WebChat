import { validateProps } from 'botframework-webchat-react-valibot';
import classNames from 'classnames';
import React, { useMemo, type CSSProperties } from 'react';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useStyleSet from '../hooks/useStyleSet';

const moddableIconPropsSchema = pipe(
  object({
    className: optional(string()),
    color: optional(string()),
    imageURL: optional(string()),
    maskURL: optional(string()),
    size: optional(string())
  }),
  readonly()
);

type ModdableIconProps = InferInput<typeof moddableIconPropsSchema>;

function ModdableIcon(props: ModdableIconProps) {
  const { className, color, imageURL, maskURL, size } = validateProps(moddableIconPropsSchema, props);

  const [{ moddableIcon: moddableIconClassName }] = useStyleSet();

  const style = useMemo<CSSProperties>(
    () =>
      ({
        '--webchat__moddable-icon--color': color,
        '--webchat__moddable-icon--mask': maskURL && `url(${maskURL})`,
        '--webchat__moddable-icon--image': imageURL && `url(${imageURL})`,
        '--webchat__moddable-icon--size': size
      }) satisfies Record<`--${string}`, number | string | undefined> as any, // csstype.CSSProperties does not allow CSS custom variables yet.
    [color, imageURL, maskURL, size]
  );

  return <div className={classNames('webchat__moddable-icon', moddableIconClassName + '', className)} style={style} />;
}

export default ModdableIcon;
export { moddableIconPropsSchema, type ModdableIconProps };
