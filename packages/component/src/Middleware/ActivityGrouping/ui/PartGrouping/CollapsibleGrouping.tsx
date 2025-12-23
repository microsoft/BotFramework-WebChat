import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-api';
import cx from 'classnames';
import random from 'math-random';
import React, { memo, useCallback, useRef, useState } from 'react';
import { boolean, custom, object, optional, pipe, readonly, string, type InferInput } from 'valibot';
import { useRefFrom } from 'use-ref-from';

import ActivityButton from '../../../../Attachment/Text/private/ActivityButton';
import { ComponentIcon } from '../../../../Icon';

import styles from './CollapsibleGrouping.module.css';

const { useLocalizer } = hooks;

const collapsibleGroupingPropsSchema = pipe(
  object({
    children: reactNode(),
    className: optional(string()),
    header: optional(reactNode()),
    isOpen: optional(boolean()),
    onToggle: optional(pipe(custom<(isOpen: boolean) => void>(toggle => typeof toggle === 'function')), readonly())
  }),
  readonly()
);

type CollapsibleGroupingProps = InferInput<typeof collapsibleGroupingPropsSchema>;

function uniqueId(count = Infinity) {
  return (
    random()
      // eslint-disable-next-line no-magic-numbers
      .toString(36)
      // eslint-disable-next-line no-magic-numbers
      .substring(2, 2 + count)
  );
}

function CollapsibleGrouping(props: CollapsibleGroupingProps) {
  const { children, className, header, isOpen = true, onToggle } = validateProps(collapsibleGroupingPropsSchema, props);
  const [id] = useState(() => `webchat-collapsible-grouping-${uniqueId()}`);
  const classNames = useStyles(styles);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isOpenRef = useRefFrom(isOpen);
  const onToggleRef = useRefFrom(onToggle);
  const localize = useLocalizer();

  const handleToggle = useCallback(() => {
    const newIsOpen = !isOpenRef.current;
    const button = buttonRef.current;
    if (button) {
      button.setAttribute('aria-expanded', newIsOpen.toString());
      button.setAttribute('aria-pressed', newIsOpen.toString());
    }
    onToggleRef.current?.(newIsOpen);
  }, [isOpenRef, onToggleRef]);

  const text = isOpen ? localize('COLLAPSE_BUTTON_LESS') : localize('COLLAPSE_BUTTON_MORE');

  return (
    <div
      className={cx(
        classNames['collapsible-grouping'],
        { [classNames['collapsible-grouping--open']]: isOpen },
        className
      )}
    >
      <div className={cx(classNames['collapsible-grouping__header'])}>
        {header}
        <ActivityButton
          aria-controls={id}
          aria-expanded={isOpen}
          aria-pressed={isOpen}
          className={cx(classNames['collapsible-grouping__toggle'])}
          onClick={handleToggle}
          ref={buttonRef}
          text={text}
        >
          <ComponentIcon appearance="text" className={classNames['collapsible-grouping__chevron']} icon="chevron" />
        </ActivityButton>
      </div>
      <div
        className={cx(classNames['collapsible-grouping__content'], {
          [classNames['collapsible-grouping__content--open']]: isOpen
        })}
        // eslint-disable-next-line react/forbid-dom-props
        id={id}
      >
        {children}
      </div>
    </div>
  );
}

export default memo(CollapsibleGrouping);
export { collapsibleGroupingPropsSchema, type CollapsibleGroupingProps };
