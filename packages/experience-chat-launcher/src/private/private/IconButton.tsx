import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo, useCallback } from 'react';
import { useRefFrom } from 'use-ref-from';
import { function_, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import styles from './IconButton.module.css';

const iconButtonPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    className: optional(string()),
    onClick: optional(function_())
  }),
  readonly()
);

type IconButtonProps = InferInput<typeof iconButtonPropsSchema>;

// TODO: [P0] Should we make an IconButton polymiddleware and IconButton is based from that?
function IconButton(props: IconButtonProps) {
  const { children, className, onClick } = validateProps(iconButtonPropsSchema, props);
  const classNames = useStyles(styles);

  const onClickRef = useRefFrom(onClick);

  const handleClick = useCallback(() => onClickRef.current?.(), [onClickRef]);

  return (
    <button className={cx(classNames['icon-button'], className)} onClick={handleClick} type="button">
      {children}
    </button>
  );
}

IconButton.displayName = 'IconButton';

export default memo(IconButton);
export { iconButtonPropsSchema, type IconButtonProps };
