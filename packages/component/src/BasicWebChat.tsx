/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2] }] */
/* eslint react/no-unsafe: off */

import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { SendBoxMiddlewareProxy, hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { memo } from 'react';
import { fallback, literal, object, optional, pipe, readonly, string, union, type InferInput } from 'valibot';

import BasicConnectivityStatus from './BasicConnectivityStatus';
import BasicToaster from './BasicToaster';
import BasicTranscript from './BasicTranscript';
import { useStyleToEmotionObject } from './hooks/internal/styleToEmotionObject';
import useStyleSet from './hooks/useStyleSet';
import AccessKeySinkSurface from './Utils/AccessKeySink/Surface';

const { useStyleOptions } = hooks;

const ROOT_STYLE = {
  display: 'flex',
  flexDirection: 'column'
};

const CONNECTIVITY_STATUS_STYLE = {
  flexShrink: 0
};

const SEND_BOX_CSS = {
  flexShrink: 0
};

const TOASTER_STYLE = {
  flexShrink: 0
};

const TRANSCRIPT_STYLE = {
  '.webchat__basic-transcript': {
    flex: 1
  }
};

const basicWebChatPropsSchema = pipe(
  object({
    className: optional(string()),
    role: fallback(
      optional(
        // Subset of landmark roles: https://w3.org/TR/wai-aria/#landmark_roles
        union([literal('complementary'), literal('contentinfo'), literal('form'), literal('main'), literal('region')])
      ),
      // Fallback to "complementary" if specified is not a valid landmark role.
      'complementary'
    )
  }),
  readonly()
);

type BasicWebChatProps = InferInput<typeof basicWebChatPropsSchema>;

function BasicWebChat(props: BasicWebChatProps) {
  const { className, role } = validateProps(basicWebChatPropsSchema, props, 'strict');

  const [{ root: rootStyleSet }] = useStyleSet();
  const [options] = useStyleOptions();
  const styleToEmotionObject = useStyleToEmotionObject();

  const connectivityStatusClassName = styleToEmotionObject(CONNECTIVITY_STATUS_STYLE) + '';
  const rootClassName = styleToEmotionObject(ROOT_STYLE) + '';
  const sendBoxClassName = styleToEmotionObject(SEND_BOX_CSS) + '';
  const toasterClassName = styleToEmotionObject(TOASTER_STYLE) + '';
  const transcriptClassName = styleToEmotionObject(TRANSCRIPT_STYLE) + '';

  return (
    <AccessKeySinkSurface
      className={classNames('webchat__surface', rootClassName, rootStyleSet + '', className)}
      role={role}
    >
      {!options.hideToaster && <BasicToaster className={toasterClassName} />}
      <BasicTranscript className={transcriptClassName} />
      <BasicConnectivityStatus className={connectivityStatusClassName} />
      <SendBoxMiddlewareProxy className={sendBoxClassName} request={undefined} />
    </AccessKeySinkSurface>
  );
}

export default memo(BasicWebChat);
export { basicWebChatPropsSchema, type BasicWebChatProps };
