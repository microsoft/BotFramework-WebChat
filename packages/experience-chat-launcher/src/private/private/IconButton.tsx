import { reactNode, refObject, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import { useRefFrom } from 'use-ref-from';
import { function_, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import styles from './IconButton.module.css';

const iconButtonPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    className: optional(string()),
    onClick: optional(function_()),
    popoverTargetRef: optional(refObject<HTMLElement>())
  }),
  readonly()
);

type IconButtonProps = InferInput<typeof iconButtonPropsSchema>;

// TODO: [P0] Should we make an IconButton polymiddleware and IconButton is based from that?
function IconButton(props: IconButtonProps) {
  const { children, className, onClick, popoverTargetRef } = validateProps(iconButtonPropsSchema, props);
  const classNames = useStyles(styles);

  const onClickRef = useRefFrom(onClick);
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(() => onClickRef.current?.(), [onClickRef]);

  useEffect(() => {
    if (ref.current) {
      ref.current.popoverTargetElement = popoverTargetRef?.current || null;
    }
  }, [popoverTargetRef, ref]);

  return (
    <button className={cx(classNames['icon-button'], className)} onClick={handleClick} ref={ref} type="button">
      {children}
    </button>
  );
}

IconButton.displayName = 'IconButton';

export default memo(IconButton);
export { iconButtonPropsSchema, type IconButtonProps };
