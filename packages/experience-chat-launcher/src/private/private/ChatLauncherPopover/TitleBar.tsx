import { refObject, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import React, { forwardRef, memo } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import DismissButton from './DismissButton';
import RestartButton from './RestartButton';
import styles from './TitleBar.module.css';
import TitleText from './TitleText';

const titleBarPropsSchema = pipe(
  object({
    popoverRef: optional(refObject<Element>())
  }),
  readonly()
);

type TitleBarProps = InferInput<typeof titleBarPropsSchema>;

function TitleBar(props: TitleBarProps) {
  const { popoverRef } = validateProps(titleBarPropsSchema, props);

  const classNames = useStyles(styles);

  return (
    <div className={classNames['chat-launcher-popover__title-bar']}>
      <TitleText>{'Contoso agent'}</TitleText>
      <RestartButton />
      <DismissButton popoverRef={popoverRef} />
    </div>
  );
}

TitleBar.displayName = 'ChatLauncherPopover/TitleBar';

export default memo(forwardRef(TitleBar));
export { titleBarPropsSchema, type TitleBarProps };
