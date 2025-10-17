import { forwardedRef, reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import mergeRefs from 'merge-refs';
import React, { memo, useEffect, useRef } from 'react';
import { object, optional, picklist, pipe, readonly, string, type InferInput } from 'valibot';

import styles from './NonModalPopover.module.css';

const popoverPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    className: optional(string()),
    forwardedRef: optional(forwardedRef()),
    popover: optional(picklist(['auto', 'hint', 'manual']))
  }),
  readonly()
);

type PopoverProps = InferInput<typeof popoverPropsSchema>;

function Popover(props: PopoverProps) {
  const { className, children, forwardedRef, popover } = validateProps(popoverPropsSchema, props);

  const ref = useRef<Element>(null);

  const classNames = useStyles(styles);

  // React 16.8.6 does not support "popover" prop yet.
  useEffect(() => {
    ref &&
      typeof ref === 'object' &&
      'current' in ref &&
      ref.current &&
      ref.current.setAttribute('popover', popover || '');
  }, [popover, ref]);

  return (
    // TODO: [P2] Is it correct to force-cast ref to HTMLDivElement?
    <div className={cx(classNames['popover--non-modal'], className)} ref={mergeRefs(forwardedRef, ref)}>
      {children}
    </div>
  );
}

Popover.displayName = 'Popover';

export default memo(Popover);
export { popoverPropsSchema, type PopoverProps };
