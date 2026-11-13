/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2] }] */
/* eslint react/no-unsafe: off */

import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import { SendBoxMiddlewareProxy, hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { memo, useRef } from 'react';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import BasicConnectivityStatus from './BasicConnectivityStatus';
import BasicToaster from './BasicToaster';
import BasicTranscript from './BasicTranscript';
import AccessKeySinkSurface from './Utils/AccessKeySink/Surface';

import styles from './BasicWebChat.module.css';

const { useStyleOptions } = hooks;

const basicWebChatPropsSchema = pipe(
  object({
    className: optional(string()),
    role: optional(string())
  }),
  readonly()
);

type BasicWebChatProps = InferInput<typeof basicWebChatPropsSchema>;

function BasicWebChat(props: BasicWebChatProps) {
  const { className, role } = validateProps(basicWebChatPropsSchema, props, 'strict');

  const rootRef = useRef<HTMLDivElement>(null);
  // Keeps the "webchat__surface" class name.
  const basicWebChatClassNames = useStyles(styles, webChatPrefixedClassName);
  const [options] = useStyleOptions();

  return (
    <AccessKeySinkSurface
      className={classNames(basicWebChatClassNames['surface'], className)}
      ref={rootRef}
      role={role}
    >
      {!options.hideToaster && <BasicToaster className={basicWebChatClassNames['surface__toaster']} />}
      <BasicTranscript className={basicWebChatClassNames['surface__transcript']} />
      <BasicConnectivityStatus className={basicWebChatClassNames['surface__connectivity-status']} />
      <SendBoxMiddlewareProxy className={basicWebChatClassNames['surface__send-box']} request={undefined} />
    </AccessKeySinkSurface>
  );
}

export default memo(BasicWebChat);
export { basicWebChatPropsSchema, type BasicWebChatProps };
