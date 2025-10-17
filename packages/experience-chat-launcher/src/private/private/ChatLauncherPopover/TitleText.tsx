import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import styles from './TitleText.module.css';

const titleTextPropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type TitleTextProps = InferInput<typeof titleTextPropsSchema>;

function TitleText(props: TitleTextProps) {
  const { children } = validateProps(titleTextPropsSchema, props);

  const classNames = useStyles(styles);

  return <div className={classNames['chat-launcher-popover__title-text']}>{children}</div>;
}

TitleText.displayName = 'ChatLauncherPopover/TitleText';

export default memo(TitleText);
export { titleTextPropsSchema, type TitleTextProps };
